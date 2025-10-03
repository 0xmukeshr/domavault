require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    domaTestnet: {
      url: "https://rpc-testnet.doma.xyz",
      chainId: 97476,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    // Keep localhost for testing
    hardhat: {
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      domaTestnet: "not-needed",
    },
    customChains: [
      {
        network: "domaTestnet",
        chainId: 97476,
        urls: {
          apiURL: "https://explorer-testnet.doma.xyz/api",
          browserURL: "https://explorer-testnet.doma.xyz",
        },
      },
    ],
  },
};
