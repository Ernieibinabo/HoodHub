require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.ROBINHOOD_RPC_URL;

  if (!privateKey || !rpcUrl) {
    console.error("Please set PRIVATE_KEY and ROBINHOOD_RPC_URL in your .env file");
    process.exit(1);
  }

  // Create a provider and wallet
  const provider = new hre.ethers.JsonRpcProvider(rpcUrl);
  const deployer = new hre.ethers.Wallet(privateKey, provider);

  console.log("Deploying contract with account:", deployer.address);

  // Get contract factory with deployer as signer
  const HelloRobinhood = await hre.ethers.getContractFactory("HelloRobinhood", deployer);

  // Deploy contract
  const contract = await HelloRobinhood.deploy();
  await contract.waitForDeployment();

  console.log("HelloRobinhood deployed to:", contract.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
