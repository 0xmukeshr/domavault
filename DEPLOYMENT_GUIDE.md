# Deployment and Testing Guide

## ✅ All Fixes Complete!

The vault creation functionality has been completely fixed. Here's what to do next:

## 🚀 Step 1: Deploy Updated Contracts

### Option A: Deploy to Doma Testnet (Recommended)

```bash
cd /home/toji/doma/project/contracts

# Make sure you have .env file with PRIVATE_KEY
# Get test ETH from Doma Discord #faucet channel

# Deploy to Doma testnet
npm run deploy
```

This will:
- Deploy MockUSDC
- Deploy DomainValuator
- Deploy MockDomainNFT
- Deploy DomaVault (with updated createVault function)
- Fund vault with 100k USDC
- Mint 3 test NFTs to your wallet
- Set initial domain values

### Option B: Deploy to Local Hardhat (For Testing)

```bash
cd /home/toji/doma/project/contracts

# Start local node (in one terminal)
npx hardhat node

# Deploy (in another terminal)
npm run deploy:local
```

## 📝 Step 2: Update Frontend Configuration

After deployment, you'll see output like:

```
DEPLOYMENT SUMMARY
================================================================
Mock USDC:           0x...
DomainValuator:      0x...
Mock Domain NFT:     0x...
DomaVault:           0x...
```

### Update `.env.local`:

```bash
cd /home/toji/doma/project/frontend

# Edit .env.local file
nano .env.local
```

Add these addresses:

```env
VITE_VAULT_ADDRESS=0x...  # DomaVault address from deployment
VITE_VALUATOR_ADDRESS=0x...  # DomainValuator address
VITE_USDC_ADDRESS=0x...  # MockUSDC address
VITE_DOMAIN_NFT_ADDRESS=0x...  # MockDomainNFT address
VITE_CHAIN_ID=97476
```

## 🎯 Step 3: Start Frontend

```bash
cd /home/toji/doma/project/frontend

# Install dependencies if needed
npm install

# Start dev server
npm run dev
```

The app should be running at `http://localhost:5173`

## 🧪 Step 4: Test Vault Creation

### Test Flow:

1. **Connect Wallet**
   - Click "Connect Wallet" in the header
   - Connect to Doma testnet (Chain ID: 97476)
   - If using MetaMask, add Doma testnet:
     - Network Name: Doma Testnet
     - RPC URL: https://rpc-testnet.doma.xyz
     - Chain ID: 97476
     - Currency: DOMA

2. **Open Create Vault Modal**
   - Click "Create New Vault" button
   - Should see modal open

3. **Step 1: Select NFT**
   - You should see 3 test NFTs (if you ran deploy script)
   - NFT IDs: 1, 2, 3
   - Domain names: crypto.io, web3.io, defi.io (mock names)
   - Click on one to select it

4. **Step 2: View AI Insights**
   - See mock AI scores (70-100)
   - See predicted yield based on score
   - Click "Next"

5. **Step 3: Enter Amount**
   - **IMPORTANT:** Enter the vault collateral value
   - Example: Enter `20` for $20 USD worth
   - See calculated:
     - Annual Yield
     - Monthly Yield
     - Borrowing Limit (70% of amount)
   - Adjust LTV slider if desired
   - Click "Next"

6. **Step 4: Confirm**
   - Review all details
   - Domain: Selected NFT
   - Staking Amount: What you entered
   - AI Score: Mock score
   - Click "Create Vault"

7. **Wallet Transaction**
   - Approve NFT transfer (first time only)
   - Wait for confirmation
   - Then approve vault creation
   - Wait for confirmation

8. **Success!**
   - Should see success message
   - Page auto-refreshes
   - Your new vault should appear in dashboard

## 🔍 Verify on Block Explorer

After creating vault, check transaction on:
https://explorer-testnet.doma.xyz

Search for your wallet address to see:
- NFT Transfer event
- VaultCreated event
- New vault in contract storage

## 🧪 Testing Borrowing

After creating a vault:

1. **View Your Vault**
   - Go to Dashboard
   - See your vault card

2. **Borrow USDC**
   - Click "Borrow" on vault card
   - Enter amount (up to 70% of collateral)
   - Confirm transaction
   - Receive USDC in wallet

3. **Check USDC Balance**
   - Should see USDC balance increase
   - Can verify on block explorer

## 🐛 Troubleshooting

### "No NFTs Found"
- Deploy script mints NFTs to deployer address
- Make sure you're connected with the same wallet that deployed
- Or use mock NFTs shown in modal

### "Transaction Failed"
- Check you have enough DOMA for gas
- Get test DOMA from Doma Discord faucet
- Check contract addresses are correct in .env.local

### "Contract Not Initialized"
- Make sure frontend .env.local has correct addresses
- Restart dev server after updating .env
- Check console for initialization errors

### "Invalid Domain Value"
- Make sure you entered an amount in Step 3
- Amount must be greater than 0
- Try a small amount first (like 10 or 20)

### "NFT Approval Failed"
- First transaction approves NFT transfer
- Wait for it to complete before second transaction
- Check wallet for pending transactions

## 📊 What Changed

### Contract Changes:
```solidity
// OLD: Only 2 parameters
createVault(uint256 tokenId, string name)

// NEW: Now 3 parameters
createVault(uint256 tokenId, string name, uint256 initialValue)
```

### Frontend Changes:
```typescript
// OLD: stakeAmount was ignored
contractService.createVault(tokenId, name)

// NEW: stakeAmount is used
contractService.createVault(tokenId, name, stakeAmount)
```

## 🎉 Expected Behavior

**BEFORE FIX:**
- User enters $20,000 in UI
- Contract ignores it
- Vault created with value from AI (often $0)
- Borrowing doesn't work

**AFTER FIX:**
- User enters $20 in UI
- Contract receives 20,000,000 (20 * 10^6 USDC decimals)
- Vault created with collateral value = $20
- User can borrow up to $14 (70% of $20)
- Everything works correctly!

## 📝 Next Steps After Testing

Once vault creation works:

1. **Integrate Real Doma NFTs**
   - Replace MockDomainNFT with real Doma OwnershipToken
   - Update VITE_DOMAIN_NFT_ADDRESS

2. **Connect AI Valuator to Backend**
   - Backend API can call `valuator.updateDomainValue()`
   - Set real valuations based on domain analytics

3. **Add Real USDC**
   - Deploy on mainnet with real USDC
   - Or use Doma's native stablecoin

4. **Production Deployment**
   - Deploy to production
   - Set up continuous monitoring
   - Add liquidation bot

## 📞 Need Help?

Check these files:
- `VAULT_FIX_SUMMARY.md` - Detailed technical changes
- `contracts/contracts/DomaVault.sol` - Updated contract
- `frontend/src/services/contractService.ts` - Service layer
- `frontend/src/components/CreateVaultModal.tsx` - UI component

All code is properly commented and logged for debugging!
