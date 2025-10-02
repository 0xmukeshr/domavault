import React from 'react';

const Leaderboard: React.FC = () => {

  const allRankings = [
    { rank: 1, domain: 'premium.eth', owner: 'DeFiMaster', score: 96, value: 145000, yield: 19.2, generated: 15200, badges: ['Gold Vault', 'AI Champion'] },
    { rank: 2, domain: 'crypto.eth', owner: 'CryptoKing', score: 94, value: 125000, yield: 18.5, generated: 12500, badges: ['Top Performer', 'Early Adopter'] },
    { rank: 3, domain: 'defi.com', owner: 'Web3Wizard', score: 91, value: 98000, yield: 16.2, generated: 9800, badges: ['Silver Vault', 'High Yield'] },
    { rank: 4, domain: 'nft.io', owner: 'TokenLord', score: 87, value: 82000, yield: 15.8, generated: 8200, badges: ['Bronze Vault'] },
    { rank: 5, domain: 'dao.xyz', owner: 'ChainMaster', score: 84, value: 76500, yield: 14.9, generated: 7650, badges: ['Rising Star'] },
    { rank: 6, domain: 'web3.org', owner: 'BlockchainPro', score: 82, value: 71000, yield: 14.2, generated: 7100, badges: ['Consistent'] },
    { rank: 7, domain: 'meta.io', owner: 'FutureTech', score: 79, value: 65000, yield: 13.8, generated: 6500, badges: ['Stable Yield'] },
    { rank: 8, domain: 'token.co', owner: 'DigitalNomad', score: 76, value: 58000, yield: 12.5, generated: 5800, badges: ['New Entry'] },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400';
      case 2:
        return 'text-gray-300';
      case 3:
        return 'text-yellow-600';
      default:
        return 'text-white';
    }
  };


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-space-mono font-bold text-white tracking-widest">LEADERBOARD</h1>
        <p className="text-gray-400 font-jetbrains mt-1">Top performing vault owners across the ecosystem</p>
      </div>


      {/* Full Rankings Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">Rank</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">Domain/Owner</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">AI Score</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">Vault Value</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">Yield%</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">Generated</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {allRankings.map((user) => (
                <tr key={user.rank} className="hover:bg-gray-800/70 transition-all duration-200 hover:scale-[1.01]">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className={`text-2xl font-space-mono font-bold ${user.rank <= 3 ? getRankColor(user.rank) : 'text-white'}`}>#{user.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-lg font-space-mono font-bold text-white hover:text-neon-green transition-colors">{user.domain}</div>
                      <div className="text-sm text-gray-400 font-jetbrains">Owner: {user.owner}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-xl font-space-mono font-bold ${getScoreColor(user.score)} animate-pulse`}>
                      {user.score}/100
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-space-mono font-bold text-white">{formatCurrency(user.value)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-space-mono font-bold text-neon-green">{user.yield}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-space-mono font-bold text-white">{formatCurrency(user.generated)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.badges.map((badge, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-neon-green/20 text-neon-green text-xs font-jetbrains rounded-full border border-neon-green/30 hover:bg-neon-green/30 transition-colors"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;