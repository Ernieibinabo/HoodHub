// src/components/TradeCard.jsx
import React, { useState } from "react";

function TradeCard({ coin, onTrade }) {
  const [amount, setAmount] = useState("");

  const handleTrade = (type) => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) return;
    onTrade(coin.id, type, parseFloat(amount));
    setAmount("");
  };

  return (
    <div className="trade-card">
      <div className="trade-header">
        <img src={coin.image} alt={coin.name} />
        <div>
          <h3>{coin.name}</h3>
          <p>${coin.current_price.toLocaleString()}</p>
          <span className={coin.price_change_percentage_24h >= 0 ? "green" : "red"}>
            {coin.price_change_percentage_24h.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="trade-body">
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="trade-buttons">
          <button className="buy-btn" onClick={() => handleTrade("buy")}>Buy</button>
          <button className="sell-btn" onClick={() => handleTrade("sell")}>Sell</button>
        </div>
      </div>
    </div>
  );
}

export default TradeCard;