import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("⚙️  Setting up already deployed DomaVault contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Setting up with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  if (balance === 0n) {
    console.error("❌ ERROR: No ETH balance! Get test ETH first.");
    console.log("Visit Doma Discord #faucet channel");
    process.exit(1);
  }

  // Use already deployed contracts
  const usdcAddress = "0x776d33C893495878c1824e01369EaA3683671492";
  const valuatorAddress = "0x2cee13891EcAA7d6E6B243A5C1A647AA5cCf373d";
  const domainNFTAddress = "0x465a804C963f7f0b75f4209f8584f12C3f627A73";
  const vaultAddress = "0x538e5b582268c4a88040798d8001234C547CB3ff";

  console.log("Using deployed contracts:");
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
    // Fund vault with USDC for lending (if not already done)
    const fundAmount = ethers.parseUnits("100000", 6); // 100k USDC
    const vaultBalance = await usdc.balanceOf(vaultAddress);
    
    if (vaultBalance < fundAmount) {
      console.log("💰 Funding vault with USDC...");
      await usdc.approve(vaultAddress, fundAmount);
      await vault.depositLiquidity(fundAmount);
      console.log("✅ Funded vault with 100,000 USDC");
    } else {
      console.log("✅ Vault already has sufficient USDC");
    }

    // Mint some test domain NFTs (if not already done)
    console.log("🎨 Minting test domain NFTs...");
    const balance1 = await domainNFT.balanceOf(deployer.address);
    if (balance1 < 3n) {
      await domainNFT.mint(deployer.address, 1);
      await domainNFT.mint(deployer.address, 2);
      await domainNFT.mint(deployer.address, 3);
      console.log("✅ Minted test domain NFTs");
    } else {
      console.log("✅ Domain NFTs already minted");
    }

    // Set some initial domain values
    console.log("📊 Setting initial domain values...");
    await valuator.updateDomainValue(1, ethers.parseEther("5000"), 85);
    await valuator.updateDomainValue(2, ethers.parseEther("3000"), 75);
    await valuator.updateDomainValue(3, ethers.parseEther("10000"), 95);
    console.log("✅ Updated domain values");

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("📝 SETUP COMPLETE");
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

  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    // Still output the addresses even if setup fails
    console.log("\n📝 Contract addresses (even if setup incomplete):");
    console.log(`VAULT_ADDRESS=${vaultAddress}`);
    console.log(`VALUATOR_ADDRESS=${valuatorAddress}`);
    console.log(`USDC_ADDRESS=${usdcAddress}`);
    console.log(`DOMAIN_NFT_ADDRESS=${domainNFTAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

