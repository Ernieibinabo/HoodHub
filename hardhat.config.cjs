require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    robinhood: {
      url: process.env.ROBINHOOD_RPC_URL || "https://rpc.testnet.chain.robinhood.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 46630,
    },
  },
  etherscan: {
    apiKey: {
      robinhood: process.env.ROBINHOOD_API_KEY || "",
    },
  },
};
