// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDomainValuator {
    function getDomainValue(uint256 tokenId) external view returns (uint256);
    function getAIScore(uint256 tokenId) external view returns (uint256);
}

contract DomaVault is ReentrancyGuard, Ownable {
    
    IERC721 public domaOwnershipToken;
    IERC20 public usdcToken;
    IDomainValuator public valuator;
    
    uint256 public constant LTV_RATIO = 70;
    uint256 public constant LIQUIDATION_THRESHOLD = 80;
    uint256 public constant INTEREST_RATE = 5;
    
    uint256 public vaultCount;
    uint256 public totalValueLocked;
    uint256 public totalBorrowed;
    
    struct Vault {
        uint256 vaultId;
        address owner;
        uint256 domainTokenId;
        uint256 collateralValue;
        uint256 borrowedAmount;
        uint256 lastUpdated;
        uint256 interestAccrued;
        bool isActive;
        string domainName;
    }
    
    mapping(uint256 => Vault) public vaults;
    mapping(uint256 => uint256) public domainToVault;
    mapping(address => uint256[]) public userVaults;
    
    event VaultCreated(uint256 indexed vaultId, address indexed owner, uint256 domainTokenId, uint256 collateralValue);
    event Borrowed(uint256 indexed vaultId, uint256 amount);
    event Repaid(uint256 indexed vaultId, uint256 amount);
    event Liquidated(uint256 indexed vaultId, address liquidator);
    event CollateralWithdrawn(uint256 indexed vaultId, uint256 domainTokenId);
    
    constructor(
        address _domaOwnershipToken,
        address _usdcToken,
        address _valuator
    ) Ownable(msg.sender) {
        domaOwnershipToken = IERC721(_domaOwnershipToken);
        usdcToken = IERC20(_usdcToken);
        valuator = IDomainValuator(_valuator);
    }
    
    function createVault(uint256 domainTokenId, string memory domainName) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        require(domaOwnershipToken.ownerOf(domainTokenId) == msg.sender, "Not domain owner");
        require(domainToVault[domainTokenId] == 0, "Domain already in vault");
        
        uint256 domainValue = valuator.getDomainValue(domainTokenId);
        require(domainValue > 0, "Invalid domain value");
        
        domaOwnershipToken.transferFrom(msg.sender, address(this), domainTokenId);
        
        vaultCount++;
        uint256 newVaultId = vaultCount;
        
        vaults[newVaultId] = Vault({
            vaultId: newVaultId,
            owner: msg.sender,
            domainTokenId: domainTokenId,
            collateralValue: domainValue,
            borrowedAmount: 0,
            lastUpdated: block.timestamp,
            interestAccrued: 0,
            isActive: true,
            domainName: domainName
        });
        
        domainToVault[domainTokenId] = newVaultId;
        userVaults[msg.sender].push(newVaultId);
        totalValueLocked += domainValue;
        
        emit VaultCreated(newVaultId, msg.sender, domainTokenId, domainValue);
        
        return newVaultId;
    }
    
    function borrow(uint256 vaultId, uint256 amount) 
        external 
        nonReentrant 
    {
        Vault storage vault = vaults[vaultId];
        require(vault.isActive, "Vault not active");
        require(vault.owner == msg.sender, "Not vault owner");
        
        _accrueInterest(vaultId);
        
        uint256 maxBorrow = (vault.collateralValue * LTV_RATIO) / 100;
        require(vault.borrowedAmount + amount <= maxBorrow, "Exceeds LTV ratio");
        
        vault.borrowedAmount += amount;
        totalBorrowed += amount;
        
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
        
        emit Borrowed(vaultId, amount);
    }
    
    function repay(uint256 vaultId, uint256 amount) 
        external 
        nonReentrant 
    {
        Vault storage vault = vaults[vaultId];
        require(vault.isActive, "Vault not active");
        
        _accrueInterest(vaultId);
        
        uint256 totalDebt = vault.borrowedAmount + vault.interestAccrued;
        require(amount <= totalDebt, "Amount exceeds debt");
        
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        if (amount >= vault.interestAccrued) {
            amount -= vault.interestAccrued;
            vault.interestAccrued = 0;
            vault.borrowedAmount -= amount;
        } else {
            vault.interestAccrued -= amount;
        }
        
        totalBorrowed -= amount;
        
        emit Repaid(vaultId, amount);
    }
    
    function withdrawCollateral(uint256 vaultId) 
        external 
        nonReentrant 
    {
        Vault storage vault = vaults[vaultId];
        require(vault.owner == msg.sender, "Not vault owner");
        require(vault.borrowedAmount == 0, "Outstanding debt");
        require(vault.interestAccrued == 0, "Outstanding interest");
        
        uint256 domainTokenId = vault.domainTokenId;
        
        vault.isActive = false;
        totalValueLocked -= vault.collateralValue;
        delete domainToVault[domainTokenId];
        
        domaOwnershipToken.transferFrom(address(this), msg.sender, domainTokenId);
        
        emit CollateralWithdrawn(vaultId, domainTokenId);
    }
    
    function getVaultHealth(uint256 vaultId) 
        external 
        view 
        returns (uint256 currentLTV, bool isHealthy) 
    {
        Vault storage vault = vaults[vaultId];
        
        if (!vault.isActive || vault.borrowedAmount == 0) {
            return (0, true);
        }
        
        uint256 totalDebt = vault.borrowedAmount + _calculateInterest(vaultId);
        currentLTV = (totalDebt * 100) / vault.collateralValue;
        isHealthy = currentLTV < LIQUIDATION_THRESHOLD;
    }
    
    function getUserVaults(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userVaults[user];
    }
    
    function getVaultDetails(uint256 vaultId) 
        external 
        view 
        returns (Vault memory) 
    {
        return vaults[vaultId];
    }
    
    function _accrueInterest(uint256 vaultId) internal {
        Vault storage vault = vaults[vaultId];
        
        if (vault.borrowedAmount == 0) return;
        
        uint256 interest = _calculateInterest(vaultId);
        vault.interestAccrued += interest;
        vault.lastUpdated = block.timestamp;
    }
    
    function _calculateInterest(uint256 vaultId) internal view returns (uint256) {
        Vault storage vault = vaults[vaultId];
        
        if (vault.borrowedAmount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - vault.lastUpdated;
        uint256 annualInterest = (vault.borrowedAmount * INTEREST_RATE) / 100;
        uint256 interest = (annualInterest * timeElapsed) / 365 days;
        
        return interest;
    }
    
    function depositLiquidity(uint256 amount) external {
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
    
    function withdrawLiquidity(uint256 amount) external onlyOwner {
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
    }
}