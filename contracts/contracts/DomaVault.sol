// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDomainValuator {
    function getDomainValue(uint256 tokenId) external view returns (uint256);
    function getAIScore(uint256 tokenId) external view returns (uint256);
    function isValueFresh(uint256 tokenId) external view returns (bool);
}

contract DomaVault is ReentrancyGuard, Ownable {
    
    IERC721 public domaOwnershipToken;
    IERC20 public usdcToken;
    IDomainValuator public valuator;
    
    uint256 public constant LTV_RATIO = 70;
    uint256 public constant LIQUIDATION_THRESHOLD = 80;
    uint256 public constant LIQUIDATION_PENALTY = 10; // 10% penalty
    uint256 public constant INTEREST_RATE = 500; // 5% in basis points
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    uint256 public constant BASIS_POINTS = 10000;
    
    uint256 public vaultCount;
    uint256 public totalValueLocked;
    uint256 public totalBorrowed;
    uint256 public liquidationReward = 5; // 5% reward for liquidators
    
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
    event Repaid(uint256 indexed vaultId, uint256 amount, uint256 interestPaid, uint256 principalPaid);
    event Liquidated(uint256 indexed vaultId, address indexed liquidator, uint256 debtPaid, uint256 collateralSeized);
    event CollateralWithdrawn(uint256 indexed vaultId, uint256 domainTokenId);
    event CollateralValueUpdated(uint256 indexed vaultId, uint256 oldValue, uint256 newValue);
    
    modifier vaultExists(uint256 vaultId) {
        require(vaultId > 0 && vaultId <= vaultCount, "Vault does not exist");
        _;
    }
    
    modifier onlyVaultOwner(uint256 vaultId) {
        require(vaults[vaultId].owner == msg.sender, "Not vault owner");
        _;
    }
    
    constructor(
        address _domaOwnershipToken,
        address _usdcToken,
        address _valuator
    ) Ownable(msg.sender) {
        require(_domaOwnershipToken != address(0), "Invalid domain token address");
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_valuator != address(0), "Invalid valuator address");
        
        domaOwnershipToken = IERC721(_domaOwnershipToken);
        usdcToken = IERC20(_usdcToken);
        valuator = IDomainValuator(_valuator);
    }
    
    function createVault(uint256 domainTokenId, string memory domainName, uint256 initialValue) 
        external 
        nonReentrant 
        returns (uint256) 
    {
        require(domaOwnershipToken.ownerOf(domainTokenId) == msg.sender, "Not domain owner");
        require(domainToVault[domainTokenId] == 0, "Domain already in vault");
        require(initialValue > 0, "Initial value must be greater than 0");
        
        // Transfer domain NFT to vault
        domaOwnershipToken.transferFrom(msg.sender, address(this), domainTokenId);
        
        // Use the user's provided initial value as the collateral value
        // This gives users control over their vault's collateral amount
        uint256 domainValue = initialValue;
        
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
        
        uint256 interestPaid = 0;
        uint256 principalPaid = 0;
        
        if (amount >= vault.interestAccrued) {
            interestPaid = vault.interestAccrued;
            principalPaid = amount - vault.interestAccrued;
            vault.interestAccrued = 0;
            vault.borrowedAmount -= principalPaid;
        } else {
            interestPaid = amount;
            vault.interestAccrued -= amount;
        }
        
        totalBorrowed -= principalPaid;
        
        emit Repaid(vaultId, amount, interestPaid, principalPaid);
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
        // Use basis points for proper calculation
        uint256 annualInterest = (vault.borrowedAmount * INTEREST_RATE) / BASIS_POINTS;
        uint256 interest = (annualInterest * timeElapsed) / SECONDS_PER_YEAR;
        
        return interest;
    }
    
    function depositLiquidity(uint256 amount) external {
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
    }
    
    function withdrawLiquidity(uint256 amount) external onlyOwner {
        require(usdcToken.transfer(msg.sender, amount), "Transfer failed");
    }
    
    function liquidate(uint256 vaultId) 
        external 
        nonReentrant 
    {
        require(vaultId > 0 && vaultId <= vaultCount, "Vault does not exist");
        Vault storage vault = vaults[vaultId];
        require(vault.isActive, "Vault not active");
        
        _accrueInterest(vaultId);
        
        uint256 totalDebt = vault.borrowedAmount + vault.interestAccrued;
        require(totalDebt > 0, "No debt to liquidate");
        
        uint256 currentLTV = (totalDebt * 100) / vault.collateralValue;
        require(currentLTV >= LIQUIDATION_THRESHOLD, "Vault is healthy");
        
        // Calculate liquidation amounts
        uint256 debtPaid = totalDebt;
        uint256 penalty = (vault.collateralValue * LIQUIDATION_PENALTY) / 100;
        uint256 liquidatorReward = (vault.collateralValue * liquidationReward) / 100;
        uint256 collateralSeized = vault.collateralValue - liquidatorReward;
        
        // Verify liquidator can pay the debt
        require(usdcToken.transferFrom(msg.sender, address(this), debtPaid), "Debt payment failed");
        
        // Transfer domain to liquidator
        domaOwnershipToken.transferFrom(address(this), msg.sender, vault.domainTokenId);
        
        // Update vault state
        vault.isActive = false;
        vault.borrowedAmount = 0;
        vault.interestAccrued = 0;
        totalBorrowed -= vault.borrowedAmount;
        totalValueLocked -= vault.collateralValue;
        
        // Remove from mappings
        delete domainToVault[vault.domainTokenId];
        
        emit Liquidated(vaultId, msg.sender, debtPaid, collateralSeized);
    }
    
    function updateCollateralValue(uint256 vaultId) 
        external 
        vaultExists(vaultId) 
    {
        Vault storage vault = vaults[vaultId];
        require(vault.isActive, "Vault not active");
        
        uint256 oldValue = vault.collateralValue;
        uint256 newValue = valuator.getDomainValue(vault.domainTokenId);
        require(newValue > 0, "Invalid domain value");
        
        vault.collateralValue = newValue;
        totalValueLocked = totalValueLocked - oldValue + newValue;
        
        emit CollateralValueUpdated(vaultId, oldValue, newValue);
    }
}
