import React, { useState, useEffect, useRef } from "react";
import TopBar from "@/components/dashboard/TopBar";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";
import { toast } from "sonner";
import { FaCircle, FaHistory } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ASSET_DEFS } from "@/constants/assets";

interface Position {
  position_id: number;
  asset_symbol: string;
  side: "long" | "short";
  leverage: number;
  margin: string;
  size: string;
  entry_price: string;
  created_at: string;
  current_price?: number;
  pnl?: number;
  close_price?: string;
}

const PositionsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [history, setHistory] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const wsRef = useRef<Record<string, WebSocket>>({});

  const fetchPositions = async () => {
    const uid = localStorage.getItem("user_id");
    if (!uid) return;
    try {
      const res = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        body: JSON.stringify({ q: "get_positions", uid, status: "open" }),
      });
      const data = await res.json();
      if (data.success) {
        setPositions(data.positions);
        setupWebsockets(data.positions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    const uid = localStorage.getItem("user_id");
    if (!uid) return;
    try {
      const res = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        body: JSON.stringify({ q: "get_positions", uid, status: "closed" }),
      });
      const data = await res.json();
      if (data.success) setHistory(data.positions);
    } catch (err) {
      console.error(err);
    }
  };

  const setupWebsockets = (posList: Position[]) => {
    const symbols = Array.from(new Set(posList.map(p => p.asset_symbol.toUpperCase())));

    symbols.forEach(symbol => {
      const assetDef = ASSET_DEFS.find(a => a.symbol === symbol);
      if (!assetDef) return;

      if (assetDef.type === "Crypto") {
        if (wsRef.current[symbol]) return;
        const wsUrl = `wss://stream.binance.com:9443/ws/${assetDef.binanceSymbol}@trade`;
        const ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          const msg = JSON.parse(event.data);
          if (msg.p) {
            updatePositionPrice(symbol, parseFloat(msg.p));
          }
        };
        wsRef.current[symbol] = ws;
      } else {
        // Realistic stock price movement
        const basePrices: Record<string, number> = { AAPL: 190, TSLA: 170, NVDA: 850, MSFT: 410, AMZN: 180, GOOGL: 150, META: 500 };
        let currentMockPrice = basePrices[symbol] || 100;

        const interval = setInterval(() => {
          currentMockPrice += (Math.random() - 0.5) * 0.2;
          updatePositionPrice(symbol, currentMockPrice);
        }, 2000);

        // Store interval to clear it later (reusing wsRef for simplicity)
        wsRef.current[symbol] = { close: () => clearInterval(interval) } as any;
      }
    });
  };

  const updatePositionPrice = (symbol: string, price: number) => {
    setPositions(prev => prev.map(p => {
      if (p.asset_symbol === symbol) {
        const entry = parseFloat(p.entry_price);
        const size = parseFloat(p.size);
        const pnl = p.side === "long"
          ? (price - entry) * (size / entry)
          : (entry - price) * (size / entry);
        return { ...p, current_price: price, pnl };
      }
      return p;
    }));
  };

  useEffect(() => {
    fetchPositions();
    fetchHistory();
    return () => {
      Object.values(wsRef.current).forEach(ws => ws.close());
    };
  }, []);

  const handleClosePosition = async (pid: number, currentPrice: number) => {
    const uid = localStorage.getItem("user_id");
    if (!uid || !currentPrice) return;

    try {
      const res = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        body: JSON.stringify({ q: "close_position", pid, uid, close_price: currentPrice }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Position closed. PnL: $${data.pnl.toFixed(2)}`);
        fetchPositions();
        fetchHistory();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error closing position");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-[#0f111b] text-gray-900 dark:text-white">
      <div className="flex flex-1">
        <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 max-w-full">
          <TopBar title="My Positions" onSidebarToggle={() => setSidebarOpen(true)} />

          <div className="p-6 mt-16 space-y-6">
            <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab("active")}
                    className={`pb-2 px-4 text-sm font-bold transition-colors relative ${activeTab === "active" ? "text-[#00C4B4]" : "text-gray-500"}`}
                >
                    Active Positions
                    {activeTab === "active" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C4B4]" />}
                </button>
                <button
                    onClick={() => setActiveTab("history")}
                    className={`pb-2 px-4 text-sm font-bold transition-colors relative ${activeTab === "history" ? "text-[#00C4B4]" : "text-gray-500"}`}
                >
                    Trade History
                    {activeTab === "history" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00C4B4]" />}
                </button>
            </div>

            {activeTab === "active" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {positions.length > 0 ? positions.map((pos) => (
                    <div key={pos.position_id} className="bg-white dark:bg-[#0a1120] p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                        <h3 className="font-bold text-lg">{pos.asset_symbol}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${pos.side === 'long' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {pos.side} {pos.leverage}x
                        </span>
                        </div>
                        <div className="text-right">
                        <p className={`font-mono font-bold text-lg ${(pos.pnl || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ${(pos.pnl || 0).toFixed(2)}
                        </p>
                        <p className="text-[10px] text-gray-500">Unrealized PnL</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="bg-gray-50 dark:bg-[#1a1d2a] p-3 rounded-xl">
                        <p className="text-gray-500 mb-1">Entry Price</p>
                        <p className="font-mono font-semibold">${parseFloat(pos.entry_price).toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#1a1d2a] p-3 rounded-xl">
                        <p className="text-gray-500 mb-1">Mark Price</p>
                        <p className="font-mono font-semibold text-[#00C4B4]">${(pos.current_price || 0).toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#1a1d2a] p-3 rounded-xl">
                        <p className="text-gray-500 mb-1">Margin</p>
                        <p className="font-mono font-semibold">${parseFloat(pos.margin).toFixed(2)}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-[#1a1d2a] p-3 rounded-xl">
                        <p className="text-gray-500 mb-1">Size</p>
                        <p className="font-mono font-semibold">${parseFloat(pos.size).toFixed(2)}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => handleClosePosition(pos.position_id, pos.current_price || 0)}
                        className="w-full py-3 bg-gray-100 dark:bg-[#1a1d2a] hover:bg-red-500 hover:text-white rounded-xl text-sm font-bold transition duration-300"
                    >
                        Close Position
                    </button>
                    </div>
                )) : (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-[#0a1120] rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
                        <p className="text-gray-500">No active positions</p>
                        <Link to="/markets" className="text-[#00C4B4] text-sm mt-2 inline-block hover:underline font-bold">Start Trading →</Link>
                    </div>
                )}
                </div>
            ) : (
                <div className="bg-white dark:bg-[#0a1120] rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-[#1a1d2a] text-xs text-gray-500 uppercase">
                                <tr>
                                    <th className="px-6 py-4">Asset</th>
                                    <th className="px-6 py-4">Side</th>
                                    <th className="px-6 py-4">PnL</th>
                                    <th className="px-6 py-4">Margin</th>
                                    <th className="px-6 py-4">Entry / Close</th>
                                    <th className="px-6 py-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {history.map((pos) => (
                                    <tr key={pos.position_id} className="text-sm hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-6 py-4 font-bold">{pos.asset_symbol}</td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${pos.side === 'long' ? 'text-green-500' : 'text-red-500'}`}>{pos.side} {pos.leverage}x</span>
                                        </td>
                                        <td className={`px-6 py-4 font-mono font-bold ${parseFloat(pos.pnl as any) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            ${parseFloat(pos.pnl as any).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 font-mono">${parseFloat(pos.margin).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs">
                                                <p className="text-gray-500">E: ${parseFloat(pos.entry_price).toFixed(2)}</p>
                                                <p>C: ${parseFloat(pos.close_price || "0").toFixed(2)}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(pos.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionsPage;
