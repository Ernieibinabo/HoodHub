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
  const [ensCache, setEnsCache] = useState({});
  const [typingUsers, setTypingUsers] = useState([]);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ---------------- SCROLL ---------------- */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- WALLET SYNC ---------------- */
  useEffect(() => {
    if (account) {
      setCurrentAccount(account);
      setWalletConnected(true);
      fetchEnsInfo(account);
    } else {
      setCurrentAccount("");
      setWalletConnected(false);
    }
  }, [account]);

  /* ---------------- CONTRACT ---------------- */
  const getContract = async (withSigner = false) => {
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
  };

  /* ---------------- FETCH ENS INFO ---------------- */
  const fetchEnsInfo = async (address) => {
    if (!address) return;
    const lower = address.toLowerCase();
    if (!provider || ensCache[lower]) return;

    try {
      const name = await provider.lookupAddress(address);
      let avatar = null;
      if (name) {
        try {
          avatar = await provider.getAvatar(name);
        } catch {
          avatar = null;
        }
      }
      setEnsCache((prev) => ({
        ...prev,
        [lower]: { name: name || null, avatar },
      }));
    } catch (err) {
      console.error("ENS lookup failed:", err);
    }
  };

  /* ---------------- LOAD MESSAGES ---------------- */
  const getMessages = useCallback(async () => {
    try {
      const contract = await getContract(false);
      if (!contract) return;

      const msgs = await contract.getMessages();
      const formatted = msgs.map((m) => ({
        user: m.user,
        text: m.text,
        timestamp: Number(m.timestamp),
      }));

      setMessages(formatted);
      formatted.forEach((m) => fetchEnsInfo(m.user));
    } catch (err) {
      console.error("Fetch messages failed:", err);
    }
  }, [provider]);

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

  /* ---------------- FORMAT TIMESTAMP ---------------- */
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp) * 1000);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString();
  };

  /* ---------------- POLLING FOR NEW MESSAGES ---------------- */
  useEffect(() => {
    if (!walletConnected || !provider) return;
    getMessages(); // initial load

    const interval = setInterval(() => {
      getMessages();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [walletConnected, provider, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  /* ---------------- TYPING INDICATOR ---------------- */
  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    // mock typing indicator for UI testing
    if (!typingUsers.includes("0xMockUser1")) {
      setTypingUsers((prev) => [...prev, "0xMockUser1"]);
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTypingUsers((prev) =>
        prev.filter((user) => user !== "0xMockUser1")
      );
    }, 1500);
  };

  /* ---------------- UI ---------------- */
  const myEns = currentAccount ? ensCache[currentAccount.toLowerCase()] : {};
  const myAvatar = myEns?.avatar;

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

              const ens = ensCache[msg.user?.toLowerCase()] || {};
              const displayName =
                ens.name || `${msg.user.slice(0, 6)}...${msg.user.slice(-4)}`;
              const avatarUrl = ens.avatar;

              return (
                <div
                  key={idx}
                  className={`message-bubble ${
                    isUser ? "my-message" : "other-message"
                  }`}
                >
                  <div
                    className="message-header"
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        style={{ width: 24, height: 24, borderRadius: "50%" }}
                      />
                    )}
                    <span>{displayName}</span>
                  </div>

                  <div>{msg.text}</div>
                  <div className="timestamp">{formatTime(msg.timestamp)}</div>
                </div>
              );
            })}

            {/* TYPING INDICATORS */}
            {typingUsers.length > 0 && (
              <div style={{ fontSize: "0.8rem", color: "#555", marginTop: "4px" }}>
                {typingUsers.map((user) => {
                  const ens = ensCache[user.toLowerCase()];
                  const name = ens?.name || `${user.slice(0, 6)}...${user.slice(-4)}`;
                  return `${name} is typing...`;
                })}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            className="input-area"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            {myAvatar && (
              <img
                src={myAvatar}
                alt="my avatar"
                style={{ width: 32, height: 32, borderRadius: "50%" }}
              />
            )}
            <input
              value={newMessage}
              onChange={handleTyping}
              placeholder="Write message..."
              style={{ flex: 1 }}
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
