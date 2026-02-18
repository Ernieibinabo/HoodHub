require("dotenv").config();
const hre = require("hardhat");

async function main() {

  const contractAddress = "0x6378a187a8e39C4dE782Ae17e5dC2e4891594eA3";

  const HelloRobinhood = await hre.ethers.getContractFactory("HelloRobinhood");

  const contract = HelloRobinhood.attach(contractAddress);

  const messages = await contract.getMessages();

  console.log("Messages on chain:\n");

  messages.forEach((msg, index) => {
    console.log(`Message #${index}`);
    console.log(`User: ${msg.user}`);
    console.log(`Text: ${msg.text}`);
    console.log("-------------------");
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
