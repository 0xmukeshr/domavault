# 🧪 Quick Test Guide - Vault Creation

## ✅ Status: DEPLOYED & READY TO TEST!

The contracts are deployed with all fixes applied!

---

## 🚀 Start Testing Now

### Step 1: Start Frontend
```bash
cd /home/toji/doma/project/frontend
npm run dev
```

### Step 2: Open in Browser
Navigate to: **http://localhost:5173**

### Step 3: Connect Wallet
- Click "Connect Wallet"
- Use wallet: `0x322c3B965EcBbbf42D93b81C372d736576290583`
- Network: Doma Testnet (Chain ID: 97476)

### Step 4: You Have These Test NFTs
- **NFT #1**: crypto.io (Value: $5,000, Score: 85)
- **NFT #2**: web3.io (Value: $3,000, Score: 75)
- **NFT #3**: defi.io (Value: $10,000, Score: 95)

---

## 🎯 Test Scenario 1: Create Vault with $100

1. Click **"Create New Vault"** button
2. **Step 1 - Select NFT**: Choose NFT #1 (crypto.io)
3. **Step 2 - AI Insights**: Review scores, click Next
4. **Step 3 - Enter Amount**: 
   - Enter: `100` (this means $100)
   - See Borrowing Limit: $70 (70% of $100)
   - Click Next
5. **Step 4 - Confirm**: Click "Create Vault"
6. **Approve in Wallet**: 
   - First TX: Approve NFT transfer
   - Second TX: Create vault
7. **Success!** Your vault appears in dashboard

### What You Should See:
- Vault collateral value: $100
- Max borrowing power: $70 (70% LTV)
- Your NFT #1 locked in vault

---

## 🎯 Test Scenario 2: Borrow from Vault

1. Go to **Dashboard**
2. Find your vault card
3. Click **"Borrow"**
4. Enter amount: `50` (borrow $50 USDC)
5. Confirm transaction
6. Check USDC balance - should increase by 50!

---

## 🎯 Test Scenario 3: Create Second Vault

1. Click **"Create New Vault"** again
2. Select **NFT #2** (web3.io)
3. Enter amount: `500` ($500)
4. Complete steps
5. Now you have 2 vaults!

---

## 📊 Expected Results

### Vault 1 (NFT #1, $100 collateral):
- Collateral Value: $100
- Max Borrow: $70
- Current Borrowed: $50
- LTV: 50%
- Health: ✅ Healthy (50% < 80% threshold)

### Vault 2 (NFT #2, $500 collateral):
- Collateral Value: $500
- Max Borrow: $350
- Current Borrowed: $0
- LTV: 0%
- Health: ✅ Healthy

---

## 🔍 Verify on Block Explorer

Check your transactions on:
https://explorer-testnet.doma.xyz/address/0x322c3B965EcBbbf42D93b81C372d736576290583

Look for:
- ✅ NFT Transfer events
- ✅ VaultCreated events
- ✅ Borrowed events

---

## 🐛 Troubleshooting

### "No NFTs Found"
✅ **Fixed!** You have 3 NFTs pre-minted to your wallet

### "Transaction Reverted"
- Check you entered an amount > 0
- Make sure you approved NFT transfer
- Confirm you have enough gas (DOMA)

### "Contract Not Initialized"
- Restart dev server: `Ctrl+C` then `npm run dev`
- Hard refresh browser: `Ctrl+Shift+R`

### "Wrong Network"
Add Doma Testnet to MetaMask:
- Network Name: Doma Testnet
- RPC URL: https://rpc-testnet.doma.xyz
- Chain ID: 97476
- Currency Symbol: DOMA
- Block Explorer: https://explorer-testnet.doma.xyz

---

## ✅ Success Indicators

You know it's working when:
1. ✅ You can enter an amount in Step 3
2. ✅ Transaction succeeds without errors
3. ✅ Vault appears in dashboard with YOUR entered amount
4. ✅ You can borrow up to 70% of that amount
5. ✅ USDC balance increases after borrowing

---

## 🎉 What Changed vs Before

**BEFORE (Broken):**
```
User enters $100 → Contract ignores it → Vault value = $0 → Can't borrow ❌
```

**AFTER (Fixed):**
```
User enters $100 → Contract uses it → Vault value = $100 → Can borrow $70 ✅
```

---

## 📝 Testing Checklist

- [ ] Frontend starts without errors
- [ ] Wallet connects successfully
- [ ] See 3 NFTs in Create Vault modal
- [ ] Can select an NFT
- [ ] Can enter stake amount
- [ ] Amount validation works (can't submit 0 or empty)
- [ ] NFT approval transaction succeeds
- [ ] Vault creation transaction succeeds
- [ ] Vault appears in dashboard
- [ ] Vault shows correct collateral value
- [ ] Can borrow from vault
- [ ] USDC balance increases
- [ ] Can create multiple vaults

---

## 🎯 Contract Addresses (For Reference)

**DomaVault (UPDATED WITH FIX):**
`0x6F9007139E0b265b2434d84a49F9Ca8483C86b11`

**DomainValuator:**
`0x37A92A357A7c3874E91ebE5d871982BBF6E15c5B`

**MockUSDC:**
`0xa97dC39dAD2aAab87CEe03C2Eb516E502BCD6367`

**MockDomainNFT:**
`0x01028F7A4170e58dffBBF8750DdFF9B6563eE95B`

---

## 🎊 You're Ready!

Everything is set up and ready to test. The vault creation now works exactly as expected - the amount you enter in the UI is the amount used for your vault!

**Start testing now:**
```bash
cd /home/toji/doma/project/frontend && npm run dev
```

Good luck! 🚀
