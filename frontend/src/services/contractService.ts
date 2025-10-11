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
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external"
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
      
      // Check network first
      const network = await provider.getNetwork();
      console.log('[ContractService] Connected to network:', network.chainId.toString());
      
      const expectedChainId = BigInt(97476);
      if (network.chainId !== expectedChainId) {
        const error = `Wrong network! Connected to ${network.chainId}, expected ${expectedChainId} (Doma testnet)`;
        console.error('[ContractService]', error);
        throw new Error(error);
      }
      
      this.provider = provider;
      
      // Get signer with timeout
      console.log('[ContractService] Getting signer...');
      const signerPromise = provider.getSigner();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout waiting for signer - check if wallet is unlocked')), 10000)
      );
      
      this.signer = await Promise.race([signerPromise, timeoutPromise]) as ethers.Signer;
      const address = await this.signer.getAddress();
      console.log('[ContractService] Signer obtained for address:', address);
      
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

      // Check if NFT is approved (with retry logic for RPC issues)
      console.log('[ContractService] Checking NFT approval status...');
      let isApproved = false;
      try {
        isApproved = await this.retryWithBackoff(() => 
          this.nftContract!.isApprovedForAll(userAddress, CONTRACTS.vault)
        );
        console.log('[ContractService] NFT approval status:', isApproved);
      } catch (error) {
        console.error('[ContractService] Failed to check approval status after retries:', error);
        throw new Error('Unable to check NFT approval status. The RPC endpoint may be overloaded. Please wait a moment and try again.');
      }
      
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

      // Get balance to know how many to look for
      const balance = await this.nftContract.balanceOf(userAddress);
      console.log('[ContractService] NFT balance:', balance.toString());
      
      const nfts: DomainNFT[] = [];
      const balanceNum = Number(balance);
      
      if (balanceNum === 0) {
        console.log('[ContractService] No NFTs owned');
        return [];
      }
      
      // Since the contract doesn't have ERC721Enumerable, we use a limited search
      // to avoid overwhelming the RPC endpoint
      
      // First, check token IDs that we know were minted (stored in localStorage)
      const mintedTokenIds = this.getMintedTokenIds(userAddress);
      console.log('[ContractService] Known minted token IDs:', mintedTokenIds);
      
      // Then check common IDs and sample the range
      const tokenIdsToCheck = [
        ...mintedTokenIds, // Priority: IDs we know were minted
        ...Array.from({ length: 20 }, (_, i) => i + 1), // 1-20 (common IDs)
        ...Array.from({ length: 30 }, (_, i) => 1000 + i * 300) // Sample 1000-9700 (every 300)
      ].filter((id, index, self) => self.indexOf(id) === index); // Remove duplicates
      
      console.log('[ContractService] Checking ownership for up to', tokenIdsToCheck.length, 'token IDs...');
      console.warn('[ContractService] Limited search due to lack of ERC721Enumerable. Some NFTs may not be found.');
      
      // Add delay between calls to avoid rate limiting
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      for (let i = 0; i < tokenIdsToCheck.length; i++) {
        if (nfts.length >= balanceNum) {
          // Found all NFTs, stop searching
          console.log('[ContractService] Found all', balanceNum, 'NFTs');
          break;
        }
        
        const tokenId = tokenIdsToCheck[i];
        
        try {
          const owner = await this.nftContract.ownerOf(tokenId);
          
          if (owner.toLowerCase() === userAddress.toLowerCase()) {
            const name = await this.nftContract.getDomainName(tokenId);
            const displayName = name || `domain-${tokenId}.io`;
            
            nfts.push({
              tokenId: tokenId.toString(),
              name: displayName,
              owned: true
            });
            
            console.log(`[ContractService] Found NFT: ID=${tokenId}, name=${displayName}`);
          }
          
          // Small delay every 10 calls to avoid overwhelming RPC
          if ((i + 1) % 10 === 0) {
            await delay(100);
          }
        } catch (error) {
          // Token doesn't exist or error, skip silently
        }
      }
      
      console.log(`[ContractService] Found ${nfts.length} of ${balanceNum} owned NFTs`);
      
      // If we didn't find all NFTs, warn the user
      if (nfts.length < balanceNum) {
        console.warn(`[ContractService] Warning: Only found ${nfts.length} NFTs but balance shows ${balanceNum}. Some NFTs may have non-standard token IDs.`);
      }
      
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

  // Utility functions for testing
  async mintUSDC(amount: string = "10000"): Promise<string> {
    try {
      console.log('[ContractService] Minting USDC:', amount);
      
      if (!this.usdcContract || !this.signer) {
        throw new Error('USDC contract or signer not initialized');
      }

      const userAddress = await this.signer.getAddress();
      const amountWei = ethers.parseUnits(amount, 6);
      
      console.log('[ContractService] Minting', amount, 'USDC to', userAddress);
      const tx = await this.usdcContract.mint(userAddress, amountWei);
      const receipt = await tx.wait();
      
      console.log('[ContractService] USDC mint transaction:', receipt);
      return receipt.hash;
    } catch (error) {
      console.error('[ContractService] Error minting USDC:', error);
      throw error;
    }
  }

  async mintMockNFT(): Promise<string> {
    try {
      console.log('[ContractService] Minting mock NFT...');
      
      if (!this.nftContract || !this.signer) {
        throw new Error('NFT contract or signer not initialized');
      }

      const userAddress = await this.signer.getAddress();
      
      // Generate a random token ID between 1000-9999 to avoid conflicts
      const randomTokenId = Math.floor(Math.random() * 9000) + 1000;
      
      console.log('[ContractService] Minting NFT with token ID:', randomTokenId, 'to', userAddress);
      const tx = await this.nftContract.mint(userAddress, randomTokenId);
      const receipt = await tx.wait();
      
      console.log('[ContractService] NFT mint transaction:', receipt);
      
      // Store the minted token ID in localStorage for future reference
      this.storeMintedTokenId(userAddress, randomTokenId);
      
      return receipt.hash;
    } catch (error) {
      console.error('[ContractService] Error minting NFT:', error);
      throw error;
    }
  }
  
  // Retry helper for handling RPC rate limiting
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        const isLastRetry = i === maxRetries - 1;
        
        if (isLastRetry) {
          throw error;
        }
        
        // Check if it's a rate limiting or RPC error
        const errorMessage = error?.message || '';
        const isRpcError = 
          errorMessage.includes('Internal JSON-RPC error') ||
          errorMessage.includes('missing revert data') ||
          errorMessage.includes('rate limit') ||
          error?.code === -32603;
        
        if (isRpcError) {
          const delay = baseDelay * Math.pow(2, i); // Exponential backoff
          console.log(`[ContractService] RPC error detected, retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Not an RPC error, don't retry
          throw error;
        }
      }
    }
    
    throw new Error('Retry logic failed unexpectedly');
  }
  
  // Helper methods for tracking minted NFT IDs
  private getMintedTokenIds(userAddress: string): number[] {
    try {
      const key = `minted_nfts_${userAddress.toLowerCase()}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('[ContractService] Error reading minted NFTs from localStorage:', error);
      return [];
    }
  }
  
  private storeMintedTokenId(userAddress: string, tokenId: number): void {
    try {
      const key = `minted_nfts_${userAddress.toLowerCase()}`;
      const existing = this.getMintedTokenIds(userAddress);
      if (!existing.includes(tokenId)) {
        existing.push(tokenId);
        localStorage.setItem(key, JSON.stringify(existing));
        console.log('[ContractService] Stored minted token ID:', tokenId);
      }
    } catch (error) {
      console.error('[ContractService] Error storing minted NFT to localStorage:', error);
    }
  }
}

// Singleton instance
export const contractService = new ContractService();

