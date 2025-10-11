import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import MetricCard from './MetricCard';
import VaultCard from './VaultCard';
import PortfolioChart from './PortfolioChart';
import YieldChart from './YieldChart';
import { HiOutlinePlusCircle } from 'react-icons/hi2';
import { contractService, VaultDetails } from '../services/contractService';

interface DashboardProps {
  onCreateVault: () => void;
  onMintOption: (domain: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateVault, onMintOption }) => {
  const { address, isConnected } = useAccount();
  const [claimingYield, setClaimingYield] = useState<string | null>(null);
  const [borrowing, setBorrowing] = useState<string | null>(null);
  const [mintingOption, setMintingOption] = useState<string | null>(null);
  const [cardView, setCardView] = useState<{[key: string]: 'default' | 'claim' | 'borrow' | 'details'}>({});
  const [lastClaimed, setLastClaimed] = useState<Record<string, number>>({});
  const [lastBorrowed, setLastBorrowed] = useState<Record<string, number>>({});
  const [claimHistory, setClaimHistory] = useState<Record<string, { amount: number; date: string }[]>>({});
  const [claimableYield, setClaimableYield] = useState<Record<string, number>>({});
  const [vaults, setVaults] = useState<VaultDetails[]>([]);
  const [protocolStats, setProtocolStats] = useState({ tvl: '0', borrowed: '0' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdcBalance, setUsdcBalance] = useState('0');
  const [mintingUsdc, setMintingUsdc] = useState(false);
  const [mintingNft, setMintingNft] = useState(false);

  // Initialize contract service and load data
  useEffect(() => {
    const initializeAndLoadData = async () => {
      if (!isConnected || !address || !window.ethereum) {
        console.log('[Dashboard] Not connected or no address');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('[Dashboard] Initializing contract service for address:', address);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        await contractService.initialize(provider);
        
        console.log('[Dashboard] Loading user data...');
        await Promise.all([
          loadUserVaults(),
          loadProtocolStats(),
          loadUserBalance()
        ]);
        
        console.log('[Dashboard] All data loaded successfully');
      } catch (err) {
        console.error('[Dashboard] Error initializing:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeAndLoadData();
  }, [isConnected, address]);

  const loadUserVaults = async () => {
    if (!address) return;
    
    try {
      console.log('[Dashboard] Loading user vaults...');
      const userVaults = await contractService.getUserVaults(address);
      console.log('[Dashboard] Loaded vaults:', userVaults);
      setVaults(userVaults);
    } catch (err) {
      console.error('[Dashboard] Error loading vaults:', err);
      throw err;
    }
  };

  const loadProtocolStats = async () => {
    try {
      console.log('[Dashboard] Loading protocol stats...');
      const stats = await contractService.getProtocolStats();
      console.log('[Dashboard] Protocol stats:', stats);
      setProtocolStats(stats);
    } catch (err) {
      console.error('[Dashboard] Error loading protocol stats:', err);
      throw err;
    }
  };

  const loadUserBalance = async () => {
    if (!address) return;
    
    try {
      console.log('[Dashboard] Loading USDC balance...');
      const balance = await contractService.getUSDCBalance(address);
      console.log('[Dashboard] USDC balance:', balance);
      setUsdcBalance(balance);
    } catch (err) {
      console.error('[Dashboard] Error loading balance:', err);
      // Don't throw here, balance is not critical
    }
  };

  const calculateMetrics = () => {
    const totalVaultValue = vaults.reduce((sum, vault) => {
      const value = parseFloat(vault.collateralValue) || 0;
      console.log('[Dashboard] Vault collateral value:', vault.vaultId, value);
      return sum + value;
    }, 0);
    const totalBorrowed = vaults.reduce((sum, vault) => sum + (parseFloat(vault.borrowedAmount) || 0), 0);
    const totalInterest = vaults.reduce((sum, vault) => sum + (parseFloat(vault.interestAccrued) || 0), 0);
    const averageLTV = vaults.length > 0 
      ? vaults.reduce((sum, vault) => sum + (parseFloat(vault.currentLTV) || 0), 0) / vaults.length 
      : 0;

    console.log('[Dashboard] Calculated metrics:', { totalVaultValue, totalBorrowed, totalInterest, averageLTV });

    return [
      { 
        label: 'Total Vault Value', 
        value: `$${totalVaultValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
        change: '+0%', 
        positive: true 
      },
      { 
        label: 'Active Vaults', 
        value: vaults.filter(v => v.isActive).length.toString(), 
        change: `+${vaults.length}`, 
        positive: true 
      },
      { 
        label: 'Total Borrowed', 
        value: `$${totalBorrowed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
        change: '+0%', 
        positive: true 
      },
      { 
        label: 'Average LTV', 
        value: `${averageLTV.toFixed(1)}%`, 
        change: '+0%', 
        positive: averageLTV < 70 
      },
    ];
  };

  const metrics = calculateMetrics();

  // Generate realistic AI scores for mock domains (when contract returns 0)
  const calculateAIScore = (domainName: string): number => {
    const parts = domainName.split('.');
    const name = parts[0];
    const tld = parts[1] || 'io';
    
    let score = 50; // Base score
    
    // Length scoring (shorter is better)
    if (name.length <= 3) score += 25;
    else if (name.length <= 5) score += 20;
    else if (name.length <= 7) score += 15;
    else score += 10;
    
    // TLD scoring
    if (tld === 'eth' || tld === 'com') score += 15;
    else if (tld === 'io' || tld === 'org') score += 10;
    else score += 5;
    
    // Keyword bonus (crypto-related terms)
    const keywords = ['crypto', 'defi', 'web3', 'nft', 'dao', 'meta'];
    if (keywords.some(kw => name.toLowerCase().includes(kw))) score += 10;
    
    // Add some variance based on domain hash for uniqueness
    const hash = domainName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    score += (hash % 10); // 0-9 points variance
    
    return Math.min(100, Math.max(60, score)); // Clamp between 60-100
  };

  const handleClaimYield = async (domain: string) => {
    // Initialize claimable yield lazily if not set
    setClaimableYield(prev => {
      if (prev[domain] !== undefined) return prev;
      const v = vaults.find(v => v.domain === domain);
      const monthly = v ? Math.floor(v.vaultValue * v.currentYield / 100 / 12) : 0;
      return { ...prev, [domain]: monthly };
    });

    // Toggle claim view on/off; confirmation handled separately
    setCardView(prev => ({ ...prev, [domain]: prev[domain] === 'claim' ? 'default' : 'claim' }));
  };

  const handleClaimConfirm = async (domain: string, amount: number) => {
    setClaimingYield(domain);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setClaimingYield(null);
    setLastClaimed(prev => ({ ...prev, [domain]: amount }));
    // Append to claim history
    setClaimHistory(prev => ({
      ...prev,
      [domain]: [
        { amount, date: new Date().toISOString() },
        ...((prev[domain] || []))
      ].slice(0, 10),
    }));
    // Reset claimable to 0 after claim
    setClaimableYield(prev => ({ ...prev, [domain]: 0 }));
    // Stay on claim screen to show success state
  };

  const handleBorrow = async (domain: string) => {
    setCardView(prev => ({ ...prev, [domain]: prev[domain] === 'borrow' ? 'default' : 'borrow' }));
  };

  const handleMintOption = async (domain: string) => {
    onMintOption(domain);
  };

  const handleDetails = (domain: string) => {
    setCardView(prev => ({ ...prev, [domain]: prev[domain] === 'details' ? 'default' : 'details' }));
  };

  const handleBorrowConfirm = async (vaultId: string, amount: number) => {
    setBorrowing(vaultId);
    
    try {
      console.log('[Dashboard] Borrowing from vault:', { vaultId, amount });
      const txHash = await contractService.borrowFromVault(vaultId, amount.toString());
      console.log('[Dashboard] Borrow transaction hash:', txHash);
      
      setLastBorrowed(prev => ({ ...prev, [vaultId]: amount }));
      
      // Reload data after successful borrow
      await loadUserVaults();
      await loadProtocolStats();
      await loadUserBalance();
      
      console.log('[Dashboard] Borrow completed successfully');
    } catch (err) {
      console.error('[Dashboard] Error borrowing:', err);
      setError(err instanceof Error ? err.message : 'Failed to borrow');
    } finally {
      setBorrowing(null);
    }
  };

  const handleRepayConfirm = async (vaultId: string, amount: number) => {
    setBorrowing(vaultId); // Use borrowing state for repay too
    
    try {
      console.log('[Dashboard] Repaying vault:', { vaultId, amount });
      const txHash = await contractService.repayVault(vaultId, amount.toString());
      console.log('[Dashboard] Repay transaction hash:', txHash);
      
      // Reload data after successful repay
      await loadUserVaults();
      await loadProtocolStats();
      await loadUserBalance();
      
      console.log('[Dashboard] Repay completed successfully');
    } catch (err) {
      console.error('[Dashboard] Error repaying:', err);
      setError(err instanceof Error ? err.message : 'Failed to repay');
    } finally {
      setBorrowing(null);
    }
  };

  const handleMintUsdc = async () => {
    setMintingUsdc(true);
    setError(null);
    
    try {
      console.log('[Dashboard] Minting USDC...');
      const txHash = await contractService.mintUSDC('10000'); // Mint 10,000 USDC
      console.log('[Dashboard] USDC mint transaction hash:', txHash);
      
      // Reload balance after successful mint
      await loadUserBalance();
      
      console.log('[Dashboard] USDC minted successfully');
    } catch (err) {
      console.error('[Dashboard] Error minting USDC:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint USDC');
    } finally {
      setMintingUsdc(false);
    }
  };

  const handleMintNft = async () => {
    setMintingNft(true);
    setError(null);
    
    try {
      console.log('[Dashboard] Minting NFT...');
      const txHash = await contractService.mintMockNFT();
      console.log('[Dashboard] NFT mint transaction hash:', txHash);
      
      // Reload vaults data to potentially show new NFTs
      await loadUserVaults();
      
      console.log('[Dashboard] NFT minted successfully');
    } catch (err) {
      console.error('[Dashboard] Error minting NFT:', err);
      setError(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setMintingNft(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-space-mono font-bold text-white tracking-widest">VAULT DASHBOARD</h1>
          <p className="text-gray-400 font-jetbrains mt-1">Overview of your existing vaults</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-jetbrains uppercase tracking-wide text-gray-400 mb-1">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </div>
          <div className="text-xs text-gray-500 mb-3">
            USDC Balance: ${parseFloat(usdcBalance).toLocaleString()}
          </div>
          
          {/* Utility Buttons */}
          <div className="flex space-x-2 mb-2">
            <button
              onClick={handleMintUsdc}
              disabled={mintingUsdc || loading || !isConnected}
              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors duration-200 font-jetbrains"
            >
              {mintingUsdc ? 'Minting...' : 'Add 10K USDC'}
            </button>
            <button
              onClick={handleMintNft}
              disabled={mintingNft || loading || !isConnected}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded transition-colors duration-200 font-jetbrains"
            >
              {mintingNft ? 'Minting...' : 'Add Mock NFT'}
            </button>
          </div>
          
          {loading && (
            <div className="text-xs text-blue-400 animate-pulse">
              Loading...
            </div>
          )}
          {error && (
            <div className="text-xs text-red-400">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Metrics - Only show when vaults exist */}
      {vaults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      )}

      {/* Charts Section - Only show when vaults exist */}
      {vaults.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-space-mono font-bold text-white mb-6 tracking-wide">Portfolio Performance</h2>
            <PortfolioChart vaultData={vaults} hasVaults={vaults.length > 0} />
          </div>
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-space-mono font-bold text-white mb-6 tracking-wide">Yield Analytics</h2>
            <YieldChart />
          </div>
        </div>
      )}

      {/* Vault Cards */}
      {vaults.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-4">No vaults found</div>
          <div className="text-gray-500 text-sm mb-6">Create your first vault to start earning yield on your domain assets</div>
          <button
            onClick={onCreateVault}
            className="flex items-center space-x-3 px-8 py-4 bg-gray-900 border border-neon-green rounded-lg text-white font-space-mono font-medium transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:shadow-neon-green/20 hover:scale-[1.02] mx-auto"
          >
            <HiOutlinePlusCircle size={24} />
            <span className="text-lg">Create First Vault</span>
          </button>
        </div>
      ) : (
        <>
          {/* Create New Vault Button - Only show when vaults exist */}
          <div className="flex justify-center py-6">
            <button
              onClick={onCreateVault}
              className="flex items-center space-x-3 px-8 py-4 bg-gray-900 border border-neon-green rounded-lg text-white font-space-mono font-medium transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:shadow-neon-green/20 hover:scale-[1.02]"
            >
              <HiOutlinePlusCircle size={24} />
              <span className="text-lg">Create New Vault</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {vaults.map((vault) => {
            const collateralValue = parseFloat(vault.collateralValue);
            const borrowedAmount = parseFloat(vault.borrowedAmount);
            const ltvRatio = parseFloat(vault.currentLTV);
            const contractAiScore = parseInt(vault.aiScore);
            // Use contract AI score, or calculate one if it's 0 (for mock domains)
            const aiScore = contractAiScore > 0 ? contractAiScore : calculateAIScore(vault.domainName);
            const availableToBorrow = collateralValue * 0.7 - borrowedAmount; // 70% LTV
            
            // Convert vault data to match VaultCard interface
            const vaultCardData = {
              domain: vault.domainName,
              aiScore,
              vaultValue: collateralValue,
              currentYield: 15.0, // Mock yield for now
              ltvRatio,
              availableToBorrow: Math.max(0, availableToBorrow),
              deltaValue: 0, // Mock delta
              deltaYield: 0, // Mock delta
            };
            
            return (
              <VaultCard 
                key={vault.vaultId} 
                {...vaultCardData}
                onClaimYield={() => handleClaimYield(vault.vaultId)}
                onBorrow={() => handleBorrow(vault.vaultId)}
                onMintOption={() => handleMintOption(vault.domainName)}
                onDetails={() => handleDetails(vault.vaultId)}
                onBorrowConfirm={(amount) => handleBorrowConfirm(vault.vaultId, amount)}
                onRepayConfirm={(amount) => handleRepayConfirm(vault.vaultId, amount)}
                onClaimConfirm={(amount) => handleClaimConfirm(vault.vaultId, amount)}
                cardView={cardView[vault.vaultId] || 'default'}
                claimingYield={claimingYield === vault.vaultId}
                borrowing={borrowing === vault.vaultId}
                mintingOption={mintingOption === vault.vaultId}
                lastClaimedAmount={lastClaimed[vault.vaultId]}
                lastBorrowedAmount={lastBorrowed[vault.vaultId]}
                claimableAmount={claimableYield[vault.vaultId] !== undefined ? claimableYield[vault.vaultId] : Math.floor(collateralValue * 15 / 100 / 12)}
                claimHistory={claimHistory[vault.vaultId] || []}
              />
            );
          })}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;