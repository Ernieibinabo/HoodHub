// src/App.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { ethers } from "ethers";
import { HelloRobinhoodAddress, HelloRobinhoodABI } from "./constants.js";
import { useWeb3 } from "./context/Web3Context.jsx";
import EmojiPicker from "emoji-picker-react";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

import TradePage from "./pages/TradePage.jsx"; // ✅ FIXED (extension required)
import "./index.css";

/* ================= MAIN APP ================= */

function App() {
  const { provider, signer, account, connectWallet } = useWeb3();
  const navigate = useNavigate();

  /* ---------- STATE ---------- */
  const [walletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("hood");
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);

  /* ---------- SCROLL ---------- */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------- WALLET ---------- */
  useEffect(() => {
    if (account) {
      setCurrentAccount(account);
      setWalletConnected(true);
    } else {
      setCurrentAccount("");
      setWalletConnected(false);
    }
  }, [account]);

  /* ---------- CONTRACT ---------- */
  const getContract = useCallback(
    async (withSigner = false) => {
      if (!provider) return null;

      const contractSigner =
        withSigner ? signer ?? (await provider.getSigner()) : provider;

      return new ethers.Contract(
        HelloRobinhoodAddress,
        HelloRobinhoodABI,
        contractSigner
      );
    },
    [provider, signer]
  );

  /* ---------- FETCH CHAT ---------- */
  const getMessages = useCallback(async () => {
    if (selectedRoom !== "hood") return;

    try {
      const contract = await getContract(false);
      if (!contract) return;

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
  }, [getContract, selectedRoom]);

  /* ---------- SEND MESSAGE ---------- */
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoading(true);
      const contract = await getContract(true);
      if (!contract) return;

      const tx = await contract.updateMessage(newMessage);
      await tx.wait();

      setNewMessage("");
      setShowEmojiPicker(false);
      await getMessages();
    } catch (err) {
      console.error("Send message failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- EMOJI ---------- */
  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  /* ---------- FETCH CRYPTO ---------- */
  const fetchCryptoPrices = async () => {
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,polygon-ecosystem-token,binancecoin,ripple,cardano,avalanche-2,dogecoin,chainlink"
      );

      const data = await res.json();
      setCryptoPrices(data);
    } catch (err) {
      console.error("Crypto fetch failed:", err);
    }
  };

  useEffect(() => {
    if (selectedRoom === "crypto") {
      fetchCryptoPrices();
      const interval = setInterval(fetchCryptoPrices, 15000);
      return () => clearInterval(interval);
    }
  }, [selectedRoom]);

  /* ---------- LOAD CHAT ---------- */
  useEffect(() => {
    if (walletConnected && provider && selectedRoom === "hood")
      getMessages();
  }, [walletConnected, provider, selectedRoom, getMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ---------- FORMAT TIME ---------- */
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  /* ---------- THEME ---------- */
  const toggleTheme = () => {
    document.body.classList.toggle("light-mode");
  };

  /* ---------- UI ---------- */
  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h3>HoodHub</h3>

        <button
          className={selectedRoom === "hood" ? "active-room" : ""}
          onClick={() => setSelectedRoom("hood")}
        >
          🏠 The Hood
        </button>

        <button
          className={selectedRoom === "crypto" ? "active-room" : ""}
          onClick={() => setSelectedRoom("crypto")}
        >
          ₿ Crypto Hood
        </button>

        <button className="theme-toggle" onClick={toggleTheme}>
          Toggle Dark/Light Mode
        </button>
      </div>

      {/* MAIN */}
      <div className="chat-container">
        {!walletConnected ? (
          <button onClick={connectWallet}>Connect Wallet</button>
        ) : selectedRoom === "crypto" ? (
          <>
            <h2>₿ Crypto Hood</h2>

            <div className="crypto-list">
              {cryptoPrices.map((coin) => {
                const isUp = coin.price_change_percentage_24h >= 0;

                return (
                  <div
                    key={coin.id}
                    className="crypto-row"
                    onClick={() => navigate(`/trade/${coin.symbol}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="crypto-left">
                      <img
                        src={coin.image}
                        alt={coin.name}
                        className="crypto-icon"
                      />

                      <div>
                        <div className="crypto-name">
                          {coin.symbol.toUpperCase()}/USDC
                        </div>
                        <div className="crypto-fullname">
                          {coin.name}
                        </div>
                      </div>
                    </div>

                    <div className="crypto-right">
                      <div className="crypto-price">
                        ${coin.current_price.toLocaleString()}
                      </div>

                      <div
                        className={`crypto-change ${
                          isUp ? "price-up" : "price-down"
                        }`}
                      >
                        {isUp ? "+" : ""}
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <h2>The Hood</h2>

            <div className="messages">
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
                      <img src={msg.avatar} alt="avatar" />
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

            <div className="input-area" style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() =>
                  setShowEmojiPicker(!showEmojiPicker)
                }
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                😊
              </button>

              {showEmojiPicker && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    left: "0",
                    zIndex: 1000,
                  }}
                >
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme="dark"
                  />
                </div>
              )}

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
    </div>
  );
}

/* ================= ROUTER WRAPPER ================= */

function AppWrapper() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/trade/:coinId" element={<TradePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppWrapper;