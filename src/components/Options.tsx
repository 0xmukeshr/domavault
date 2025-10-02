import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Clock, DollarSign, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OptionsProps {
  initialSelectedVault?: string;
}

const Options: React.FC<OptionsProps> = ({ initialSelectedVault }) => {
  const activeOptions = [
    {
      id: 'OPT-0001',
      domain: 'crypto.eth',
      type: 'CALL',
      strike: 10000,
      expiry: '25d',
      pnl: 1250,
      status: 'Active',
      quantity: 1
    },
    {
      id: 'OPT-0002',
      domain: 'defi.com',
      type: 'PUT',
      strike: 30000,
      expiry: '18d',
      pnl: -420,
      status: 'Active',
      quantity: 2
    },
    {
      id: 'OPT-0003',
      domain: 'web3.io',
      type: 'CALL',
      strike: 25000,
      expiry: '12d',
      pnl: 850,
      status: 'ITM',
      quantity: 1
    },
  ];

  const [selectedVault, setSelectedVault] = useState(initialSelectedVault ?? 'crypto.eth');
  const [optionType, setOptionType] = useState('CALL');
  const [strikePrice, setStrikePrice] = useState('15000');
  const [expiry, setExpiry] = useState('30');
  const [quantity, setQuantity] = useState('1');
  const [mintingOption, setMintingOption] = useState(false);
  const [exercisingOption, setExercisingOption] = useState<string | null>(null);
  const [closingOption, setClosingOption] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [activeOptionsState, setActiveOptionsState] = useState(activeOptions);

  const vaults = [
    { name: 'crypto.eth', value: 42500 },
    { name: 'defi.com', value: 35200 },
    { name: 'web3.io', value: 28900 },
    { name: 'nft.org', value: 18830 },
  ];

  // Update selected vault if prop changes
  React.useEffect(() => {
    if (initialSelectedVault) setSelectedVault(initialSelectedVault);
  }, [initialSelectedVault]);

  const selectedVaultData = vaults.find(v => v.name === selectedVault);
  const premiumCost = parseInt(strikePrice) * 0.05;
  const breakeven = parseInt(strikePrice) + premiumCost;

  // Generate P&L chart data
  const generatePLData = () => {
    const data = [];
    const strike = parseInt(strikePrice);
    const premium = premiumCost;
    
    for (let price = strike * 0.5; price <= strike * 1.5; price += strike * 0.05) {
      let pnl;
      if (optionType === 'CALL') {
        pnl = Math.max(0, price - strike) - premium;
      } else {
        pnl = Math.max(0, strike - price) - premium;
      }
      data.push({
        price: Math.round(price),
        pnl: Math.round(pnl),
      });
    }
    return data;
  };

  const handleMintOption = async () => {
    setMintingOption(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 3000));
    setMintingOption(false);
  };

  const handleExerciseOption = async (optionId: string) => {
    setExercisingOption(optionId);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExercisingOption(null);
    // Remove from active options
    setActiveOptionsState(prev => prev.filter(opt => opt.id !== optionId));
  };

  const handleCloseOption = async (optionId: string) => {
    setClosingOption(optionId);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    setClosingOption(null);
    // Remove from active options
    setActiveOptionsState(prev => prev.filter(opt => opt.id !== optionId));
  };

  const handleShowDetails = (optionId: string) => {
    const option = activeOptionsState.find(opt => opt.id === optionId);
    if (option) {
      setShowDetails(showDetails === optionId ? null : optionId);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 font-jetbrains text-sm">
          <p className="text-gray-400">Price: ${label.toLocaleString()}</p>
          <p className={`${payload[0].value >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
            P&L: ${payload[0].value >= 0 ? '+' : ''}${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-space-mono font-bold text-white tracking-widest">OPTIONS PANEL</h1>
        <p className="text-gray-400 font-jetbrains mt-1">Mint and manage synthetic options on your domain vaults</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Option Creation Form */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-space-mono font-bold text-white mb-6 tracking-wide">MINT NEW OPTION</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-jetbrains text-gray-400 mb-2">Select Vault/Domain</label>
                <select
                  value={selectedVault}
                  onChange={(e) => setSelectedVault(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains focus:border-neon-green focus:outline-none transition-colors"
                >
                  {vaults.map((vault) => (
                    <option key={vault.name} value={vault.name}>
                      {vault.name} ({formatCurrency(vault.value)})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-jetbrains text-gray-400 mb-2">Option Type</label>
                <select
                  value={optionType}
                  onChange={(e) => setOptionType(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains focus:border-neon-green focus:outline-none transition-colors"
                >
                  <option value="CALL">Call Option</option>
                  <option value="PUT">Put Option</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-jetbrains text-gray-400 mb-2">Strike Price</label>
                <input
                  type="number"
                  value={strikePrice}
                  onChange={(e) => setStrikePrice(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains focus:border-neon-green focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm font-jetbrains text-gray-400 mb-2">Expiry</label>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains focus:border-neon-green focus:outline-none transition-colors"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-jetbrains text-gray-400 mb-2">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="1"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains focus:border-neon-green focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Payoff Chart Placeholder */}
            <div className="mb-8">
              <h3 className="text-lg font-space-mono font-bold text-white mb-4 text-center tracking-wide">PROFIT & LOSS CHART</h3>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-600">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={generatePLData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="price" 
                      stroke="#666" 
                      fontSize={12}
                      fontFamily="JetBrains Mono"
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12}
                      fontFamily="JetBrains Mono"
                      tickFormatter={(value) => `$${value >= 0 ? '+' : ''}${value}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="pnl" 
                      stroke="#00ff41" 
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: '#00ff41' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Option Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-sm font-jetbrains uppercase tracking-wider text-gray-400 mb-1">Premium Cost</div>
                <div className="text-lg font-space-mono font-bold text-white">{formatCurrency(premiumCost)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-jetbrains uppercase tracking-wider text-gray-400 mb-1">Max Profit</div>
                <div className="text-lg font-space-mono font-bold text-neon-green">Unlimited</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-jetbrains uppercase tracking-wider text-gray-400 mb-1">Max Loss</div>
                <div className="text-lg font-space-mono font-bold text-red-400">{formatCurrency(premiumCost)}</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-jetbrains uppercase tracking-wider text-gray-400 mb-1">Breakeven</div>
                <div className="text-lg font-space-mono font-bold text-white">{formatCurrency(breakeven)}</div>
              </div>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={handleMintOption}
                disabled={mintingOption}
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-white font-jetbrains font-medium transition-all duration-200 hover:from-green-700 hover:to-green-800 hover:scale-[1.02] flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrendingUp size={20} />
                <span>{mintingOption ? 'Minting...' : `Mint ${optionType} Option`}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Options */}
        <div>
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-space-mono font-bold text-white mb-6 tracking-wide">ACTIVE OPTIONS</h2>
            
            <div className="space-y-4">
              {activeOptionsState.map((option) => (
                <div
                  key={option.id}
                  className="bg-gray-800 rounded-lg border border-gray-600 p-4 hover:border-neon-green transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-space-mono font-bold text-white">{option.domain}</div>
                      <div className="text-xs text-gray-400 font-jetbrains">ID: {option.id}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {option.type === 'CALL' ? (
                        <TrendingUp size={16} className="text-neon-green" />
                      ) : (
                        <TrendingDown size={16} className="text-red-400" />
                      )}
                      <span className="text-sm font-jetbrains text-white">{option.type}</span>
                      <span className="text-xs text-gray-400">Qty:{option.quantity}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div>
                      <div className="text-gray-400">Strike</div>
                      <div className="text-white font-space-mono">{formatCurrency(option.strike)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Expiry</div>
                      <div className="text-white font-space-mono">{option.expiry}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">P&L</div>
                      <div className={`font-space-mono font-bold ${option.pnl >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                        {option.pnl >= 0 ? '+' : ''}{formatCurrency(option.pnl)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleExerciseOption(option.id)}
                      disabled={exercisingOption === option.id || option.status !== 'ITM'}
                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs font-jetbrains hover:bg-green-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {exercisingOption === option.id ? 'Exercising...' : 'Exercise'}
                    </button>
                    <button 
                      onClick={() => handleShowDetails(option.id)}
                      className="flex-1 px-3 py-1.5 bg-gray-600 text-white rounded text-xs font-jetbrains hover:bg-gray-700 transition-colors font-bold"
                    >
                      Details
                    </button>
                    <button 
                      onClick={() => handleCloseOption(option.id)}
                      disabled={closingOption === option.id}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs font-jetbrains hover:bg-red-700 transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {closingOption === option.id ? 'Closing...' : 'Close'}
                    </button>
                  </div>

                  {/* Option Details */}
                  {showDetails === option.id && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-gray-600">
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Option ID:</span>
                          <span className="text-white font-mono">{option.id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Domain:</span>
                          <span className="text-white font-mono">{option.domain}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-white font-mono">{option.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Strike Price:</span>
                          <span className="text-white font-mono">{formatCurrency(option.strike)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Quantity:</span>
                          <span className="text-white font-mono">{option.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expiry:</span>
                          <span className="text-white font-mono">{option.expiry}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current P&L:</span>
                          <span className={`font-mono ${option.pnl >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                            {option.pnl >= 0 ? '+' : ''}{formatCurrency(option.pnl)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Status:</span>
                          <span className="text-white font-mono">{option.status}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;