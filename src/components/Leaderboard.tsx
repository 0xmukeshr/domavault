import React from 'react';
import { Trophy, Crown, Award, Star } from 'lucide-react';

const Leaderboard: React.FC = () => {
  const topThree = [
    { rank: 2, domain: 'crypto.eth', owner: 'CryptoKing', score: 94, value: 125000, yield: 18.5, generated: 12500, badges: ['🏆 Top Performer', '🚀 Early Adopter'] },
    { rank: 1, domain: 'premium.eth', owner: 'DeFiMaster', score: 96, value: 145000, yield: 19.2, generated: 15200, badges: ['👑 Gold Vault', '🤖 AI Champion'] },
    { rank: 3, domain: 'defi.com', owner: 'Web3Wizard', score: 91, value: 98000, yield: 16.2, generated: 9800, badges: ['🥈 Silver Vault', '📈 High Yield'] },
  ];

  const allRankings = [
    { rank: 1, domain: 'premium.eth', owner: 'DeFiMaster', score: 96, value: 145000, yield: 19.2, generated: 15200, badges: ['👑 Gold Vault', '🤖 AI Champion'] },
    { rank: 2, domain: 'crypto.eth', owner: 'CryptoKing', score: 94, value: 125000, yield: 18.5, generated: 12500, badges: ['🏆 Top Performer', '🚀 Early Adopter'] },
    { rank: 3, domain: 'defi.com', owner: 'Web3Wizard', score: 91, value: 98000, yield: 16.2, generated: 9800, badges: ['🥈 Silver Vault', '📈 High Yield'] },
    { rank: 4, domain: 'nft.io', owner: 'TokenLord', score: 87, value: 82000, yield: 15.8, generated: 8200, badges: ['🥉 Bronze Vault'] },
    { rank: 5, domain: 'dao.xyz', owner: 'ChainMaster', score: 84, value: 76500, yield: 14.9, generated: 7650, badges: ['⭐ Rising Star'] },
    { rank: 6, domain: 'web3.org', owner: 'BlockchainPro', score: 82, value: 71000, yield: 14.2, generated: 7100, badges: ['🔄 Consistent'] },
    { rank: 7, domain: 'meta.io', owner: 'FutureTech', score: 79, value: 65000, yield: 13.8, generated: 6500, badges: ['📊 Stable Yield'] },
    { rank: 8, domain: 'token.co', owner: 'DigitalNomad', score: 76, value: 58000, yield: 12.5, generated: 5800, badges: ['🆕 New Entry'] },
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

  const getPodiumIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="text-yellow-400 animate-pulse" size={48} />;
      case 2:
        return <Trophy className="text-gray-300 animate-pulse" size={40} />;
      case 3:
        return <Award className="text-yellow-600 animate-pulse" size={36} />;
      default:
        return null;
    }
  };

  const getPodiumHeight = (rank: number) => {
    switch (rank) {
      case 1:
        return 'h-32';
      case 2:
        return 'h-24';
      case 3:
        return 'h-20';
      default:
        return 'h-16';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-orbitron font-bold text-white">🏆 Leaderboard</h1>
        <p className="text-gray-400 font-jetbrains mt-1">Top performing vault owners across the ecosystem</p>
      </div>

      {/* Top 3 Podium */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-neon-green/5 via-transparent to-neon-blue/5"></div>
        <h2 className="text-2xl font-orbitron font-bold text-white mb-8 text-center relative z-10">🎯 Elite Champions</h2>
        <div className="flex items-end justify-center space-x-8">
          {[topThree[1], topThree[0], topThree[2]].map((user, index) => (
            <div key={user.rank} className="flex flex-col items-center relative z-10">
              <div className={`bg-gray-800 rounded-lg border-2 ${user.rank === 1 ? 'border-yellow-400' : user.rank === 2 ? 'border-gray-300' : 'border-yellow-600'} p-6 ${getPodiumHeight(user.rank)} flex flex-col items-center justify-center mb-4 w-48 hover:scale-105 transition-transform duration-300`}>
                <div className="mb-2">
                  {getPodiumIcon(user.rank)}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-orbitron font-bold text-white">#{user.rank}</div>
                  <div className="text-sm font-jetbrains text-gray-400">{user.domain}</div>
                  <div className={`text-lg font-orbitron font-bold ${getScoreColor(user.score)}`}>
                    {user.score}/100
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs font-jetbrains text-gray-400 uppercase tracking-wider">Owner</div>
                <div className="text-white font-jetbrains font-bold">{user.owner}</div>
                <div className="text-neon-green font-jetbrains text-lg font-bold">{formatCurrency(user.value)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Rankings Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">🏅 Rank</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">🌐 Domain/Owner</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">🤖 AI Score</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">💰 Vault Value</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">📈 Yield%</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">💎 Generated</th>
                <th className="px-6 py-4 text-left text-xs font-jetbrains uppercase tracking-wider text-gray-400">🏆 Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {allRankings.map((user) => (
                <tr key={user.rank} className="hover:bg-gray-800/70 transition-all duration-200 hover:scale-[1.01]">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-orbitron font-bold ${user.rank <= 3 ? 'text-neon-green' : 'text-white'}`}>#{user.rank}</span>
                      {user.rank <= 3 && (
                        <div className="scale-50">
                          {getPodiumIcon(user.rank)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-lg font-orbitron font-bold text-white hover:text-neon-green transition-colors">{user.domain}</div>
                      <div className="text-sm text-gray-400 font-jetbrains">👤 {user.owner}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-xl font-orbitron font-bold ${getScoreColor(user.score)} animate-pulse`}>
                      {user.score}/100
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-jetbrains font-bold text-white">{formatCurrency(user.value)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-jetbrains font-bold text-neon-green">{user.yield}%</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-lg font-jetbrains font-bold text-white">{formatCurrency(user.generated)}</div>
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