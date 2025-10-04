import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const Header: React.FC = () => {
  const { isConnected } = useAccount();
  
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-black/95 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-9 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-4xl font-righteous text-white tracking-wider">
            DomaVault
          </h1>
        </div>

        {/* Only show ConnectButton when user is connected */}
        {isConnected && <ConnectButton />}
      </div>
    </header>
  );
};

export default Header;