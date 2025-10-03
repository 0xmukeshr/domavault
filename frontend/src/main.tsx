import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { defineChain } from 'viem';
import App from './App.tsx';
import './index.css';

// Define Doma Testnet chain
const domaTestnet = defineChain({
  id: 97476,
  name: 'Doma Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.doma.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Doma Testnet Explorer',
      url: 'https://explorer-testnet.doma.xyz',
    },
  },
  testnet: true,
});

const config = getDefaultConfig({
  appName: 'DomaVault',
  projectId: 'domavault-demo-project-id', // Using a placeholder ID to avoid 403 errors
  chains: [domaTestnet, mainnet, polygon, optimism, arbitrum, base],
  initialChain: domaTestnet, // Set Doma Testnet as the initial/default chain
  ssr: false,
});

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>
);
