import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "./dashboardWidgets/Sidebar";
import TradingViewWidget from "@/components/dashboard/TradingViewWidget";
import { ASSET_DEFS } from "@/constants/assets";
import { toast } from "sonner";

const TradingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [asset, setAsset] = useState(ASSET_DEFS.find(a => a.symbol === searchParams.get("asset")) || ASSET_DEFS[0]);
  const [side, setSide] = useState<"long" | "short">("long");
  const [leverage, setLeverage] = useState(1);
  const [margin, setMargin] = useState("");
  const [price, setPrice] = useState(0);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const fetchBalance = async () => {
    const uid = localStorage.getItem("user_id");
    if (!uid) return;
    try {
      const res = await fetch("/api/index.php", {
        method: "POST",
        body: JSON.stringify({ q: "sidebar", uid }),
      });
      const data = await res.json();
      if (data.success) setBalance(data.balance);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    const symbol = asset.binanceSymbol || "btcusdt";

    if (asset.type === "Crypto") {
        const url = `wss://stream.binance.com:9443/ws/${symbol}@trade`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.p) {
            setPrice(parseFloat(msg.p));
          }
        };

        return () => ws.close();
    } else {
        // Stock price movement
        const basePrices: Record<string, number> = { AAPL: 190, TSLA: 170, NVDA: 850, MSFT: 410, AMZN: 180, GOOGL: 150, META: 500 };
        setPrice(basePrices[asset.symbol] || 100);

        const mockInterval = setInterval(() => {
            setPrice(prev => prev + (Math.random() - 0.5) * 0.2);
        }, 1000);

        return () => clearInterval(mockInterval);
    }
  }, [asset]);

  const handleOpenPosition = async () => {
    const uid = localStorage.getItem("user_id");
    if (!uid) return toast.error("Please login first");
    if (!margin || parseFloat(margin) <= 0) return toast.error("Enter margin amount");
    if (parseFloat(margin) > balance) return toast.error("Insufficient balance");

    setLoading(true);
    try {
      const res = await fetch("/api/index.php", {
        method: "POST",
        body: JSON.stringify({
          q: "open_position",
          uid,
          asset: asset.symbol,
          side,
          leverage,
          margin: parseFloat(margin),
          entry_price: price,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchBalance();
        navigate("/positions");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-[#0f111b] text-gray-900 dark:text-white">
      <div className="flex flex-1">
        <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 max-w-full">
          <TopBar title={`Trade ${asset.name}`} onSidebarToggle={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 mt-16 flex flex-col lg:flex-row gap-6">
            {/* Chart Section */}
            <div className="flex-1 bg-white dark:bg-[#0a1120] rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-white/5 min-h-[400px]">
              <TradingViewWidget symbol={asset.type === "Crypto" ? `${asset.symbol}USDT` : asset.symbol} />
            </div>

            {/* Trading Panel */}
            <div className="w-full lg:w-80 flex flex-col gap-6">
              <div className="bg-white dark:bg-[#0a1120] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/5">
                <div className="flex mb-6 bg-gray-100 dark:bg-[#1a1d2a] p-1 rounded-xl">
                  <button
                    onClick={() => setSide("long")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${side === "long" ? "bg-green-500 text-white shadow-lg" : "text-gray-500"}`}
                  >
                    Buy / Long
                  </button>
                  <button
                    onClick={() => setSide("short")}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${side === "short" ? "bg-red-500 text-white shadow-lg" : "text-gray-500"}`}
                  >
                    Sell / Short
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Available Balance</span>
                    <span className="font-mono text-gray-900 dark:text-white">${balance.toLocaleString()}</span>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Margin (USD)</label>
                    <input
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-gray-100 dark:bg-[#1a1d2a] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#00C4B4] transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Leverage: {leverage}x</label>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      className="w-full accent-[#00C4B4]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                      <span>1x</span>
                      <span>125x</span>
                      <span>250x</span>
                      <span>500x</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-[#1a1d2a] p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Entry Price</span>
                      <span className="font-mono">${price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Position Size</span>
                      <span className="font-mono">${((parseFloat(margin) || 0) * leverage).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenPosition}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition shadow-lg ${
                      side === "long" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"
                    } text-white active:scale-95 disabled:opacity-50`}
                  >
                    {loading ? "Processing..." : `${side === "long" ? "Open Long" : "Open Short"}`}
                  </button>
                </div>
              </div>

              {/* Asset Info */}
              <div className="bg-white dark:bg-[#0a1120] p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-white/5">
                <h3 className="font-bold text-sm mb-4">Asset Details</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Name</span>
                        <span className="text-xs font-semibold">{asset.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Symbol</span>
                        <span className="text-xs font-semibold">{asset.symbol}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">Type</span>
                        <span className="text-xs font-semibold bg-[#00C4B4]/10 text-[#00C4B4] px-2 py-0.5 rounded">{asset.type}</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
