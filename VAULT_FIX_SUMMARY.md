# DomaVault Create Vault Fix - Summary

## Problem Identified

The vault creation flow was broken because:

1. **Frontend asked for investment amount** (`stakeAmount`) but didn't use it
2. **Contract didn't accept any investment value** - only took NFT token ID and name
3. **No alignment between UI and smart contract** - UI showed investment features that didn't exist in contract

## Changes Made

### 1. Smart Contract (`contracts/contracts/DomaVault.sol`)

#### Updated `createVault` Function
```solidity
// BEFORE:
function createVault(uint256 domainTokenId, string memory domainName) 
    external returns (uint256)

// AFTER:
function createVault(uint256 domainTokenId, string memory domainName, uint256 initialValue) 
    external returns (uint256)
```

**Key Changes:**
- Added `initialValue` parameter to accept the investment amount in USDC (6 decimals)
- Smart contract now tries to get AI valuation from `DomainValuator`
- If AI valuation fails or returns 0, uses the `initialValue` provided by user
- This allows vault creation even without AI valuator being set up

**Logic Flow:**
```solidity
1. Validate domain ownership
2. Transfer NFT to vault contract
3. Try to get AI valuation:
   - If AI value > 0: use AI value
   - Else: use initialValue from user
4. Create vault with determined value
5. Emit VaultCreated event
```

#### Fixed `repay` Function
- Fixed event emission to match signature
- Now tracks `interestPaid` and `principalPaid` separately

### 2. Frontend Service (`frontend/src/services/contractService.ts`)

#### Updated Contract ABI
```typescript
// BEFORE:
"function createVault(uint256 domainTokenId, string domainName) external returns (uint256)"

// AFTER:
"function createVault(uint256 domainTokenId, string domainName, uint256 initialValue) external returns (uint256)"
```

#### Updated `createVault` Method
```typescript
async createVault(domainTokenId: string, domainName: string, initialValue: string): Promise<string>
```

**Key Changes:**
- Added `initialValue` parameter
- Converts value to USDC wei (6 decimals): `ethers.parseUnits(initialValue, 6)`
- Properly approves NFT before vault creation
- Calls contract with all 3 parameters

### 3. Frontend Modal (`frontend/src/components/CreateVaultModal.tsx`)

#### Updated `createVault` Function
```typescript
// Now validates stakeAmount
if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
  setError('Please enter a valid stake amount');
  return;
}

// Passes stakeAmount to contract service
const txHash = await contractService.createVault(
  selectedNFT, 
  selectedNFTData.name, 
  stakeAmount  // <-- NOW USED!
);
```

**Key Changes:**
- Validates that stakeAmount is provided and > 0
- Passes stakeAmount to contractService
- Shows success message and auto-refreshes page after vault creation

## How It Works Now

### User Flow:
1. **Step 1:** User selects a Domain NFT they own
2. **Step 2:** Views AI insights (mock scores for now)
3. **Step 3:** Enters stake amount (e.g., $20,000)
4. **Step 4:** Confirms and creates vault

### Technical Flow:
```
User inputs $20,000
    ↓
Frontend converts to USDC wei: 20,000,000,000 (20000 * 10^6)
    ↓
Frontend approves NFT transfer to Vault contract
    ↓
Frontend calls: createVault(tokenId, "domain.io", 20000000000)
    ↓
Smart Contract:
  1. Transfers NFT from user to vault
  2. Tries to get AI value from DomainValuator
  3. If AI value = 0, uses initialValue (20000000000)
  4. Creates vault with collateralValue = $20,000
  5. User can now borrow up to 70% = $14,000
```

## Testing Instructions

### 1. Redeploy Contracts
```bash
cd contracts
npm run compile
npm run deploy  # or npm run deploy:local for testing
```

### 2. Update Frontend Environment Variables
Update `frontend/.env.local` with new contract addresses from deployment:
```
VITE_VAULT_ADDRESS=0x...  # New DomaVault address
VITE_VALUATOR_ADDRESS=0x...  # Same valuator
VITE_USDC_ADDRESS=0x...  # Same USDC
VITE_DOMAIN_NFT_ADDRESS=0x...  # Same NFT
```

### 3. Test Create Vault Flow
1. Start frontend: `cd frontend && npm run dev`
2. Connect wallet
3. Click "Create New Vault"
4. Select an NFT (or use mock NFTs)
5. Enter stake amount (e.g., 20)
6. Complete all steps
7. Confirm transaction in wallet
8. Verify vault is created in dashboard

## What Was Fixed

✅ **Investment amount is now used** - The stakeAmount from UI is passed to contract
✅ **Contract accepts initialValue** - Smart contract now has 3 parameters
✅ **Proper validation** - Frontend validates amount before submission
✅ **Better error handling** - Contract works even if AI valuator fails
✅ **Aligned UX** - What user sees in UI matches what happens on-chain

## Important Notes

### About Domain Valuation:
- Contract first tries to get AI valuation from `DomainValuator`
- If that fails or returns 0, uses user-provided `initialValue`
- This allows the system to work even before AI valuator is fully set up

### About USDC:
- All values use 6 decimals (USDC standard)
- Example: $20,000 = 20,000,000,000 wei

### About Borrowing:
- After vault creation, user can borrow up to 70% of collateral value
- If collateral = $20,000, max borrow = $14,000
- Interest rate = 5% APR
- Liquidation threshold = 80% LTV

## Next Steps

1. **Deploy updated contracts** to Doma testnet
2. **Update frontend .env** with new addresses
3. **Test vault creation** with real wallet and NFTs
4. **Implement AI valuator** integration with backend API
5. **Add USDC minting** for testing (optional)

## Files Modified

1. `/contracts/contracts/DomaVault.sol` - Updated createVault function
2. `/frontend/src/services/contractService.ts` - Updated ABI and createVault method
3. `/frontend/src/components/CreateVaultModal.tsx` - Connected stakeAmount to contract

## Deployment Checklist

- [ ] Compile contracts: `npm run compile`
- [ ] Deploy to Doma testnet: `npm run deploy`
- [ ] Copy new contract addresses
- [ ] Update `frontend/.env.local`
- [ ] Restart frontend dev server
- [ ] Test vault creation
- [ ] Verify vault appears in dashboard
- [ ] Test borrowing functionality
