import React from 'react';

interface VaultCardProps {
  domain: string;
  aiScore: number;
  vaultValue: number;
  currentYield: number;
  ltvRatio: number;
  availableToBorrow: number;
  deltaValue: number;
  deltaYield: number;
  onClaimYield: () => void;
  onBorrow: () => void;
  onMintOption: () => void;
  claimingYield: boolean;
  borrowing: boolean;
  mintingOption: boolean;
}

const VaultCard: React.FC<VaultCardProps> = ({
  domain,
  aiScore,
  vaultValue,
  currentYield,
  ltvRatio,
  availableToBorrow,
  deltaValue,
  deltaYield,
  onClaimYield,
  onBorrow,
  onMintOption,
  claimingYield,
  borrowing,
  mintingOption,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 transition-all duration-200 hover:border-neon-green hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-neon-green/20">
      {/* Domain Header */}
      <div className="mb-6">
        <h3 className="text-xl font-orbitron font-bold text-white mb-2">{domain}</h3>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-1">AI Score</div>
          <div className={`text-lg font-orbitron font-bold ${getScoreColor(aiScore)}`}>
            {aiScore}/100
          </div>
        </div>
        <div>
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-1">Vault Value</div>
          <div className="text-lg font-orbitron font-bold text-white">
            {formatCurrency(vaultValue)}
          </div>
          <div className={`text-xs font-jetbrains ${deltaValue >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
            {deltaValue >= 0 ? '+' : ''}{deltaValue.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-1">Current Yield</div>
          <div className="text-lg font-orbitron font-bold text-white">
            {currentYield.toFixed(1)}%
          </div>
          <div className={`text-xs font-jetbrains ${deltaYield >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
            {deltaYield >= 0 ? '+' : ''}{deltaYield.toFixed(1)}% ROI
          </div>
        </div>
      </div>

      {/* Borrowing Power */}
      <div className="mb-6">
        <div className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
          Borrowing Power ({ltvRatio}% LTV)
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-2">
          <div 
            className="bg-neon-green h-3 rounded-full transition-all duration-300 animate-pulse-slow"
            style={{ width: `${ltvRatio}%` }}
          ></div>
        </div>
        <div className="text-sm font-jetbrains text-gray-300">
          Available to borrow: {formatCurrency(availableToBorrow)}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-2">
          Actions
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onClaimYield}
            disabled={claimingYield}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-black font-jetbrains text-sm font-medium transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-green/30 disabled:opacity-50"
          >
            {claimingYield ? 'Claiming...' : 'Claim Yield'}
          </button>
          <button 
            onClick={onBorrow}
            disabled={borrowing}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-jetbrains text-sm font-medium transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-blue/30 disabled:opacity-50"
          >
            {borrowing ? 'Processing...' : 'Borrow'}
          </button>
        </div>

        <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2 pt-2">
          Vault Management
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={onMintOption}
            disabled={mintingOption}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains text-sm font-medium transition-all duration-200 hover:border-neon-green hover:scale-[1.02] disabled:opacity-50"
          >
            {mintingOption ? 'Minting...' : 'Mint Option'}
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains text-sm font-medium transition-all duration-200 hover:border-neon-green hover:scale-[1.02]">
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultCard;