// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const USDC_DECIMALS = 6;
const ETH_DECIMALS = 18;
const FUND_AMOUNT = 100_000n * 10n ** BigInt(USDC_DECIMALS); // 100k USDC

const DomaVaultModule = buildModule("DomaVaultModule", (m) => {
  // Get the deployer account
  const deployer = m.getAccount(0);

  // 1. Deploy Mock USDC
  const mockUSDC = m.contract("MockUSDC");

  // 2. Deploy DomainValuator with deployer as owner
  const domainValuator = m.contract("DomainValuator", [deployer]);

  // 3. Deploy Mock Domain NFT
  const mockDomainNFT = m.contract("MockDomainNFT");

  // 4. Deploy DomaVault with dependencies
  const domaVault = m.contract("DomaVault", [
    mockDomainNFT,
    mockUSDC,
    domainValuator,
  ]);

  // 5. Mint USDC to deployer for vault funding
  m.call(mockUSDC, "mint", [deployer, FUND_AMOUNT], { id: "mintUSDC" });

  // 6. Approve vault to spend USDC
  m.call(mockUSDC, "approve", [domaVault, FUND_AMOUNT], {
    from: deployer,
    id: "approveUSDC",
  });

  // 7. Deposit liquidity into vault
  m.call(domaVault, "depositLiquidity", [FUND_AMOUNT], {
    from: deployer,
    id: "depositLiquidity",
  });

  // 8. Mint test domain NFTs (IDs: 1, 2, 3)
  m.call(mockDomainNFT, "mint", [deployer, 1n], { id: "mintDomain1" });
  m.call(mockDomainNFT, "mint", [deployer, 2n], { id: "mintDomain2" });
  m.call(mockDomainNFT, "mint", [deployer, 3n], { id: "mintDomain3" });

  // 9. Set domain valuations
  // Domain #1: $5,000 value, 85% quality score
  m.call(domainValuator, "updateDomainValue", [
    1n,
    5_000n * 10n ** BigInt(ETH_DECIMALS),
    85n,
  ], { id: "valuateDomain1" });

  // Domain #2: $3,000 value, 75% quality score
  m.call(domainValuator, "updateDomainValue", [
    2n,
    3_000n * 10n ** BigInt(ETH_DECIMALS),
    75n,
  ], { id: "valuateDomain2" });

  // Domain #3: $10,000 value, 95% quality score
  m.call(domainValuator, "updateDomainValue", [
    3n,
    10_000n * 10n ** BigInt(ETH_DECIMALS),
    95n,
  ], { id: "valuateDomain3" });

  return {
    mockUSDC,
    domainValuator,
    mockDomainNFT,
    domaVault,
  };
});

export default DomaVaultModule;