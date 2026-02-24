import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

function CandleChart({ coinId }) {
  const chartContainerRef = useRef();

  useEffect(() => {
    if (!coinId) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: "#0b0e11" },
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
        borderColor: "rgba(255,255,255,0.1)",
      },
      timeScale: {
        borderColor: "rgba(255,255,255,0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#0ecb81",
      downColor: "#f6465d",
      borderUpColor: "#0ecb81",
      borderDownColor: "#f6465d",
      wickUpColor: "#0ecb81",
      wickDownColor: "#f6465d",
    });

    const fetchCandles = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=1`
        );

        const data = await res.json();

        const formatted = data.map(c => ({
          time: c[0] / 1000,
          open: c[1],
          high: c[2],
          low: c[3],
          close: c[4],
        }));

        candleSeries.setData(formatted);
      } catch (err) {
        console.error("Candle fetch error:", err);
      }
    };

    fetchCandles();

    const handleResize = () => {
      chart.applyOptions({
        width: chartContainerRef.current.clientWidth,
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [coinId]);

  return (
    <div
      ref={chartContainerRef}
      style={{
        width: "100%",
        height: "500px",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    />
  );
}

export default CandleChart;