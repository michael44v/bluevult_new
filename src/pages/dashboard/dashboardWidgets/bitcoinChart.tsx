import React, { useEffect, useRef, memo } from "react";
import { FaBitcoin } from "react-icons/fa";

const TradingViewWidget: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    // TradingView widget configuration
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: false,
      interval: "D",
      locale: "en",
      save_image: true,
      style: "1",
      symbol: "BINANCE:BTCUSDT",
      theme: "light",
      timezone: "Etc/UTC",
      backgroundColor: "#ffffff",
      gridColor: "rgba(46, 46, 46, 0.06)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      studies: [],
      "width": "100%",
      "height": 500
    });

    container.current.appendChild(script);

    return () => {
      // Clean up script when unmounting
      if (container.current) {
        container.current.innerHTML = "";
      }
    };
  }, []);

  return (
   <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-6">

  {/* ===== HEADER ===== */}
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-full bg-yellow-400/15 text-yellow-500">
        <FaBitcoin className="text-xl" />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          BTC / USDT
        </h2>
        <p className="text-sm text-gray-500">
          Binance • Spot Market
        </p>
      </div>
    </div>

    <div className="text-right">
      <p className="text-lg font-bold text-gray-900">$43,280.12</p>
      <span className="text-sm text-green-500 font-medium">
        +2.34%
      </span>
    </div>
  </div>

  {/* ===== CHART ===== */}
 <div className="bg-white rounded-2xl shadow-xl p-4">
<div
className="tradingview-widget-container"
ref={container}
style={{ height: "500px", width: "100%" }}
>
{/* ⚠️ MUST NOT BE SELF-CLOSING */}
<div className="tradingview-widget-container__widget"></div>
</div>
</div>
  {/* ===== STATS ROW ===== */}
  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">24h High</p>
      <p className="font-semibold text-gray-900">$44,120</p>
    </div>

    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">24h Low</p>
      <p className="font-semibold text-gray-900">$42,610</p>
    </div>

    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500">Volume</p>
      <p className="font-semibold text-gray-900">12.4K BTC</p>
    </div>
  </div>

  {/* ===== ACTION BUTTONS ===== */}
  <div className="grid grid-cols-2 gap-4 mt-6">
    <button
      className="w-full py-3 rounded-xl font-semibold text-white
                 bg-gradient-to-r from-green-500 to-emerald-600
                 hover:opacity-90 transition shadow-lg shadow-green-500/30"
    >
      Buy BTC
    </button>

    <button
      className="w-full py-3 rounded-xl font-semibold text-white
                 bg-gradient-to-r from-red-500 to-rose-600
                 hover:opacity-90 transition shadow-lg shadow-red-500/30"
    >
      Sell BTC
    </button>
  </div>

  {/* ===== FOOTER ===== */}
  <p className="text-xs text-gray-400 text-center mt-4">
    Chart data powered by TradingView
  </p>
</div>
  );
};

export default memo(TradingViewWidget);