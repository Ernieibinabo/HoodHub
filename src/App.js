import React, { useState, useEffect, useRef, useCallback } from "react";
import { HelloRobinhoodAddress, HelloRobinhoodABI } from "./constants.js";
import { ethers } from "ethers";
import "./index.css";
import { useWeb3 } from "./context/Web3Context.jsx";

function App() {
  const { provider, signer, account, connectWallet } = useWeb3();

  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  /* ---------------- SCROLL ---------------- */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- WALLET STATE ---------------- */
  useEffect(() => {
    if (account) {
      setCurrentAccount(account);
      setWalletConnected(true);
    } else {
      setWalletConnected(false);
      setCurrentAccount("");
    }
  }, [account]);

  /* ---------------- CONTRACT ---------------- */
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

  /* ---------------- FETCH MESSAGES ---------------- */
  const getMessages = useCallback(async () => {
    try {
      const contract = await getContract(false);
      if (!contract) return;

      // IMPORTANT: make sure contract has getMessages()
      const fetchedMessages = await contract.getMessages();

      const formatted = fetchedMessages.map((msg) => ({
        user: msg.user,
        text: msg.text,
        timestamp: Number(msg.timestamp),
        avatar: "https://i.pravatar.cc/40",
      }));

      setMessages(formatted);
    } catch (err) {
      console.error("Fetch messages failed:", err);
    }
  }, [getContract]);

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
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
  };

  /* ---------------- FORMAT TIME ---------------- */
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp) * 1000);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (walletConnected && provider) {
      getMessages();
    }
  }, [walletConnected, provider, getMessages]);

  /* ---------------- AUTO SCROLL ---------------- */
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
                msg.user?.toLowerCase() ===
                  currentAccount.toLowerCase();

              return (
                <div
                  key={idx}
                  className={`message-bubble ${
                    isUser ? "my-message" : "other-message"
                  }`}
                >
                  <div className="message-header">
                    <img
                      src={msg.avatar || "https://i.pravatar.cc/40"}
                      alt="avatar"
                      className="avatar"
                    />
                    {msg.user?.slice(0, 6)}...
                    {msg.user?.slice(-4)}
                  </div>

                  <div>{msg.text}</div>

                  <div className="timestamp">
                    {formatTime(msg.timestamp)}
                  </div>
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
