require("dotenv").config();
const hre = require("hardhat");

async function main() {

  const contractAddress = "0x6378a187a8e39C4dE782Ae17e5dC2e4891594eA3";

  const HelloRobinhood = await hre.ethers.getContractFactory("HelloRobinhood");

  const contract = HelloRobinhood.attach(contractAddress);

  console.log("Sending message to blockchain...");

  const tx = await contract.updateMessage("Hello from Robinhood testnet 🚀");

  await tx.wait();

  console.log("✅ Message stored successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
