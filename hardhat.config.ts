import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers"

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      loggingEnabled: true // Optional: enable logging for debugging
    }
  }
};

export default config;
