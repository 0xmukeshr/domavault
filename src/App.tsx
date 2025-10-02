import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import CreateVaultModal from './components/CreateVaultModal';
import Leaderboard from './components/Leaderboard';
import Options from './components/Options';
import Analytics from './components/Analytics';
import WalletPrompt from './components/WalletPrompt';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isCreateVaultOpen, setIsCreateVaultOpen] = useState(false);
  const { isConnected } = useAccount();

  const renderCurrentPage = () => {
    if (!isConnected) {
      return <WalletPrompt />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onCreateVault={() => setIsCreateVaultOpen(true)} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'options':
        return <Options />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard onCreateVault={() => setIsCreateVaultOpen(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200">
      <div className="min-h-screen bg-black">
        <Header />
        
        {isConnected && (
          <Navigation 
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onCreateVault={() => setIsCreateVaultOpen(true)}
          />
        )}
        
        <main className="max-w-7xl mx-auto px-9 py-8">
          {renderCurrentPage()}
        </main>

        {isCreateVaultOpen && isConnected && (
          <CreateVaultModal onClose={() => setIsCreateVaultOpen(false)} />
        )}
      </div>
    </div>
  );
}

export default App;