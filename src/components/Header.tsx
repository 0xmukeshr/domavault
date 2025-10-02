import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/95 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-9 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-green to-neon-blue rounded-lg flex items-center justify-center animate-glow">
            <span className="text-black font-bold text-sm">D</span>
          </div>
          <h1 className="text-3xl font-orbitron font-bold text-white tracking-wider">
            DomaVault
          </h1>
        </div>

        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;