import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PortfolioChartProps {
  vaultData?: any[];
  hasVaults?: boolean;
}

const PortfolioChart: React.FC<PortfolioChartProps> = ({ vaultData, hasVaults = false }) => {
  const [data, setData] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    // Only generate data if user has vaults
    if (!hasVaults) {
      setData([]);
      return;
    }

    // Generate realistic portfolio data based on actual vault data
    const generateData = () => {
      // Calculate base value from actual vaults or use 0
      const baseValue = vaultData && vaultData.length > 0 
        ? vaultData.reduce((sum, vault) => sum + parseFloat(vault.collateralValue || '0'), 0)
        : 0;
        
      if (baseValue === 0) {
        return [];
      }

      const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
      const newData = [];

      for (let i = 0; i < points; i++) {
        const variance = (Math.random() - 0.5) * 0.05; // ±2.5% variance (more realistic)
        const trend = i * 0.001; // Slight upward trend
        const value = baseValue * (1 + trend + variance);
        
        let label;
        if (timeframe === '24h') {
          label = `${i}:00`;
        } else if (timeframe === '7d') {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          label = days[i];
        } else {
          label = `Day ${i + 1}`;
        }

        newData.push({
          time: label,
          value: Math.round(value),
          yield: Math.round((value - baseValue) * 100) / 100,
        });
      }
      return newData;
    };

    setData(generateData());
    
    // Update data every 30 seconds for real-time effect (less frequent when based on real data)
    const interval = setInterval(() => {
      if (hasVaults) {
        setData(generateData());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [timeframe, vaultData, hasVaults]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 font-mono text-sm">
          <p className="text-gray-400">{label}</p>
          <p className="text-neon-green">
            Value: ${payload[0].value.toLocaleString()}
          </p>
          <p className="text-neon-blue">
            Change: ${payload[0].payload.yield > 0 ? '+' : ''}${payload[0].payload.yield}
          </p>
        </div>
      );
    }
    return null;
  };

  // Show empty state if no vaults exist
  if (!hasVaults || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-gray-500 text-lg font-space-mono mb-2">No Portfolio Data</div>
          <div className="text-gray-400 text-sm font-jetbrains">Create a vault to view your portfolio performance</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          {['24h', '7d', '30d'].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all duration-200 ${
                timeframe === period
                  ? 'bg-neon-green text-black'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
        <div className="text-right">
          <div className="text-lg font-display text-white">
            ${data[data.length - 1]?.value.toLocaleString() || '0'}
          </div>
          <div className="text-sm text-neon-green font-mono">
            +{((data[data.length - 1]?.value - data[0]?.value) / data[0]?.value * 100 || 0).toFixed(2)}%
          </div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="time" 
            stroke="#666" 
            fontSize={12}
            fontFamily="Share Tech Mono"
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
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;