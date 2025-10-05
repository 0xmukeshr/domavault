import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("⚙️  Setting up NEW DomaVault contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Setting up with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // NEW contract addresses from latest deployment
  const usdcAddress = "0x11a5Cdb806e12D6aeCbeAe2BC198f664F9B872aC";
  const valuatorAddress = "0x546CB4E2D830a3bfF1d616FBe71DAc1526eF7C3c";
  const domainNFTAddress = "0xE72Cd6CFF8A31f7E505Ea9B867CdaaEe5F9d10f9";
  const vaultAddress = "0x7300dD0893a5A2903AD2a6b68aA33a0cbe0b3Ef6";

  console.log("Using NEW deployed contracts:");
  console.log("Mock USDC:          ", usdcAddress);
  console.log("DomainValuator:     ", valuatorAddress);
  console.log("Mock Domain NFT:    ", domainNFTAddress);
  console.log("DomaVault:          ", vaultAddress);

  // Connect to contracts
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = MockUSDC.attach(usdcAddress);
  
  const DomainValuator = await ethers.getContractFactory("DomainValuator");
  const valuator = DomainValuator.attach(valuatorAddress);
  
  const MockDomainNFT = await ethers.getContractFactory("MockDomainNFT");
  const domainNFT = MockDomainNFT.attach(domainNFTAddress);
  
  const DomaVault = await ethers.getContractFactory("DomaVault");
  const vault = DomaVault.attach(vaultAddress);

  console.log("\n⚙️  Setting up contracts...");

  try {
    // Fund vault with USDC for lending
    const fundAmount = ethers.parseUnits("100000", 6); // 100k USDC
    console.log("💰 Funding vault with USDC...");
    
    const approveTx = await usdc.approve(vaultAddress, fundAmount);
    await approveTx.wait();
    console.log("✅ Approved USDC");
    
    const depositTx = await vault.depositLiquidity(fundAmount);
    await depositTx.wait();
    console.log("✅ Funded vault with 100,000 USDC");

    // Mint some test domain NFTs
    console.log("\n🎨 Minting test domain NFTs...");
    const mint1 = await domainNFT.mint(deployer.address, 1);
    await mint1.wait();
    const mint2 = await domainNFT.mint(deployer.address, 2);
    await mint2.wait();
    const mint3 = await domainNFT.mint(deployer.address, 3);
    await mint3.wait();
    console.log("✅ Minted test domain NFTs (IDs: 1, 2, 3)");

    // Set some initial domain values (optional - vault will use user's input)
    console.log("\n📊 Setting initial domain values...");
    const val1 = await valuator.updateDomainValue(1, ethers.parseUnits("5000", 6), 85);
    await val1.wait();
    const val2 = await valuator.updateDomainValue(2, ethers.parseUnits("3000", 6), 75);
    await val2.wait();
    const val3 = await valuator.updateDomainValue(3, ethers.parseUnits("10000", 6), 95);
    await val3.wait();
    console.log("✅ Updated domain values");

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("📝 SETUP COMPLETE - READY TO TEST!");
    console.log("=".repeat(70));
    console.log("Mock USDC:          ", usdcAddress);
    console.log("DomainValuator:     ", valuatorAddress);
    console.log("Mock Domain NFT:    ", domainNFTAddress);
    console.log("DomaVault:          ", vaultAddress);
    console.log("Deployer:           ", deployer.address);
    console.log("=".repeat(70));

    console.log("\n🔗 Verify on Explorer:");
    console.log(`https://explorer-testnet.doma.xyz/address/${vaultAddress}`);

    console.log("\n✅ Your wallet has:");
    console.log("- 3 test NFTs (IDs: 1, 2, 3)");
    console.log("- Vault has 100k USDC for borrowing");
    console.log("\n🎯 NOW TEST: Create a vault with $20 and it will use YOUR amount!");

  } catch (error: any) {
    console.error("❌ Setup failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
