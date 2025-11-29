// Path: zama-quest-contract/hardhat.config.js

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); 

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC;   // MUST be https://sepolia.fherollup.com
const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",   // REQUIRED by @fhevm/solidity
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,    // <--- SHOULD POINT TO FHE ROLLUP RPC
      chainId: 11155111,       // FHE Rollup uses Sepolia chainId
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,   // verification will not work yet for FHEVM
  }
};
