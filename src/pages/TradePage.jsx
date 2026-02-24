import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../index.css";

function TradePage() {
  const { coinId } = useParams();
  const navigate = useNavigate();

  const pair = coinId?.toUpperCase();

  return (
    <div className="trade-page">
      {/* ---------- TOP BAR ---------- */}
      <div className="trade-header">
        <button
          className="back-btn"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>

        <div className="pair-info">
          <h2>{pair}/USDC</h2>
          <span className="pair-sub">Spot Trading</span>
        </div>
      </div>

      {/* ---------- MAIN TRADING AREA ---------- */}
      <div className="trade-layout">
        {/* ===== LEFT: CHART ===== */}
        <div className="chart-area">
          <iframe
            title="tradingview"
            src={`https://s.tradingview.com/widgetembed/?symbol=BINANCE:${pair}USDT&interval=15&theme=dark&style=1&timezone=Etc/UTC&studies=[]&hideideas=1`}
            width="100%"
            height="100%"
            frameBorder="0"
            allowTransparency="true"
            scrolling="no"
          />
        </div>

        {/* ===== RIGHT: TRADE PANEL (UI ONLY FOR NOW) ===== */}
        <div className="trade-panel">
          <h3>Trade</h3>

          <div className="trade-tabs">
            <button className="active">Buy</button>
            <button>Sell</button>
          </div>

          <div className="trade-input">
            <label>Price (USDC)</label>
            <input placeholder="Market" />
          </div>

          <div className="trade-input">
            <label>Amount</label>
            <input placeholder={`Amount ${pair}`} />
          </div>

          <div className="trade-input">
            <label>Total</label>
            <input placeholder="0.00 USDC" />
          </div>

          <button className="buy-btn">
            Buy {pair}
          </button>

          <button className="sell-btn">
            Sell {pair}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TradePage;