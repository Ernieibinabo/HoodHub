import { createContext, useContext, useState } from "react";
import { ethers } from "ethers";

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  async function connectWallet() {
    if (!window.ethereum) {
      alert("Install MetaMask");
      return;
    }

    // ✅ THIS is where provider is created
    const browserProvider = new ethers.BrowserProvider(
      window.ethereum
    );

    await browserProvider.send("eth_requestAccounts", []);

    const signer = await browserProvider.getSigner();
    const address = await signer.getAddress();

    setProvider(browserProvider);
    setSigner(signer);
    setAccount(address);
  }

  return (
    <Web3Context.Provider
      value={{ provider, signer, account, connectWallet }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}
