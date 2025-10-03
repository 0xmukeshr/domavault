import React, { useState } from 'react';
import { ArrowLeft, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';

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
  onDetails: () => void;
  onBorrowConfirm: (amount: number) => void;
  onClaimConfirm: (amount: number) => void;
  onRepayConfirm?: (amount: number) => void;
  cardView: 'default' | 'claim' | 'borrow' | 'details';
  claimingYield: boolean;
  borrowing: boolean;
  mintingOption: boolean;
  lastClaimedAmount?: number;
  lastBorrowedAmount?: number;
  claimableAmount: number;
  claimHistory: { amount: number; date: string }[];
  borrowedAmount?: number;
  interestAccrued?: number;
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
  onDetails,
  onBorrowConfirm,
  onClaimConfirm,
  onRepayConfirm,
  cardView,
  claimingYield,
  borrowing,
  mintingOption,
  lastClaimedAmount,
  lastBorrowedAmount,
  claimableAmount,
  claimHistory,
  borrowedAmount = 0,
  interestAccrued = 0,
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

const [borrowAmount, setBorrowAmount] = useState(Math.floor(availableToBorrow * 0.5));
  const [repayAmount, setRepayAmount] = useState(0);
  const monthlyYield = (vaultValue * currentYield / 100 / 12).toFixed(0);

  const renderClaimView = () => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 transition-all duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-space-mono font-bold text-white">{domain}</h3>
        <button 
          onClick={onClaimYield}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="text-center mb-4">
            <h4 className="text-lg font-space-mono font-bold text-white">Available to Claim</h4>
          </div>

          <div className="text-center mb-6">
            <span className="text-3xl font-space-mono font-bold text-white">{formatCurrency(claimableAmount)}</span>
            <div className="text-sm text-gray-400 mt-1">
              Based on {currentYield}% APY
            </div>
          </div>

          <button 
            onClick={() => onClaimConfirm(claimableAmount)}
            disabled={claimingYield || claimableAmount === 0}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white font-jetbrains font-medium transition-all hover:from-green-700 hover:to-green-800 disabled:opacity-50"
          >
            {claimingYield ? 'Claiming...' : (claimableAmount === 0 ? 'No Yield Available' : 'Claim Now')}
          </button>

          {lastClaimedAmount && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-600 rounded-lg text-center">
              <div className="text-green-400 text-sm font-jetbrains">
                Successfully claimed {formatCurrency(lastClaimedAmount)}
              </div>
            </div>
          )}
        </div>

        {/* Claim History */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-md font-space-mono font-bold text-white mb-4">Claim History</h4>
          {claimHistory.length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {claimHistory.map((claim, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-900 rounded">
                  <span className="text-sm font-jetbrains text-gray-300">
                    {new Date(claim.date).toLocaleDateString()}
                  </span>
                  <span className="text-sm font-space-mono text-green-400">
                    {formatCurrency(claim.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm">
              No claims yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBorrowView = () => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 transition-all duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-space-mono font-bold text-white">{domain}</h3>
        <button 
          onClick={onBorrow}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="mb-4">
            <h4 className="text-lg font-space-mono font-bold text-white mb-1">Available to Borrow</h4>
            <div className="text-gray-400 text-sm">Based on {ltvRatio}% LTV ratio</div>
          </div>

          <div className="text-3xl font-space-mono font-bold text-white mb-6">
            {formatCurrency(availableToBorrow)}
          </div>

          <div className="mb-6">
            <label className="text-sm font-jetbrains text-gray-300 block mb-2">Borrow amount</label>
            <div className="mb-3">
              <div className="relative">
                <input 
                  type="range" 
                  min="0" 
                  max={availableToBorrow} 
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #00d4ff 0%, #00d4ff ${(borrowAmount / availableToBorrow) * 100}%, #374151 ${(borrowAmount / availableToBorrow) * 100}%, #374151 100%)`
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm font-jetbrains text-gray-400">$0</span>
              <span className="text-lg font-space-mono font-bold text-neon-blue">{formatCurrency(borrowAmount)}</span>
              <span className="text-sm font-jetbrains text-gray-400">{formatCurrency(availableToBorrow)}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button 
              onClick={() => onBorrowConfirm(borrowAmount)}
              disabled={borrowing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white font-jetbrains font-medium transition-all hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
            >
              {borrowing ? 'Processing...' : 'Borrow'}
            </button>
            {parseFloat(borrowedAmount.toString()) > 0 && onRepayConfirm && (
              <button 
                onClick={() => {
                  const maxRepay = parseFloat(borrowedAmount.toString()) + parseFloat(interestAccrued?.toString() || '0');
                  const repayAmt = Math.min(repayAmount || maxRepay, maxRepay);
                  onRepayConfirm(repayAmt);
                }}
                disabled={borrowing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white font-jetbrains font-medium transition-all hover:from-green-700 hover:to-green-800 disabled:opacity-50"
              >
                Repay
              </button>
            )}
          </div>

          {lastBorrowedAmount && (
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg text-center">
              <div className="text-blue-400 text-sm font-jetbrains">
                Successfully borrowed {formatCurrency(lastBorrowedAmount)}
              </div>
            </div>
          )}
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h4 className="text-md font-space-mono font-bold text-white mb-4">Borrow Terms</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Interest rate</span>
              <span className="text-white">3.5% APR</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Liquidation threshold</span>
              <span className="text-white">{ltvRatio + 15}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Repayment flexibility</span>
              <span className="text-white">Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetailsView = () => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 transition-all duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-space-mono font-bold text-white">{domain}</h3>
        <button 
          onClick={onDetails}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-space-mono font-bold text-white">Domain Details</h4>
            <div className={`px-2 py-1 rounded text-xs ${getScoreColor(aiScore)} bg-gray-900`}>
              AI Score: {aiScore}/100
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Registration</span>
              <span className="text-white">Mar 15, 2023</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Expiration</span>
              <span className="text-white">Mar 15, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className="text-white">{domain.includes('.eth') ? 'ENS Domain' : 'DNS Domain'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Revenue potential</span>
              <span className="text-white font-medium text-green-400">High</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="text-blue-400 mr-2" size={20} />
            <h4 className="text-lg font-space-mono font-bold text-white">Valuation Metrics</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Base value</span>
              <span className="text-white">{formatCurrency(vaultValue * 0.8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Premium</span>
              <span className="text-white">{formatCurrency(vaultValue * 0.2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">30-day change</span>
              <span className={`${deltaValue >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {deltaValue >= 0 ? '+' : ''}{deltaValue.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-300">Total valuation</span>
              <span className="text-white">{formatCurrency(vaultValue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="text-green-400 mr-2" size={20} />
            <h4 className="text-lg font-space-mono font-bold text-white">Yield Info</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Current APY</span>
              <span className="text-white">{currentYield.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Monthly yield</span>
              <span className="text-white">{formatCurrency(parseInt(monthlyYield))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">YTD earnings</span>
              <span className="text-white">{formatCurrency(vaultValue * currentYield / 100 * 0.7)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Default view rendering
  const renderDefaultView = () => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 transition-all duration-200 hover:border-neon-green hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-neon-green/20">
      {/* Domain Header */}
      <div className="mb-6">
        <h3 className="text-xl font-space-mono font-bold text-white mb-2">{domain}</h3>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-1">AI Score</div>
          <div className={`text-lg font-space-mono font-bold ${getScoreColor(aiScore)}`}>
            {aiScore}/100
          </div>
        </div>
        <div>
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-1">Vault Value</div>
          <div className="text-lg font-space-mono font-bold text-white">
            {formatCurrency(vaultValue)}
          </div>
          <div className={`text-xs font-jetbrains ${deltaValue >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
            {deltaValue >= 0 ? '+' : ''}{deltaValue.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-1">Current Yield</div>
          <div className="text-lg font-space-mono font-bold text-white">
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
        <div className="text-sm text-gray-300">
          <span className="font-jetbrains">Available to borrow: </span>
          <span className="font-space-mono">{formatCurrency(availableToBorrow)}</span>
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
          <button 
            onClick={onDetails}
            className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains text-sm font-medium transition-all duration-200 hover:border-neon-green hover:scale-[1.02]"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );

  // Render the correct view based on cardView prop
  return (
    <>
      {cardView === 'default' && renderDefaultView()}
      {cardView === 'claim' && renderClaimView()}
      {cardView === 'borrow' && renderBorrowView()}
      {cardView === 'details' && renderDetailsView()}
    </>
  );
};

export default VaultCard;