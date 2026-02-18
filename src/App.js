import React, { useState, useEffect, useRef, useCallback } from "react";
import { HelloRobinhoodAddress, HelloRobinhoodABI } from "./constants.js";
import { ethers } from "ethers";
import "./index.css";
import { useWeb3 } from "./context/Web3Context";

function App() {
  const { provider, signer, account, connectWallet } = useWeb3();
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Sync context wallet
  useEffect(() => {
    if (account) {
      setCurrentAccount(account);
      setWalletConnected(true);
    } else {
      setWalletConnected(false);
      setCurrentAccount("");
    }
  }, [account]);

  /* ---------------- GET CONTRACT ---------------- */
  const getContract = useCallback(
    async (withSigner = false) => {
      if (!provider) return null;

      if (withSigner) {
        const walletSigner = signer ?? (await provider.getSigner());
        return new ethers.Contract(
          HelloRobinhoodAddress,
          HelloRobinhoodABI,
          walletSigner
        );
      }

      return new ethers.Contract(HelloRobinhoodAddress, HelloRobinhoodABI, provider);
    },
    [provider, signer]
  );

  /* ---------------- FETCH ENS INFO (mock example) ---------------- */
  const fetchEnsInfo = useCallback(async (address) => {
    if (!provider || !address) return { ensName: null, ensAvatar: null };

    try {
      const ensName = await provider.lookupAddress(address);
      const ensAvatar = ensName ? await provider.getAvatar(ensName) : null;
      return { ensName, ensAvatar };
    } catch {
      return { ensName: null, ensAvatar: null };
    }
  }, [provider]);

  /* ---------------- LOAD MESSAGES ---------------- */
  const getMessages = useCallback(async () => {
    try {
      const contract = await getContract(false);
      if (!contract) return;

      const msgs = await contract.getMessages();
      const formatted = await Promise.all(
        msgs.map(async (m) => {
          const ens = await fetchEnsInfo(m.user); // stable fetchEnsInfo
          return {
            user: m.user,
            text: m.text,
            timestamp: Number(m.timestamp),
            ensName: ens.ensName,
            ensAvatar: ens.ensAvatar,
          };
        })
      );

      setMessages(formatted);
    } catch (err) {
      console.error("Fetch messages failed:", err);
    }
  }, [getContract, fetchEnsInfo]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = useCallback(async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const contract = await getContract(true);
      if (!contract) return;

      const tx = await contract.updateMessage(newMessage);
      await tx.wait();

      setNewMessage("");
      await getMessages();
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setLoading(false);
    }
  }, [newMessage, getContract, getMessages]);

  /* ---------------- FORMAT TIME ---------------- */
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp) * 1000);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    if (walletConnected && provider) getMessages();
  }, [walletConnected, provider, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ---------------- UI ---------------- */
  return (
    <div className="chat-container">
      <h2>HoodHub</h2>
      {!walletConnected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <div className="messages">
            {messages.length === 0 && <p>No messages yet</p>}
            {messages.map((msg, idx) => {
              const isUser =
                currentAccount &&
                msg.user?.toLowerCase() === currentAccount.toLowerCase();

              return (
                <div
                  key={idx}
                  className={`message-bubble ${isUser ? "my-message" : "other-message"}`}
                >
                  <div className="message-header">
                    {msg.ensAvatar ? (
                      <img src={msg.ensAvatar} alt="avatar" className="avatar" />
                    ) : null}
                    {msg.ensName || msg.user?.slice(0, 6) + "..." + msg.user?.slice(-4)}
                  </div>
                  <div>{msg.text}</div>
                  <div className="timestamp">{formatTime(msg.timestamp)}</div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-area">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Write message..."
            />
            <button onClick={sendMessage} disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
