import { ethers } from 'ethers';

// Contract ABIs
const VAULT_ABI = [
  "function createVault(uint256 domainTokenId, string domainName, uint256 initialValue) external returns (uint256)",
  "function borrow(uint256 vaultId, uint256 amount) external",
  "function repay(uint256 vaultId, uint256 amount) external",
  "function getVaultDetails(uint256 vaultId) external view returns (tuple(uint256 vaultId, address owner, uint256 domainTokenId, uint256 collateralValue, uint256 borrowedAmount, uint256 lastUpdated, uint256 interestAccrued, bool isActive, string domainName))",
  "function getUserVaults(address user) external view returns (uint256[])",
  "function getVaultHealth(uint256 vaultId) external view returns (uint256 currentLTV, bool isHealthy)",
  "function withdrawCollateral(uint256 vaultId) external",
  "function depositLiquidity(uint256 amount) external",
  "function totalValueLocked() external view returns (uint256)",
  "function totalBorrowed() external view returns (uint256)",
  "function LTV_RATIO() external view returns (uint256)",
  "function LIQUIDATION_THRESHOLD() external view returns (uint256)",
  "function INTEREST_RATE() external view returns (uint256)"
];

const VALUATOR_ABI = [
  "function getDomainValue(uint256 tokenId) external view returns (uint256)",
  "function getAIScore(uint256 tokenId) external view returns (uint256)",
  "function getDomainData(uint256 tokenId) external view returns (uint256 value, uint256 score, uint256 updated)",
  "function updateDomainValue(uint256 tokenId, uint256 value, uint256 score) external"
];

const NFT_ABI = [
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function approve(address to, uint256 tokenId) external",
  "function setApprovalForAll(address operator, bool approved) external",
  "function isApprovedForAll(address owner, address operator) external view returns (bool)",
  "function getDomainName(uint256 tokenId) external view returns (string)",
  "function mint(address to, uint256 tokenId) external",
  "function balanceOf(address owner) external view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)"
];

const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

// Contract addresses from environment
const CONTRACTS = {
  vault: import.meta.env.VITE_VAULT_ADDRESS,
  valuator: import.meta.env.VITE_VALUATOR_ADDRESS,
  usdc: import.meta.env.VITE_USDC_ADDRESS,
  nft: import.meta.env.VITE_DOMAIN_NFT_ADDRESS
};

export interface VaultDetails {
  vaultId: string;
  owner: string;
  domainTokenId: string;
  collateralValue: string;
  borrowedAmount: string;
  lastUpdated: string;
  interestAccrued: string;
  isActive: boolean;
  domainName: string;
  currentLTV: string;
  isHealthy: boolean;
  aiScore: string;
  domainValue: string;
}

export interface DomainNFT {
  tokenId: string;
  name: string;
  owned: boolean;
}

export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private vaultContract: ethers.Contract | null = null;
  private valuatorContract: ethers.Contract | null = null;
  private nftContract: ethers.Contract | null = null;
  private usdcContract: ethers.Contract | null = null;

  constructor() {
    console.log('[ContractService] Initializing with contracts:', CONTRACTS);
  }

  async initialize(provider: ethers.BrowserProvider) {
    try {
      console.log('[ContractService] Initializing contracts...');
      
      this.provider = provider;
      this.signer = await provider.getSigner();
      
      // Initialize contract instances
      this.vaultContract = new ethers.Contract(CONTRACTS.vault, VAULT_ABI, this.signer);
      this.valuatorContract = new ethers.Contract(CONTRACTS.valuator, VALUATOR_ABI, this.signer);
      this.nftContract = new ethers.Contract(CONTRACTS.nft, NFT_ABI, this.signer);
      this.usdcContract = new ethers.Contract(CONTRACTS.usdc, USDC_ABI, this.signer);

      console.log('[ContractService] Contracts initialized successfully');
      console.log('- Vault:', CONTRACTS.vault);
      console.log('- Valuator:', CONTRACTS.valuator);
      console.log('- NFT:', CONTRACTS.nft);
      console.log('- USDC:', CONTRACTS.usdc);
    } catch (error) {
      console.error('[ContractService] Failed to initialize contracts:', error);
      throw error;
    }
  }

  // Vault operations
  async getUserVaults(userAddress: string): Promise<VaultDetails[]> {
    try {
      console.log('[ContractService] Getting user vaults for:', userAddress);
      
      if (!this.vaultContract || !this.valuatorContract) {
        throw new Error('Contracts not initialized');
      }

      const vaultIds = await this.vaultContract.getUserVaults(userAddress);
      console.log('[ContractService] Found vault IDs:', vaultIds);
      
      const vaults: VaultDetails[] = await Promise.all(
        vaultIds.map(async (id: bigint) => {
          try {
            console.log(`[ContractService] Fetching details for vault ${id}`);
            
            const details = await this.vaultContract!.getVaultDetails(id);
            const health = await this.vaultContract!.getVaultHealth(id);
            const aiData = await this.valuatorContract!.getDomainData(details.domainTokenId);
            
            console.log(`[ContractService] Vault ${id} details:`, {
              details: details.toString(),
              health: health.toString(),
              aiData: aiData.toString()
            });
            
            return {
              vaultId: id.toString(),
              owner: details.owner,
              domainTokenId: details.domainTokenId.toString(),
              collateralValue: ethers.formatUnits(details.collateralValue, 6),
              borrowedAmount: ethers.formatUnits(details.borrowedAmount, 6),
              lastUpdated: details.lastUpdated.toString(),
              interestAccrued: ethers.formatUnits(details.interestAccrued, 6),
              isActive: details.isActive,
              domainName: details.domainName,
              currentLTV: health.currentLTV.toString(),
              isHealthy: health.isHealthy,
              aiScore: aiData.score.toString(),
              domainValue: ethers.formatUnits(aiData.value, 6)
            };
          } catch (error) {
            console.error(`[ContractService] Error fetching vault ${id}:`, error);
            throw error;
          }
        })
      );
      
      console.log('[ContractService] Successfully fetched vaults:', vaults);
      return vaults;
    } catch (error) {
      console.error('[ContractService] Error getting user vaults:', error);
      throw error;
    }
  }

  async createVault(domainTokenId: string, domainName: string, initialValue: string): Promise<string> {
    try {
      console.log('[ContractService] Creating vault for domain:', { domainTokenId, domainName, initialValue });
      
      if (!this.vaultContract || !this.nftContract) {
        throw new Error('Contracts not initialized');
      }

      const userAddress = await this.signer?.getAddress();
      console.log('[ContractService] User address:', userAddress);

      // Convert initial value to wei (USDC has 6 decimals)
      const initialValueWei = ethers.parseUnits(initialValue, 6);
      console.log('[ContractService] Initial value in wei:', initialValueWei.toString());

      // Check if NFT is approved
      const isApproved = await this.nftContract.isApprovedForAll(userAddress, CONTRACTS.vault);
      console.log('[ContractService] NFT approval status:', isApproved);
      
      if (!isApproved) {
        console.log('[ContractService] Approving NFT...');
        const approveTx = await this.nftContract.setApprovalForAll(CONTRACTS.vault, true);
        await approveTx.wait();
        console.log('[ContractService] NFT approved');
      }
      
      console.log('[ContractService] Creating vault...');
      const tx = await this.vaultContract.createVault(domainTokenId, domainName, initialValueWei);
      const receipt = await tx.wait();
      
      console.log('[ContractService] Vault creation transaction:', receipt);
      return receipt.hash;
    } catch (error) {
      console.error('[ContractService] Error creating vault:', error);
      throw error;
    }
  }

  async borrowFromVault(vaultId: string, amount: string): Promise<string> {
    try {
      console.log('[ContractService] Borrowing from vault:', { vaultId, amount });
      
      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const amountWei = ethers.parseUnits(amount, 6);
      console.log('[ContractService] Amount in wei:', amountWei);
      
      const tx = await this.vaultContract.borrow(vaultId, amountWei);
      const receipt = await tx.wait();
      
      console.log('[ContractService] Borrow transaction:', receipt);
      return receipt.hash;
    } catch (error) {
      console.error('[ContractService] Error borrowing:', error);
      throw error;
    }
  }

  async repayVault(vaultId: string, amount: string): Promise<string> {
    try {
      console.log('[ContractService] Repaying vault:', { vaultId, amount });
      
      if (!this.vaultContract || !this.usdcContract) {
        throw new Error('Contracts not initialized');
      }

      const userAddress = await this.signer?.getAddress();
      const amountWei = ethers.parseUnits(amount, 6);
      
      console.log('[ContractService] Checking USDC allowance...');
      const allowance = await this.usdcContract.allowance(userAddress, CONTRACTS.vault);
      console.log('[ContractService] Current allowance:', allowance);
      
      if (allowance < amountWei) {
        console.log('[ContractService] Approving USDC...');
        const approveTx = await this.usdcContract.approve(CONTRACTS.vault, amountWei);
        await approveTx.wait();
        console.log('[ContractService] USDC approved');
      }
      
      console.log('[ContractService] Repaying vault...');
      const tx = await this.vaultContract.repay(vaultId, amountWei);
      const receipt = await tx.wait();
      
      console.log('[ContractService] Repay transaction:', receipt);
      return receipt.hash;
    } catch (error) {
      console.error('[ContractService] Error repaying:', error);
      throw error;
    }
  }

  async withdrawCollateral(vaultId: string): Promise<string> {
    try {
      console.log('[ContractService] Withdrawing collateral from vault:', vaultId);
      
      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const tx = await this.vaultContract.withdrawCollateral(vaultId);
      const receipt = await tx.wait();
      
      console.log('[ContractService] Withdraw transaction:', receipt);
      return receipt.hash;
    } catch (error) {
      console.error('[ContractService] Error withdrawing collateral:', error);
      throw error;
    }
  }

  // Protocol stats
  async getProtocolStats(): Promise<{ tvl: string; borrowed: string }> {
    try {
      console.log('[ContractService] Getting protocol stats...');
      
      if (!this.vaultContract) {
        throw new Error('Vault contract not initialized');
      }

      const tvl = await this.vaultContract.totalValueLocked();
      const borrowed = await this.vaultContract.totalBorrowed();
      
      console.log('[ContractService] Protocol stats:', {
        tvl: tvl.toString(),
        borrowed: borrowed.toString()
      });
      
      return {
        tvl: ethers.formatUnits(tvl, 6),
        borrowed: ethers.formatUnits(borrowed, 6)
      };
    } catch (error) {
      console.error('[ContractService] Error getting protocol stats:', error);
      throw error;
    }
  }

  // NFT operations
  async getOwnedNFTs(userAddress: string): Promise<DomainNFT[]> {
    try {
      console.log('[ContractService] Getting owned NFTs for:', userAddress);
      
      if (!this.nftContract) {
        throw new Error('NFT contract not initialized');
      }

      const balance = await this.nftContract.balanceOf(userAddress);
      console.log('[ContractService] NFT balance:', balance);
      
      const nfts: DomainNFT[] = [];
      
      for (let i = 0; i < balance; i++) {
        try {
          const tokenId = await this.nftContract.tokenOfOwnerByIndex(userAddress, i);
          const name = await this.nftContract.getDomainName(tokenId);
          
          nfts.push({
            tokenId: tokenId.toString(),
            name,
            owned: true
          });
        } catch (error) {
          console.error(`[ContractService] Error fetching NFT at index ${i}:`, error);
        }
      }
      
      console.log('[ContractService] Owned NFTs:', nfts);
      return nfts;
    } catch (error) {
      console.error('[ContractService] Error getting owned NFTs:', error);
      throw error;
    }
  }

  // Balance checks
  async getUSDCBalance(userAddress: string): Promise<string> {
    try {
      console.log('[ContractService] Getting USDC balance for:', userAddress);
      
      if (!this.usdcContract) {
        throw new Error('USDC contract not initialized');
      }

      const balance = await this.usdcContract.balanceOf(userAddress);
      console.log('[ContractService] USDC balance:', balance);
      
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error('[ContractService] Error getting USDC balance:', error);
      throw error;
    }
  }
}

// Singleton instance
export const contractService = new ContractService();

