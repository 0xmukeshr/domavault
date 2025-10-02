import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  change: string;
  positive: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, change, positive }) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 transition-all duration-200 hover:border-neon-green hover:transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-neon-green/20">
      <div className="text-xs font-jetbrains uppercase tracking-wider text-gray-400 mb-2">
        {label}
      </div>
      <div className="text-2xl font-orbitron font-bold text-white mb-1">
        {value}
      </div>
      <div className={`text-sm font-jetbrains ${positive ? 'text-neon-green' : 'text-red-400'}`}>
        {change}
      </div>
    </div>
  );
};

export default MetricCard;