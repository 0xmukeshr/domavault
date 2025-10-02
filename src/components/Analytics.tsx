import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, Star, BarChart3, Activity } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const Analytics: React.FC = () => {
  const [selectedDomain, setSelectedDomain] = useState('crypto.eth');
  const [radarData, setRadarData] = useState<any[]>([]);
  const [priceData, setPriceData] = useState<any[]>([]);

  const domains = [
    { name: 'crypto.eth', score: 94, value: 42500, yield: 18.5, rank: 2 },
    { name: 'defi.com', score: 87, value: 35200, yield: 15.2, rank: 4 },
    { name: 'web3.io', score: 91, value: 28900, yield: 17.3, rank: 3 },
    { name: 'nft.org', score: 76, value: 18830, yield: 13.9, rank: 8 },
  ];

  const opportunities = [
    {
      domain: 'premium.eth',
      score: 94,
      roi: 18.5,
      trend: 'Rising',
      risk: 'Low',
      description: 'High-value domain with strong market presence'
    },
    {
      domain: 'token.com',
      score: 91,
      roi: 16.2,
      trend: 'Stable',
      risk: 'Low',
      description: 'Established domain in crypto space'
    },
    {
      domain: 'dao.io',
      score: 87,
      roi: 15.8,
      trend: 'Rising',
      risk: 'Medium',
      description: 'Growing sector with potential upside'
    },
  ];

  useEffect(() => {
    // Generate radar chart data
    const generateRadarData = () => {
      const selectedDomainData = domains.find(d => d.name === selectedDomain);
      if (!selectedDomainData) return [];

      return [
        { subject: 'Length', A: Math.min(100, selectedDomainData.score + Math.random() * 10 - 5), fullMark: 100 },
        { subject: 'TLD Premium', A: Math.min(100, selectedDomainData.score - 10 + Math.random() * 20), fullMark: 100 },
        { subject: 'Keywords', A: Math.min(100, selectedDomainData.score - 5 + Math.random() * 15), fullMark: 100 },
        { subject: 'Market Demand', A: Math.min(100, selectedDomainData.score + Math.random() * 8 - 4), fullMark: 100 },
        { subject: 'Brandability', A: Math.min(100, selectedDomainData.score - 15 + Math.random() * 25), fullMark: 100 },
        { subject: 'SEO Value', A: Math.min(100, selectedDomainData.score - 8 + Math.random() * 18), fullMark: 100 },
      ];
    };

    // Generate price prediction data
    const generatePriceData = () => {
      const selectedDomainData = domains.find(d => d.name === selectedDomain);
      if (!selectedDomainData) return [];

      const data = [];
      const baseValue = selectedDomainData.value;
      
      // Historical data (30 days)
      for (let i = -30; i <= 0; i++) {
        const variance = (Math.random() - 0.5) * 0.1;
        const trend = i * 0.001;
        const value = baseValue * (1 + trend + variance);
        data.push({
          day: i,
          value: Math.round(value),
          type: 'historical'
        });
      }

      // Future predictions (30 days)
      for (let i = 1; i <= 30; i++) {
        const variance = (Math.random() - 0.5) * 0.08;
        const trend = i * 0.003; // Positive trend
        const value = baseValue * (1 + trend + variance);
        data.push({
          day: i,
          value: Math.round(value),
          type: 'prediction'
        });
      }

      return data;
    };

    setRadarData(generateRadarData());
    setPriceData(generatePriceData());

    // Update data every 15 seconds
    const interval = setInterval(() => {
      setRadarData(generateRadarData());
      setPriceData(generatePriceData());
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedDomain]);

  const selectedDomainData = domains.find(d => d.name === selectedDomain);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-neon-green';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Rising':
        return 'text-neon-green';
      case 'Stable':
        return 'text-neon-blue';
      case 'Falling':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-neon-green';
      case 'Medium':
        return 'text-yellow-400';
      case 'High':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 font-mono text-sm">
          <p className="text-gray-400">Day {label}</p>
          <p className="text-neon-green">
            Value: ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-space-mono font-bold text-white tracking-widest">AI ANALYTICS</h1>
          <p className="text-gray-400 font-jetbrains mt-1">Comprehensive domain analytics and forecasting</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-jetbrains text-gray-400">Analyze Domain:</label>
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains focus:border-neon-green focus:outline-none"
          >
            {domains.map((domain) => (
              <option key={domain.name} value={domain.name}>
                {domain.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Domain Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-neon-purple transition-all duration-300">
          <Brain className="text-neon-purple mx-auto mb-3" size={32} />
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">AI Rarity Score</div>
          <div className={`text-3xl font-space-mono font-bold ${getScoreColor(selectedDomainData?.score || 0)}`}>
            {selectedDomainData?.score}/100
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-neon-blue transition-all duration-300">
          <Target className="text-neon-blue mx-auto mb-3" size={32} />
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Vault Value</div>
          <div className="text-2xl font-space-mono font-bold text-white">
            {formatCurrency(selectedDomainData?.value || 0)}
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-neon-green transition-all duration-300">
          <TrendingUp className="text-neon-green mx-auto mb-3" size={32} />
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Predicted Yield</div>
          <div className="text-2xl font-space-mono font-bold text-neon-green">
            {selectedDomainData?.yield.toFixed(2)}%
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 text-center hover:border-yellow-400 transition-all duration-300">
          <Star className="text-yellow-400 mx-auto mb-3" size={32} />
          <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Market Rank</div>
          <div className="text-2xl font-space-mono font-bold text-white">
            #{selectedDomainData?.rank}
          </div>
        </div>
      </div>

      {/* Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Domain Traits Analysis */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-space-mono font-bold text-white mb-6 text-center tracking-wide">Domain Traits Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#333" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ fontSize: 12, fontFamily: 'Share Tech Mono', fill: '#9CA3AF' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fontSize: 10, fontFamily: 'Share Tech Mono', fill: '#6B7280' }}
              />
              <Radar
                name="Score"
                dataKey="A"
                stroke="#00ff41"
                fill="#00ff41"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Price Trend Prediction */}
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-space-mono font-bold text-white mb-6 text-center tracking-wide">Price Trend Prediction</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="day" 
                stroke="#666" 
                fontSize={12}
                fontFamily="Share Tech Mono"
                tickFormatter={(value) => value === 0 ? 'Today' : value > 0 ? `+${value}d` : `${value}d`}
              />
              <YAxis 
                stroke="#666" 
                fontSize={12}
                fontFamily="Share Tech Mono"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00ff41" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#00ff41' }}
                strokeDasharray={(entry: any) => entry?.type === 'prediction' ? '5 5' : '0'}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="bg-gray-800 rounded-lg p-4 mt-4">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2 font-jetbrains">30-Day Forecast:</div>
              <div className="text-2xl font-space-mono font-bold text-neon-green mb-1">
                {formatCurrency((selectedDomainData?.value || 0) * 1.15)}
              </div>
              <div className="text-sm text-neon-green font-jetbrains">Expected: +15% growth</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Opportunities */}
      <div>
        <h2 className="text-2xl font-space-mono font-bold text-white mb-6 tracking-wide">Top Opportunities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {opportunities.map((opportunity, index) => (
            <div
              key={index}
              className="bg-gradient-to-b from-gray-900 to-gray-800 border border-gray-700 rounded-lg p-6 transition-all duration-200 hover:border-neon-green hover:transform hover:-translate-y-1 hover:shadow-lg hover:shadow-neon-green/20"
            >
              <div className="text-center mb-4">
                <div className="text-lg font-space-mono font-bold text-white mb-2">
                  {opportunity.domain}
                </div>
                <div className={`text-2xl font-space-mono font-bold ${getScoreColor(opportunity.score)} mb-1`}>
                  AI Score: {opportunity.score}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-jetbrains text-sm">ROI:</span>
                  <span className="text-neon-green font-space-mono font-bold">{opportunity.roi}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-jetbrains text-sm">Trend:</span>
                  <span className={`font-jetbrains font-bold ${getTrendColor(opportunity.trend)}`}>
                    {opportunity.trend}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-jetbrains text-sm">Risk:</span>
                  <span className={`font-jetbrains font-bold ${getRiskColor(opportunity.risk)}`}>
                    {opportunity.risk}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-400 font-jetbrains mb-4">
                {opportunity.description}
              </div>

              <button className="w-full px-4 py-2 bg-gradient-to-r from-neon-green to-neon-blue text-black font-jetbrains font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-neon-green/30 rounded-lg">
                Stake
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;