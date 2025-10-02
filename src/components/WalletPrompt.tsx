import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, Shield, Zap } from 'lucide-react';

const WalletPrompt: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-neon-green to-neon-blue rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
            <Wallet size={48} className="text-black" />
          </div>
          <h1 className="text-5xl font-orbitron font-bold text-white mb-4 tracking-wide">
            Connect Your Wallet
          </h1>
          <p className="text-xl text-gray-400 font-jetbrains mb-8">
            Access the DomaVault ecosystem and start managing your domain assets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-neon-green transition-all duration-300">
            <Shield className="text-neon-green mx-auto mb-4" size={32} />
            <h3 className="text-lg font-orbitron text-white mb-2">🔒 Secure</h3>
            <p className="text-sm text-gray-400 font-jetbrains">Your wallet, your keys. We never store your private information.</p>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-neon-blue transition-all duration-300">
            <Zap className="text-neon-blue mx-auto mb-4" size={32} />
            <h3 className="text-lg font-orbitron text-white mb-2">⚡ Fast</h3>
            <p className="text-sm text-gray-400 font-jetbrains">Lightning-fast transactions across multiple networks.</p>
          </div>
          
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 hover:border-neon-purple transition-all duration-300">
            <Wallet className="text-neon-purple mx-auto mb-4" size={32} />
            <h3 className="text-lg font-orbitron text-white mb-2">🔗 Compatible</h3>
            <p className="text-sm text-gray-400 font-jetbrains">Works with MetaMask, WalletConnect, and more.</p>
          </div>
        </div>

        <div className="flex justify-center">
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              authenticationStatus,
              mounted,
            }) => {
              const ready = mounted && authenticationStatus !== 'loading';
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus ||
                  authenticationStatus === 'authenticated');

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="px-12 py-4 bg-gradient-to-r from-neon-green to-neon-blue text-black font-orbitron font-bold text-xl rounded-lg hover:scale-105 transition-all duration-300 animate-glow"
                        >
                          🚀 Connect Wallet
                        </button>
                      );
                    }

                    return null;
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </div>
  );
};

export default WalletPrompt;