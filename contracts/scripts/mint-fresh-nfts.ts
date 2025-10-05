import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("🎨 Minting fresh NFTs for testing...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Minting to account:", deployer.address);

  // NEW NFT contract address
  const domainNFTAddress = "0xE72Cd6CFF8A31f7E505Ea9B867CdaaEe5F9d10f9";

  const MockDomainNFT = await ethers.getContractFactory("MockDomainNFT");
  const domainNFT = MockDomainNFT.attach(domainNFTAddress);

  try {
    console.log("Minting NFTs with IDs: 10, 11, 12...");
    
    const mint1 = await domainNFT.mint(deployer.address, 10);
    await mint1.wait();
    console.log("✅ Minted NFT #10");
    
    const mint2 = await domainNFT.mint(deployer.address, 11);
    await mint2.wait();
    console.log("✅ Minted NFT #11");
    
    const mint3 = await domainNFT.mint(deployer.address, 12);
    await mint3.wait();
    console.log("✅ Minted NFT #12");

    console.log("\n✅ SUCCESS! You now have fresh NFTs:");
    console.log("- NFT #10 (domain: test10.io)");
    console.log("- NFT #11 (domain: test11.io)");
    console.log("- NFT #12 (domain: test12.io)");
    
    console.log("\n🎯 NOW: Refresh frontend and you'll see these new NFTs!");
    console.log("Use NFT #10, #11, or #12 to create a vault with $20");

  } catch (error: any) {
    console.error("❌ Minting failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
