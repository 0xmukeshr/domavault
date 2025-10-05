import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🚀 Deploying DomaVault contracts to Doma Testnet...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ ERROR: No ETH balance! Get test ETH first.");
    console.log("Visit Doma Discord #faucet channel");
    process.exit(1);
  }

  // 1. Deploy Mock USDC
  console.log("💰 Deploying Mock USDC...");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ Mock USDC deployed to:", usdcAddress);

  // 2. Deploy DomainValuator
  console.log("\n📊 Deploying DomainValuator...");
  const DomainValuator = await ethers.getContractFactory("DomainValuator");
  const valuator = await DomainValuator.deploy(deployer.address);
  await valuator.waitForDeployment();
  const valuatorAddress = await valuator.getAddress();
  console.log("✅ DomainValuator deployed to:", valuatorAddress);

  // 3. Deploy Mock Domain NFT (for testing since we don't have real Doma token yet)
  console.log("\n🎨 Deploying Mock Domain NFT...");
  const MockDomainNFT = await ethers.getContractFactory("MockDomainNFT");
  const domainNFT = await MockDomainNFT.deploy();
  await domainNFT.waitForDeployment();
  const domainNFTAddress = await domainNFT.getAddress();
  console.log("✅ Mock Domain NFT deployed to:", domainNFTAddress);

  // 4. Deploy DomaVault
  console.log("\n🏦 Deploying DomaVault...");
  const DomaVault = await ethers.getContractFactory("DomaVault");
  const vault = await DomaVault.deploy(
    domainNFTAddress, // Using mock for now
    usdcAddress,
    valuatorAddress
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ DomaVault deployed to:", vaultAddress);

  // 5. Setup
  console.log("\n⚙️  Setting up contracts...");

  // Fund vault with USDC for lending
  const fundAmount = ethers.parseUnits("100000", 6); // 100k USDC
  await usdc.approve(vaultAddress, fundAmount);
  await vault.depositLiquidity(fundAmount);
  console.log("✅ Funded vault with 100,000 USDC");

  // Mint some test domain NFTs
  console.log("✅ Minting test domain NFTs...");
  await domainNFT.mint(deployer.address, 1);
  await domainNFT.mint(deployer.address, 2);
  await domainNFT.mint(deployer.address, 3);

  // Set some initial domain values
  console.log("✅ Setting initial domain values...");
  await valuator.updateDomainValue(1, ethers.parseUnits("5000", 6), 85);  // $5,000 with 6 decimals
  await valuator.updateDomainValue(2, ethers.parseUnits("3000", 6), 75);  // $3,000 with 6 decimals
  await valuator.updateDomainValue(3, ethers.parseUnits("10000", 6), 95); // $10,000 with 6 decimals

  // Summary
  console.log("\n" + "=".repeat(70));
  console.log("📝 DEPLOYMENT SUMMARY");
  console.log("=".repeat(70));
  console.log("Mock USDC:          ", usdcAddress);
  console.log("DomainValuator:     ", valuatorAddress);
  console.log("Mock Domain NFT:    ", domainNFTAddress);
  console.log("DomaVault:          ", vaultAddress);
  console.log("Deployer:           ", deployer.address);
  console.log("=".repeat(70));

  console.log("\n🔗 Verify on Explorer:");
  console.log(`https://explorer-testnet.doma.xyz/address/${vaultAddress}`);

  console.log("\n💾 Save these to your .env files:");
  console.log("\n# In contracts/.env:");
  console.log(`VAULT_ADDRESS=${vaultAddress}`);
  console.log(`VALUATOR_ADDRESS=${valuatorAddress}`);
  console.log(`USDC_ADDRESS=${usdcAddress}`);
  console.log(`DOMAIN_NFT_ADDRESS=${domainNFTAddress}`);

  console.log("\n# In frontend/.env:");
  console.log(`VITE_VAULT_ADDRESS=${vaultAddress}`);
  console.log(`VITE_VALUATOR_ADDRESS=${valuatorAddress}`);
  console.log(`VITE_USDC_ADDRESS=${usdcAddress}`);
  console.log(`VITE_DOMAIN_NFT_ADDRESS=${domainNFTAddress}`);
  console.log(`VITE_CHAIN_ID=97476`);

  // Save to file
  const fs = require("fs");
  const deployedAddresses = {
    network: "domaTestnet",
    chainId: 97476,
    contracts: {
      DomaVault: vaultAddress,
      DomainValuator: valuatorAddress,
      MockUSDC: usdcAddress,
      MockDomainNFT: domainNFTAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployed-addresses.json",
    JSON.stringify(deployedAddresses, null, 2)
  );
  console.log("\n✅ Addresses saved to deployed-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });