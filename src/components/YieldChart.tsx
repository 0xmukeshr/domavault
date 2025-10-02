import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const YieldChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Generate realistic yield data
    const generateYieldData = () => {
      const domains = ['crypto.eth', 'defi.com', 'web3.io', 'nft.org'];
      const newData = [];

      for (let i = 0; i < 30; i++) {
        const dataPoint: any = {
          day: `Day ${i + 1}`,
        };

        domains.forEach(domain => {
          const baseYield = Math.random() * 20 + 5; // 5-25% base yield
          const dailyVariance = (Math.random() - 0.5) * 2; // ±1% daily variance
          dataPoint[domain] = Math.max(0, baseYield + dailyVariance);
        });

        newData.push(dataPoint);
      }
      return newData;
    };

    setData(generateYieldData());
    
    // Update data every 10 seconds
    const interval = setInterval(() => {
      setData(generateYieldData());
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 font-mono text-sm">
          <p className="text-gray-400 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {entry.value.toFixed(2)}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const colors = ['#00ff41', '#00d4ff', '#bf00ff', '#ff6b35'];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-right">
          <div className="text-lg font-display text-white">Yield Trends</div>
          <div className="text-sm text-gray-400 font-mono">Last 30 Days</div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis 
            dataKey="day" 
            stroke="#666" 
            fontSize={12}
            fontFamily="Share Tech Mono"
            interval={4}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12}
            fontFamily="Share Tech Mono"
            tickFormatter={(value) => `${value.toFixed(0)}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          {['crypto.eth', 'defi.com', 'web3.io', 'nft.org'].map((domain, index) => (
            <Area
              key={domain}
              type="monotone"
              dataKey={domain}
              stackId="1"
              stroke={colors[index]}
              fill={colors[index]}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="flex flex-wrap gap-4 mt-4">
        {['crypto.eth', 'defi.com', 'web3.io', 'nft.org'].map((domain, index) => (
          <div key={domain} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: colors[index] }}
            ></div>
            <span className="text-xs font-mono text-gray-400">{domain}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YieldChart;