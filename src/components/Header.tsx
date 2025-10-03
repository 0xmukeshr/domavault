import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/95 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-9 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-4xl font-righteous text-white tracking-wider">
            DomaVault
          </h1>
        </div>

        <ConnectButton />
      </div>
    </header>
  );
};

export default Header;