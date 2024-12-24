import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers"

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      chainId: 31337, // Default chain ID for Hardhat network
      accounts: {
        count: 10, // Number of accounts generated
        accountsBalance: "10000000000000000000000", // Each account gets 10,000 ETH
      },
      loggingEnabled: true // Optional: enable logging for debugging
    },
  },
};

export default config;
