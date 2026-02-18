import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contract";

export async function getContract() {

  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  // connect wallet
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();

  return new ethers.Contract(
    CONTRACT_ADDRESS,
    CONTRACT_ABI,
    signer
  );
}
