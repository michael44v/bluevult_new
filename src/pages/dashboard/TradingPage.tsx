import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "./dashboardWidgets/Sidebar";
import TradingViewWidget from "@/components/dashboard/TradingViewWidget";
import OrderBook from "@/components/dashboard/OrderBook";
import RecentTrades from "@/components/dashboard/RecentTrades";
import { ASSET_DEFS } from "@/constants/assets";
import { toast } from "sonner";
import { Wallet, Info, ChevronDown, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";

const TradingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [asset, setAsset] = useState(ASSET_DEFS.find(a => a.symbol === searchParams.get("asset")) || ASSET_DEFS[0]);
  const [side, setSide] = useState<"long" | "short">("long");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [leverage, setLeverage] = useState(1);
  const [margin, setMargin] = useState("");
  const [limitPrice, setLimitPrice] = useState("");
  const [price, setPrice] = useState(0);
  const [prevPrice, setPrevPrice] = useState(0);
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
            const newPrice = parseFloat(msg.p);
            setPrice(prev => {
                setPrevPrice(prev);
                return newPrice;
            });
            if (!limitPrice && orderType === "market") setLimitPrice(newPrice.toFixed(2));
          }
        };

        return () => ws.close();
    } else {
        const basePrices: Record<string, number> = { AAPL: 190, TSLA: 170, NVDA: 850, MSFT: 410, AMZN: 180, GOOGL: 150, META: 500 };
        const initialPrice = basePrices[asset.symbol] || 100;
        setPrice(initialPrice);
        setLimitPrice(initialPrice.toFixed(2));

        const mockInterval = setInterval(() => {
            setPrice(prev => {
                setPrevPrice(prev);
                return prev + (Math.random() - 0.5) * 0.2;
            });
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
          entry_price: orderType === "limit" ? parseFloat(limitPrice) : price,
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
    <div className="flex flex-col min-h-screen bg-[#020617] text-white">
      <div className="flex flex-1">
        <div className={`fixed inset-y-0 left-0 w-64 bg-[#0a0f1f] shadow-2xl z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 border-r border-white/5`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 max-w-full">
          <TopBar title={`${asset.name}/USDT Spot`} onSidebarToggle={() => setSidebarOpen(true)} />

          <div className="pt-20 px-2 pb-4 flex flex-col xl:flex-row gap-2 h-auto min-h-[calc(100vh-1rem)] overflow-y-auto">

            {/* Left: Order Book */}
            <div className="w-full xl:w-72 flex flex-col gap-2 shrink-0">
                <div className="flex-1 min-h-[500px]">
                    <OrderBook symbol={asset.symbol} price={price} />
                </div>
            </div>

            {/* Center: Chart & Positions */}
            <div className="flex-1 flex flex-col gap-2 min-w-0">
                {/* Symbol Info Bar */}
                <div className="bg-[#0a1120] p-4 rounded-xl border border-white/5 flex items-center gap-8 overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xl font-bold">{asset.symbol}/USDT</span>
                        <div className={`flex items-center gap-1 text-sm font-bold ${price >= prevPrice ? 'text-green-500' : 'text-red-500'}`}>
                            {price.toLocaleString()}
                            {price >= prevPrice ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                    </div>

                    <div className="flex gap-6 shrink-0">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">24h Change</span>
                            <span className="text-xs text-green-500 font-bold">+4.28%</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">24h High</span>
                            <span className="text-xs">{(price * 1.05).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">24h Low</span>
                            <span className="text-xs">{(price * 0.95).toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase font-bold">24h Volume(USDT)</span>
                            <span className="text-xs">1.28B</span>
                        </div>
                    </div>
                </div>

                <div className="h-[500px] bg-[#0a1120] rounded-xl shadow-lg overflow-hidden border border-white/5 relative">
                  <TradingViewWidget symbol={asset.type === "Crypto" ? `${asset.symbol}USDT` : asset.symbol} />
                </div>

                {/* Positions Section */}
                <div className="bg-[#0a1120] rounded-xl border border-white/5 overflow-hidden">
                    <div className="flex border-b border-white/5 bg-[#1a1d2a]">
                        <button className="px-6 py-3 text-xs font-bold text-blue-500 border-b-2 border-blue-500">Open Positions</button>
                        <button className="px-6 py-3 text-xs font-bold text-gray-500 hover:text-gray-300">Order History</button>
                        <button className="px-6 py-3 text-xs font-bold text-gray-500 hover:text-gray-300">Trade History</button>
                    </div>
                    <div className="p-8 text-center">
                        <div className="flex flex-col items-center gap-2 text-gray-600">
                            <Activity className="w-12 h-12 opacity-20" />
                            <p className="text-sm">No open positions</p>
                            <button onClick={() => navigate("/positions")} className="text-xs text-blue-500 hover:underline mt-2">View all history</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Trading Panel & Recent Trades */}
            <div className="w-full xl:w-80 flex flex-col gap-2 shrink-0">
              <div className="bg-[#0a1120] p-5 rounded-xl shadow-lg border border-white/5 flex flex-col">
                {/* Buy/Sell Tabs */}
                <div className="flex mb-6 bg-[#1a1d2a] p-1 rounded-lg">
                  <button
                    onClick={() => setSide("long")}
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition ${side === "long" ? "bg-green-500 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setSide("short")}
                    className={`flex-1 py-2 rounded-md text-xs font-bold transition ${side === "short" ? "bg-red-500 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"}`}
                  >
                    Sell
                  </button>
                </div>

                {/* Market/Limit Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/5">
                    <button
                        onClick={() => setOrderType("market")}
                        className={`pb-2 text-xs font-bold transition relative ${orderType === "market" ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" : "text-gray-500"}`}
                    >
                        Market
                    </button>
                    <button
                        onClick={() => setOrderType("limit")}
                        className={`pb-2 text-xs font-bold transition relative ${orderType === "limit" ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500" : "text-gray-500"}`}
                    >
                        Limit
                    </button>
                </div>

                <div className="space-y-5 flex-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-500 flex items-center gap-1"><Wallet className="w-3 h-3" /> Avbl</span>
                    <span className="font-mono text-gray-300">{balance.toLocaleString()} USDT</span>
                  </div>

                  {orderType === "limit" && (
                      <div>
                        <div className="flex justify-between text-[10px] text-gray-500 mb-1 px-1 font-bold uppercase tracking-widest">
                            <span>Price</span>
                            <span>USDT</span>
                        </div>
                        <input
                          type="number"
                          value={limitPrice}
                          onChange={(e) => setLimitPrice(e.target.value)}
                          className="w-full bg-[#1a1d2a] border border-white/5 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 transition outline-none font-mono"
                        />
                      </div>
                  )}

                  <div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1 px-1 font-bold uppercase tracking-widest">
                        <span>Quantity</span>
                        <span>USDT</span>
                    </div>
                    <input
                      type="number"
                      value={margin}
                      onChange={(e) => setMargin(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#1a1d2a] border border-white/5 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 transition outline-none font-mono"
                    />
                  </div>

                  {/* Leverage Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] text-gray-500 mb-2 px-1 font-bold uppercase tracking-widest">
                        <span>Leverage</span>
                        <span className="text-blue-500">{leverage}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="500"
                      value={leverage}
                      onChange={(e) => setLeverage(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#1a1d2a] rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-[9px] text-gray-600 mt-2 font-bold">
                      <span>1x</span>
                      <span>125x</span>
                      <span>250x</span>
                      <span>500x</span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-[#1a1d2a] p-4 rounded-lg space-y-3 border border-white/5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Order Value</span>
                      <span className="text-gray-300 font-mono">${((parseFloat(margin) || 0) * leverage).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-gray-500">Est. Fee</span>
                      <span className="text-gray-300 font-mono">0.00 USDT</span>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenPosition}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition shadow-2xl transform active:scale-95 disabled:opacity-50 ${
                      side === "long" ? "bg-green-500 hover:bg-green-600 shadow-green-500/20" : "bg-red-500 hover:bg-red-600 shadow-red-500/20"
                    }`}
                  >
                    {loading ? "Processing..." : `${side === "long" ? "Buy / Long" : "Sell / Short"}`}
                  </button>
                </div>

                {/* Footer Info */}
                <div className="mt-6 flex items-center gap-2 p-3 bg-blue-500/5 rounded-lg border border-blue-500/10">
                    <Info className="w-4 h-4 text-blue-500 shrink-0" />
                    <p className="text-[10px] text-gray-400">Trading involves significant risk. Always use stop-losses to protect your capital.</p>
                </div>
              </div>

              {/* Recent Trades at the bottom of right column */}
              <div className="h-[400px]">
                <RecentTrades price={price} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingPage;
