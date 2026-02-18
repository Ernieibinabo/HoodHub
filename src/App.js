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
  const [isTyping] = useState(false); // removed unused setter

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (account) {
      setCurrentAccount(account);
      setWalletConnected(true);
    } else {
      setWalletConnected(false);
      setCurrentAccount("");
    }
  }, [account]);

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

  const fetchEnsInfo = useCallback(async () => {
    const mockMessages = [
      {
        user: "0xAbC123...7890",
        text: "Welcome to HoodHub!",
        timestamp: Math.floor(Date.now() / 1000) - 60,
        avatar: "https://i.pravatar.cc/40?img=1",
      },
      {
        user: "0xDeF456...1234",
        text: "Hey there, excited to chat!",
        timestamp: Math.floor(Date.now() / 1000) - 30,
        avatar: "https://i.pravatar.cc/40?img=2",
      },
      {
        user: "0xGhI789...5678",
        text: "Mock avatar testing works!",
        timestamp: Math.floor(Date.now() / 1000),
        avatar: "https://i.pravatar.cc/40?img=3",
      },
    ];

    setMessages(mockMessages);
  }, []);

  const getMessages = useCallback(async () => {
    try {
      const contract = await getContract(false);
      if (!contract) return;

      await fetchEnsInfo();
    } catch (err) {
      console.error("Fetch messages failed:", err);
    }
  }, [getContract, fetchEnsInfo]);

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

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp) * 1000);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  useEffect(() => {
    if (walletConnected && provider) getMessages();
  }, [walletConnected, provider, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                    <img
                      src={msg.avatar || "https://i.pravatar.cc/40"}
                      alt="avatar"
                      className="avatar"
                    />
                    {msg.user?.slice(0, 6)}...{msg.user?.slice(-4)}
                  </div>

                  <div>{msg.text}</div>

                  <div className="timestamp">{formatTime(msg.timestamp)}</div>
                </div>
              );
            })}

            {isTyping && <p className="typing-indicator">Someone is typing...</p>}

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
