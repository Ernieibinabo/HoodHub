import React, { useState, useEffect, useRef, useCallback } from "react";
import { HelloRobinhoodAddress, HelloRobinhoodABI } from "./constants.js";
import { ethers } from "ethers";
import "./index.css";

// ✅ Import global Web3 hook
import { useWeb3 } from "./context/Web3Context";

function App() {
  // ✅ Get provider + wallet from context
  const { provider, signer, account, connectWallet } = useWeb3();

  // State
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [ensName, setEnsName] = useState(null);
  const [ensAvatar, setEnsAvatar] = useState(null);

  const messagesEndRef = useRef(null);

  /* ---------------- SCROLL ---------------- */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- SYNC CONTEXT WALLET ---------------- */
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

      return new ethers.Contract(
        HelloRobinhoodAddress,
        HelloRobinhoodABI,
        provider
      );
    },
    [provider, signer]
  );

  /* ---------------- FETCH ENS INFO ---------------- */
  const fetchEnsInfo = useCallback(async () => {
    if (!provider || !currentAccount) return;

    try {
      const name = await provider.lookupAddress(currentAccount);
      const avatar = name ? await provider.getAvatar(name) : null;

      setEnsName(name);
      setEnsAvatar(avatar);
    } catch (err) {
      console.error("fetchEnsInfo failed:", err);
    }
  }, [provider, currentAccount]);

  /* ---------------- LOAD MESSAGES ---------------- */
  const getMessages = useCallback(async () => {
    const contract = await getContract(false);
    if (!contract) return;

    try {
      const msgs = await contract.getMessages();
      const formatted = msgs.map((m) => ({
        user: m.user,
        text: m.text,
        timestamp: Number(m.timestamp),
      }));
      setMessages(formatted);

      // Optionally refresh ENS info
      fetchEnsInfo();
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

  // Load messages when wallet is connected
  useEffect(() => {
    if (walletConnected && provider) getMessages();
  }, [walletConnected, provider, getMessages]);

  // Fetch ENS info when account or provider changes
  useEffect(() => {
    fetchEnsInfo();
  }, [fetchEnsInfo]);

  // Auto-scroll
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
                  className={`message-bubble ${
                    isUser ? "my-message" : "other-message"
                  }`}
                >
                  <div className="message-header">
                    {ensAvatar && msg.user?.toLowerCase() === currentAccount.toLowerCase() ? (
                      <img
                        src={ensAvatar}
                        alt="ENS avatar"
                        className="ens-avatar"
                      />
                    ) : (
                      <>
                        {msg.user?.slice(0, 6)}...{msg.user?.slice(-4)}
                      </>
                    )}
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
