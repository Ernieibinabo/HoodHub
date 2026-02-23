// src/components/CryptoChart.jsx
import React, { useEffect, useRef } from "react";
import {
  createChart,
  CandlestickSeries,
} from "lightweight-charts";

function CryptoChart({ coinId }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // ===== CREATE PROFESSIONAL CHART =====
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 260,

      layout: {
        background: { color: "#0B0E11" }, // Binance dark
        textColor: "#d1d4dc",
      },

      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },

      crosshair: {
        mode: 1,
      },

      rightPriceScale: {
        borderColor: "rgba(255,255,255,0.08)",
      },

      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // ✅ NEW API (FIXED)
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#0ECB81",
      downColor: "#F6465D",
      wickUpColor: "#0ECB81",
      wickDownColor: "#F6465D",
      borderVisible: false,
    });

    // ===== FETCH REAL OHLC DATA =====
    const loadCandles = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=1`
        );

        const data = await res.json();

        const formatted = data.map((c) => ({
          time: Math.floor(c[0] / 1000),
          open: c[1],
          high: c[2],
          low: c[3],
          close: c[4],
        }));

        candleSeries.setData(formatted);
        chart.timeScale().fitContent();
      } catch (err) {
        console.error("Candle fetch failed", err);
      }
    };

    loadCandles();

    // ===== RESPONSIVE =====
    const resize = () => {
      chart.applyOptions({
        width: chartRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      chart.remove();
    };
  }, [coinId]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "260px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}

export default CryptoChart;