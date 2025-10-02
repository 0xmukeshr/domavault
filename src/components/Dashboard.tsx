import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import MetricCard from './MetricCard';
import VaultCard from './VaultCard';
import PortfolioChart from './PortfolioChart';
import YieldChart from './YieldChart';
import { Plus } from 'lucide-react';

interface DashboardProps {
  onCreateVault: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onCreateVault }) => {
  const { address } = useAccount();
  const [claimingYield, setClaimingYield] = useState<string | null>(null);
  const [borrowing, setBorrowing] = useState<string | null>(null);
  const [mintingOption, setMintingOption] = useState<string | null>(null);

  const metrics = [
    { label: 'Total Vault Value', value: '$125,430.50', change: '+15.2%', positive: true },
    { label: 'Active Vaults', value: '7', change: '+2', positive: true },
    { label: 'Pending Yield', value: '$2,341.20', change: '+8.5%', positive: true },
    { label: 'Average ROI', value: '16.8%', change: '+2.1%', positive: true },
  ];

  const vaults = [
    {
      domain: 'crypto.eth',
      aiScore: 94,
      vaultValue: 42500,
      currentYield: 18.5,
      ltvRatio: 65,
      availableToBorrow: 27625,
      deltaValue: 8.2,
      deltaYield: 2.1,
    },
    {
      domain: 'defi.com',
      aiScore: 87,
      vaultValue: 35200,
      currentYield: 15.2,
      ltvRatio: 70,
      availableToBorrow: 24640,
      deltaValue: -2.1,
      deltaYield: 0.8,
    },
    {
      domain: 'web3.io',
      aiScore: 91,
      vaultValue: 28900,
      currentYield: 17.3,
      ltvRatio: 60,
      availableToBorrow: 17340,
      deltaValue: 12.8,
      deltaYield: 3.2,
    },
    {
      domain: 'nft.org',
      aiScore: 76,
      vaultValue: 18830,
      currentYield: 13.9,
      ltvRatio: 55,
      availableToBorrow: 10356,
      deltaValue: 5.4,
      deltaYield: 1.7,
    },
  ];

  const handleClaimYield = async (domain: string) => {
    setClaimingYield(domain);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setClaimingYield(null);
    alert(`Yield claimed for ${domain}!`);
  };

  const handleBorrow = async (domain: string) => {
    setBorrowing(domain);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setBorrowing(null);
    alert(`Borrowing initiated for ${domain}!`);
  };

  const handleMintOption = async (domain: string) => {
    setMintingOption(domain);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setMintingOption(null);
    alert(`Option minted for ${domain}!`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-orbitron font-bold text-white">Vault Dashboard</h1>
          <p className="text-gray-400 font-jetbrains mt-1">Overview of your existing vaults</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-jetbrains uppercase tracking-wide text-gray-400">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-orbitron font-bold text-white mb-6">Portfolio Performance</h2>
          <PortfolioChart />
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-orbitron font-bold text-white mb-6">Yield Analytics</h2>
          <YieldChart />
        </div>
      </div>

      {/* Create Vault Button */}
      <div className="flex justify-center py-6">
        <button
          onClick={onCreateVault}
          className="flex items-center space-x-3 px-8 py-4 bg-gray-900 border border-neon-green rounded-lg text-white font-jetbrains font-medium transition-all duration-200 hover:bg-gray-800 hover:shadow-lg hover:shadow-neon-green/20 hover:scale-[1.02] animate-glow"
        >
          <Plus size={24} />
          <span className="text-lg">Create New Vault</span>
        </button>
      </div>

      {/* Vault Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {vaults.map((vault) => (
          <VaultCard 
            key={vault.domain} 
            {...vault} 
            onClaimYield={() => handleClaimYield(vault.domain)}
            onBorrow={() => handleBorrow(vault.domain)}
            onMintOption={() => handleMintOption(vault.domain)}
            claimingYield={claimingYield === vault.domain}
            borrowing={borrowing === vault.domain}
            mintingOption={mintingOption === vault.domain}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;