import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletPrompt: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-4xl font-space-mono font-bold text-white mb-4 tracking-widest">
            Connect Your Wallet
          </h1>
          <p className="text-xl text-gray-400 font-jetbrains mb-8">
            Access the DomaVault ecosystem and start managing your domain assets
          </p>
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
                          className="px-12 py-4 bg-gradient-to-r from-neon-green to-neon-blue text-black font-orbitron font-bold text-xl rounded-lg hover:scale-105 transition-all duration-300"
                        >
                          Connect Wallet
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