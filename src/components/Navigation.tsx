import React from 'react';
import { BarChart3, Plus, Trophy, TrendingUp, Brain } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onCreateVault: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onPageChange, onCreateVault }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'create', label: 'Create Vault', icon: Plus },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'options', label: 'Options', icon: TrendingUp },
    { id: 'analytics', label: 'Analytics', icon: Brain },
  ];

  return (
    <nav className="border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-9">
        <div className="grid grid-cols-5 gap-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'create') {
                    onCreateVault();
                  } else {
                    onPageChange(item.id);
                  }
                }}
                className={`
                  flex flex-col items-center space-y-2 py-4 px-4 font-jetbrains text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gray-900 border-b-2 border-neon-green text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-900/50 hover:border-b-2 hover:border-neon-green'
                  }
                `}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;