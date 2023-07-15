import { HardhatUserConfig } from "hardhat/config";
import 'dotenv/config'
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks:{
    localhost: {
      chainId: 1337
    },
    hardhat: {
      chainId: 1337
    },
    bsctest:{
      chainId: 97,
      url: process.env.BSCSCAN_URL,
      accounts: [process.env.ADMIN_ACCOUNT_PRIVATE_KEY||""],
      timeout: 0,
      gas: "auto",
      gasPrice: 20000000000
    }
  },
  etherscan: {
    apiKey: {
      bscTestnet: process.env.BSCSCAN_API_KEY||""
    },
  },
};

export default config;
