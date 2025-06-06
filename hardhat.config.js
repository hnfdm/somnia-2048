require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

const { SOMNIA_TESTNET_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    somniaTestnet: {
      url: SOMNIA_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 50312,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      somnia: "ETHERSCAN_API_KEY", // Placeholder, may not be needed for Somnia
    },
    customChains: [
      {
        network: "somnia",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network",
        },
      },
    ],
  },
};