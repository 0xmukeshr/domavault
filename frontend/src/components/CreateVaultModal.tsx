import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { HiOutlineXMark, HiOutlineCheckCircle, HiOutlineChevronRight, HiOutlineSparkles } from 'react-icons/hi2';
import { RiFileCloseRegular } from 'react-icons/ri';
import { TbDiamond } from 'react-icons/tb';
import { contractService, DomainNFT } from '../services/contractService';

interface CreateVaultModalProps {
  onClose: () => void;
}

const CreateVaultModal: React.FC<CreateVaultModalProps> = ({ onClose }) => {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedNFT, setSelectedNFT] = useState<string>('');
  const [stakeAmount, setStakeAmount] = useState('20');
  const [ltvRatio, setLtvRatio] = useState(65);
  const [ownedNFTs, setOwnedNFTs] = useState<DomainNFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingVault, setCreatingVault] = useState(false);

  // Load owned NFTs when modal opens
  useEffect(() => {
    const loadOwnedNFTs = async () => {
      if (!isConnected || !address || !window.ethereum) {
        console.log('[CreateVaultModal] Not connected or no address');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log('[CreateVaultModal] Loading owned NFTs for:', address);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        await contractService.initialize(provider);
        
        const nfts = await contractService.getOwnedNFTs(address);
        console.log('[CreateVaultModal] Owned NFTs:', nfts);
        
        // If no NFTs found, show mock NFTs for testing
        if (nfts.length === 0) {
          console.log('[CreateVaultModal] No NFTs found, showing mock NFTs');
          const mockNFTs: DomainNFT[] = [
            { tokenId: '1', name: 'crypto.io', owned: false },
            { tokenId: '2', name: 'web3.io', owned: false },
            { tokenId: '3', name: 'defi.io', owned: false }
          ];
          setOwnedNFTs(mockNFTs);
        } else {
          setOwnedNFTs(nfts);
        }
      } catch (err) {
        console.error('[CreateVaultModal] Error loading NFTs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load NFTs');
        
        // Show mock NFTs on error
        const mockNFTs: DomainNFT[] = [
          { tokenId: '1', name: 'crypto.io', owned: false },
          { tokenId: '2', name: 'web3.io', owned: false },
          { tokenId: '3', name: 'defi.io', owned: false }
        ];
        setOwnedNFTs(mockNFTs);
      } finally {
        setLoading(false);
      }
    };

    loadOwnedNFTs();
  }, [isConnected, address]);

  const nfts = ownedNFTs.map(nft => ({
    id: nft.tokenId,
    name: nft.name,
    tld: nft.name.includes('.') ? nft.name.substring(nft.name.lastIndexOf('.')) : '.io',
    length: nft.name.split('.')[0].length,
    score: Math.floor(Math.random() * 30) + 70, // Mock score between 70-100
    owned: nft.owned
  }));

  const steps = [
    { id: 1, label: 'Select NFT', completed: currentStep > 1 },
    { id: 2, label: 'AI Insights', completed: currentStep > 2 },
    { id: 3, label: 'Enter Amount', completed: currentStep > 3 },
    { id: 4, label: 'Confirm', completed: false },
  ];

  const selectedNFTData = nfts.find(nft => nft.id === selectedNFT);
  const predictedYield = selectedNFTData ? 8.5 + (selectedNFTData.score - 50) * 0.2 : 8.5;
  const monthlyYield = (parseFloat(stakeAmount) * (predictedYield / 100)) / 12;
  const borrowingLimit = parseFloat(stakeAmount) * (ltvRatio / 100);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 className="text-xl font-space-mono font-bold text-white mb-6">Select Your Domain NFT</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400 animate-pulse">Loading your NFTs...</div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-400 mb-4">Error loading NFTs: {error}</div>
                <div className="text-gray-400 text-sm">Showing mock NFTs for testing</div>
              </div>
            ) : (
              <>
                {nfts.filter(n => n.owned).length === 0 && (
                  <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                    <div className="text-yellow-400 font-jetbrains text-sm">
                      ⚠️ You don't own any Domain NFTs yet. Click "Add Mock NFT" in the dashboard to mint one first.
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  {nfts.map((nft) => (
                  <div
                    key={nft.id}
                    onClick={() => nft.owned && setSelectedNFT(nft.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 relative ${
                      !nft.owned
                        ? 'border-gray-700 bg-gray-900/50 opacity-50 cursor-not-allowed'
                        : selectedNFT === nft.id
                        ? 'border-green-500 bg-green-500/10 cursor-pointer'
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500 cursor-pointer'
                    }`}
                  >
                    <div className="text-lg font-space-mono font-bold text-white mb-2">{nft.name}</div>
                    <div className="text-sm text-gray-400 space-y-1">
                      <div>TLD: {nft.tld}</div>
                      <div>Length: {nft.length}</div>
                      <div>Score: {nft.score}/100</div>
                    </div>
                    {!nft.owned && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
                        Not Owned
                      </div>
                    )}
                    {selectedNFT === nft.id && (
                      <button className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-jetbrains text-sm">
                        Selected
                      </button>
                    )}
                  </div>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h3 className="text-xl font-space-mono font-bold text-white mb-6">AI Insights for {selectedNFT}</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-6">
                <h4 className="text-lg font-space-mono font-bold text-white mb-4">AI Rarity Score</h4>
                <div className="text-center mb-6">
                  <div className={`text-4xl font-space-mono font-bold ${
                    selectedNFTData && selectedNFTData.score >= 90 ? 'text-green-400' : 
                    selectedNFTData && selectedNFTData.score >= 70 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {selectedNFTData?.score}/100
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Domain Length:</span>
                    <span>{selectedNFTData?.score || 0}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>TLD Premium:</span>
                    <span>{Math.max(0, (selectedNFTData?.score || 0) - 20)}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Keyword Value:</span>
                    <span>{Math.max(0, (selectedNFTData?.score || 0) - 15)}/100</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-6">
                <h4 className="text-lg font-space-mono font-bold text-white mb-4">Predicted Annual Yield</h4>
                <div className="text-center mb-6">
                  <div className="text-4xl font-space-mono font-bold text-green-400">
                    {predictedYield.toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex justify-between">
                    <span>Base APY:</span>
                    <span>8.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AI Bonus:</span>
                    <span>+{(predictedYield - 8.5).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Monthly:</span>
                    <span>${(parseFloat(stakeAmount) * (predictedYield / 100) / 12).toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 className="text-xl font-space-mono font-bold text-white mb-6">Enter Staking Amount</h3>
            <div className="mb-8">
              <label className="block text-sm font-jetbrains text-gray-400 mb-2">Amount to Stake (USD):</label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white font-jetbrains text-lg focus:border-green-500 focus:outline-none"
              />
            </div>

            <div className="border-t border-gray-700 pt-6 mb-8">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-sm font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Annual Yield</div>
                  <div className="text-2xl font-space-mono font-bold text-white">
                    ${(parseFloat(stakeAmount) * (predictedYield / 100)).toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-400">({predictedYield.toFixed(2)}% APY)</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Monthly Yield</div>
                  <div className="text-2xl font-space-mono font-bold text-white">
                    ${monthlyYield.toFixed(0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-jetbrains uppercase tracking-wider text-gray-400 mb-2">Borrowing Limit</div>
                  <div className="text-2xl font-space-mono font-bold text-white">
                    ${borrowingLimit.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-400">({ltvRatio}% LTV)</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm font-jetbrains text-gray-400 mb-3">Adjust Loan-to-Value Ratio</div>
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-sm font-jetbrains text-gray-400">LTV (%):</span>
                <div className="flex-1 relative">
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${ltvRatio}%` }}
                    ></div>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="80"
                    value={ltvRatio}
                    onChange={(e) => setLtvRatio(parseInt(e.target.value))}
                    className="absolute top-0 left-0 w-full h-3 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-sm font-jetbrains text-white w-12">{ltvRatio}%</span>
              </div>
              <div className="text-sm text-gray-400">
                <span className="font-jetbrains">Adjusted Borrowing Limit: </span><span className="font-space-mono">${borrowingLimit.toFixed(0)}</span>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h3 className="text-xl font-space-mono font-bold text-white mb-6">Confirm Vault Creation</h3>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-space-mono font-bold text-white mb-4">Vault Details</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Domain:</span>
                    <span className="text-white font-space-mono">{selectedNFT}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Staking Amount:</span>
                    <span className="text-white font-space-mono">${parseFloat(stakeAmount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">AI Rarity Score:</span>
                    <span className="text-white font-space-mono">{selectedNFTData?.score}/100</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-space-mono font-bold text-white mb-4">Expected Returns</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Predicted Yield:</span>
                    <span className="text-green-400 font-space-mono">{predictedYield.toFixed(1)}% APY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">LTV Ratio:</span>
                    <span className="text-white font-space-mono">{ltvRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Borrowing Power:</span>
                    <span className="text-white font-space-mono">${borrowingLimit.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedNFT !== '';
      case 2:
        return true;
      case 3:
        return parseFloat(stakeAmount) > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Create vault
      await createVault();
    }
  };

  const createVault = async () => {
    if (!selectedNFT) {
      setError('Please select an NFT');
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      setError('Please enter a valid stake amount');
      return;
    }

    const selectedNFTData = nfts.find(nft => nft.id === selectedNFT);
    if (!selectedNFTData) {
      setError('Selected NFT not found');
      return;
    }

    setCreatingVault(true);
    setError(null);

    try {
      console.log('[CreateVaultModal] Creating vault:', {
        tokenId: selectedNFT,
        domainName: selectedNFTData.name,
        initialValue: stakeAmount
      });
      
      const txHash = await contractService.createVault(selectedNFT, selectedNFTData.name, stakeAmount);
      console.log('[CreateVaultModal] Vault creation transaction hash:', txHash);
      
      console.log('[CreateVaultModal] Vault created successfully!');
      
      // Show success message briefly before closing
      setTimeout(() => {
        onClose();
        // Optionally trigger a refresh of the dashboard
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('[CreateVaultModal] Error creating vault:', err);
      setError(err instanceof Error ? err.message : 'Failed to create vault');
    } finally {
      setCreatingVault(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-space-mono font-bold text-white">Create New Vault</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <HiOutlineXMark size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  step.completed 
                    ? 'bg-green-500 border-green-500 text-white' 
                    : currentStep === step.id
                    ? 'border-green-500 text-green-500'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {step.completed ? <HiOutlineCheckCircle size={16} /> : step.id}
                </div>
                <span className={`ml-2 text-sm font-jetbrains ${
                  currentStep === step.id ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <HiOutlineChevronRight size={16} className="mx-4 text-gray-600" />
                )}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[400px]">
          {renderStep()}
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-600 rounded-lg">
              <div className="text-red-400 text-sm">{error}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-jetbrains ${
              currentStep === 1
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-600 hover:to-gray-700'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!canProceed() || creatingVault}
            className={`px-6 py-2 rounded-lg font-jetbrains ${
              canProceed() && !creatingVault
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            {creatingVault ? 'Creating...' : (currentStep === 4 ? 'Create Vault' : 'Next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateVaultModal;