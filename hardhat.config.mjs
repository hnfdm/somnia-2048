import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const { SOMNIA_TESTNET_RPC_URL, PRIVATE_KEY } = process.env;

const config = {
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
  paths: {
    artifacts: "./artifacts",
  },
};

export default config;