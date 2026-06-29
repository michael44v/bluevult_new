import { useState, useEffect, useRef } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import TradingChart from "./TradingChart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaRobot, FaPlay, FaStop, FaChartLine, FaShieldAlt, FaBolt, FaHistory, FaBars, FaTimes, FaInfoCircle } from "react-icons/fa";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TradingBot = () => {
  const uid = localStorage.getItem("user_id");
  const [botStatus, setBotStatus] = useState<"running" | "stopped">("stopped");
  const [balance, setBalance] = useState(0);
  const [asset, setAsset] = useState("BTC/USD");
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastPrice, setLastPrice] = useState(0);
  const [amount, setAmount] = useState("100");
  const [activeTab, setActiveTab] = useState<"history" | "active">("active");
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});

  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchStatus();
    fetchBalance();

    // Start status polling every 3 seconds for real-time history/status updates
    statusPollingRef.current = setInterval(fetchStatus, 3000);

    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      if (statusPollingRef.current) clearInterval(statusPollingRef.current);
    };
  }, [uid]);

  // Handle live price updates via WebSocket (using Binance)
  useEffect(() => {
    const symbols = ["btcusdt", "ethusdt", "solusdt"];
    const streams = symbols.map(s => `${s}@trade`).join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const ws = new WebSocket(url);
    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            if (msg.data && msg.data.s && msg.data.p) {
                const symbol = msg.data.s.toLowerCase(); // e.g. "btcusdt"
                const price = parseFloat(msg.data.p);
                setCurrentPrices(prev => ({ ...prev, [symbol]: price }));
            }
        } catch {}
    };

    return () => ws.close();
  }, []);

  const calculatePnL = (trade: any) => {
    if (!trade) return 0;
    const symbolMap: Record<string, string> = {
        'BTC/USD': 'btcusdt',
        'ETH/USD': 'ethusdt',
        'BTC': 'btcusdt',
        'ETH': 'ethusdt',
        'SOL': 'solusdt'
    };
    const lookupKey = symbolMap[trade.asset_symbol] || trade.asset_symbol.toLowerCase().replace('/', '');
    const currentPrice = currentPrices[lookupKey];
    if (!currentPrice || trade.status !== 'open') return parseFloat(trade.pnl || 0);

    const entry = parseFloat(trade.entry_price);
    const amount = parseFloat(trade.amount);
    const direction = trade.direction;

    const pctDiff = (currentPrice - entry) / entry;
    return direction === 'up' ? pctDiff * amount : -pctDiff * amount;
  };

  const totalFloatingPnL = trades
    .filter(t => t.status === 'open')
    .reduce((sum, t) => sum + calculatePnL(t), 0);

  const fetchBalance = async () => {
    const res = await fetch("/api/index.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: "gtpayout_wallet", uid }),
    });
    const data = await res.json();
    if (data.success) {
      setBalance(parseFloat(data.trading_wallet.balance));
    }
  };

  const fetchStatus = async () => {
    const res = await fetch("/api/index.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: "gtpayout_stats", uid }),
    });
    const data = await res.json();
    if (data.success) {
      setBotStatus(data.bot_active ? "running" : "stopped");
      setTrades(data.trades.filter((t: any) => t.is_bot == 1) || []);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "bot_action", uid, action: "start", mode: "balanced" }),
      });
      const data = await res.json();
      if (data.success) {
        setBotStatus("running");
        toast.success("AI Bot Activated - Scanning markets...");
      }
    } catch (err) {
      toast.error("Failed to start bot");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "bot_action", uid, action: "stop" }),
      });
      const data = await res.json();
      if (data.success) {
        setBotStatus("stopped");
        toast.info("AI Bot Deactivated");
      }
    } catch (err) {
      toast.error("Failed to stop bot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GTpayoutLayout title="AI Trading Bot" fullWidth={true} hideTopBar={true}>
      <div className="flex flex-col h-full bg-[#020617]">

        {/* Top bar with Balance */}
        <div className="bg-[#0a0f1f] border-b border-slate-800/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button
                onClick={() => document.dispatchEvent(new CustomEvent('toggle-gt-sidebar'))}
                className="lg:hidden p-2 text-slate-400 hover:text-white"
             >
                <FaBars />
             </button>
             <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500">
                <FaRobot size={24} />
             </div>
             <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">AI Trading Balance</p>
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-white font-mono">
                        ${(balance + totalFloatingPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </h2>
                    {totalFloatingPnL !== 0 && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${totalFloatingPnL >= 0 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                            {totalFloatingPnL >= 0 ? '+' : ''}${totalFloatingPnL.toFixed(2)}
                        </span>
                    )}
                </div>
             </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-xl border border-slate-700">
             <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Market:</span>
             <select
               value={asset}
               onChange={(e) => setAsset(e.target.value)}
               className="bg-transparent text-white font-bold text-sm outline-none cursor-pointer"
             >
                <option value="BTC/USD">BTC/USDT</option>
                <option value="ETH/USD">ETH/USDT</option>
                <option value="EUR/USD">EUR/USD</option>
                <option value="XAU/USD">GOLD</option>
             </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-0 flex-1 min-h-0 overflow-hidden">

          {/* Main Chart Section (Quotex Style) */}
          <div className="lg:col-span-9 bg-[#020617] border-r border-slate-800/50 overflow-hidden relative flex flex-col">
             <div className="flex-1 min-h-0 relative">
             <TradingChart symbol={asset} />
             </div>

             {/* Floating Info Overlays */}
             <div className="absolute top-6 left-6 flex gap-2">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                   <p className="text-[8px] text-slate-400 font-bold uppercase">ROI (24h)</p>
                   <p className="text-sm font-bold text-emerald-500">+18.42%</p>
                </div>
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                   <p className="text-[8px] text-slate-400 font-bold uppercase">Trades</p>
                   <p className="text-sm font-bold text-white">124</p>
                </div>
             </div>

             {botStatus === "running" && (
               <div className="absolute top-6 right-6">
                  <div className="bg-emerald-500/20 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-500/30 flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-extrabold text-emerald-500 uppercase tracking-widest">AI Engine Live</span>
                  </div>
               </div>
             )}

             {/* Trades History Overlay Bottom */}
             <div className="absolute bottom-6 left-6 right-6 h-32 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 overflow-hidden flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'active' ? 'text-blue-400' : 'text-slate-500'}`}
                        >
                            Active AI Trades
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${activeTab === 'history' ? 'text-blue-400' : 'text-slate-500'}`}
                        >
                            Bot History
                        </button>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                        <FaRobot size={12} className="text-blue-500" /> AI ENGINE
                    </div>
                </div>
                <div className="flex gap-4 overflow-x-auto h-full items-center no-scrollbar pb-2">
                   {(activeTab === 'active' ? trades.filter(t => t.status === 'open') : trades.filter(t => t.status !== 'open')).map((t, i) => (
                      <div
                        key={i}
                        onClick={() => {
                            setSelectedTrade(t);
                            setShowTradeDetails(true);
                        }}
                        className="min-w-[180px] bg-slate-900/90 p-3 rounded-xl border border-white/5 flex justify-between items-center shadow-xl cursor-pointer hover:bg-slate-800 transition-colors"
                      >
                         <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${t.direction === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                <FaRobot size={14} />
                            </div>
                            <div>
                                <p className="text-[8px] font-extrabold text-slate-400 uppercase">{t.asset_symbol}</p>
                                <p className={`text-[10px] font-bold ${t.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {t.direction.toUpperCase()} ${parseFloat(t.amount).toFixed(0)}
                                </p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[8px] text-slate-600 font-mono mb-1">{new Date(t.start_time).toLocaleTimeString()}</p>
                            {t.status === 'open' ? (
                                <div className="flex flex-col items-end">
                                    <span className="text-[9px] font-bold text-blue-400 animate-pulse">RUNNING</span>
                                    <span className={`text-[9px] font-black ${calculatePnL(t) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {calculatePnL(t) >= 0 ? '+' : ''}${calculatePnL(t).toFixed(2)}
                                    </span>
                                </div>
                            ) : (
                                <span className={`text-[9px] font-bold ${t.status === 'won' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {t.status.toUpperCase()}
                                </span>
                            )}
                         </div>
                      </div>
                   ))}
                   {(activeTab === 'active' ? trades.filter(t => t.status === 'open') : trades.filter(t => t.status !== 'open')).length === 0 && (
                        <p className="text-[10px] text-slate-500 font-medium italic w-full text-center">
                            {activeTab === 'active' ? "AI Bot is waiting for high-probability signals..." : "No bot history found..."}
                        </p>
                   )}
                </div>
             </div>
          </div>

          {/* Side Controls Section */}
          <div className="lg:col-span-3 flex flex-col overflow-y-auto no-scrollbar">
             <div className="bg-slate-900 p-6 space-y-6 flex-1">
                <div className="space-y-4">
                   <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-800">
                      <FaShieldAlt className="text-emerald-500" />
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold">Auto Risk Management</p>
                        <p className="text-xs font-bold text-white">Active (SL: 2% | TP: 5%)</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-2xl border border-slate-800">
                      <FaBolt className="text-yellow-500" />
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold">Trading Leverage</p>
                        <p className="text-xs font-bold text-white">Auto (20x - 50x)</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] text-slate-500 font-bold uppercase ml-1">Trade Amount</label>
                   <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex justify-between items-center">
                      <span className="text-lg font-bold text-white">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent text-right text-xl font-extrabold text-white outline-none w-full"
                      />
                   </div>
                </div>

                <div className="pt-4">
                   {botStatus === "stopped" ? (
                     <Button
                        onClick={handleStart}
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold h-20 rounded-2xl text-xl shadow-lg shadow-emerald-500/20 flex flex-col gap-1 transition-all active:scale-95"
                     >
                        <FaPlay size={20} />
                        <span className="text-[10px] uppercase tracking-widest">Activate AI Bot</span>
                     </Button>
                   ) : (
                     <Button
                        onClick={handleStop}
                        disabled={loading}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold h-20 rounded-2xl text-xl shadow-lg shadow-rose-500/20 flex flex-col gap-1 transition-all active:scale-95"
                     >
                        <FaStop size={20} />
                        <span className="text-[10px] uppercase tracking-widest">Stop Trading</span>
                     </Button>
                   )}
                </div>

                <div className="bg-blue-600/10 p-4 rounded-2xl border border-blue-500/20">
                   <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Bot Intelligence</p>
                   <p className="text-xs text-slate-400 leading-relaxed">
                      Our proprietary AI scans multi-timeframe candle patterns, RSI, MACD, and real-time sentiment to execute trades with an average 82% success rate.
                   </p>
                </div>
             </div>

             <div className="bg-slate-900 border-t border-slate-800 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                      <FaHistory size={16} className="text-slate-400" />
                   </div>
                   <span className="text-sm font-bold text-white">Full Performance</span>
                </div>
                <FaChartLine className="text-blue-500" />
             </div>
          </div>

        </div>
      </div>

      {/* Trade Details Modal */}
      <Dialog open={showTradeDetails} onOpenChange={setShowTradeDetails}>
        <DialogContent className="bg-[#0f172a] border border-slate-800 text-white sm:max-w-[450px] rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-xl font-bold flex items-center gap-3">
              <div className={`p-2 rounded-xl ${selectedTrade?.direction === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                <FaRobot size={20} />
              </div>
              <div>
                <span>{selectedTrade?.asset_symbol} Bot Trade</span>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Trade ID: #{selectedTrade?.trade_id}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</p>
                    <span className={`text-sm font-black uppercase ${selectedTrade?.status === 'won' ? 'text-emerald-500' : selectedTrade?.status === 'lost' ? 'text-rose-500' : 'text-blue-500'}`}>
                        {selectedTrade?.status}
                    </span>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Direction</p>
                    <span className={`text-sm font-black uppercase ${selectedTrade?.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {selectedTrade?.direction === 'up' ? 'LONG ↑' : 'SHORT ↓'}
                    </span>
                </div>
            </div>

            <div className="space-y-3 bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Entry Price</span>
                    <span className="font-mono font-bold">${parseFloat(selectedTrade?.entry_price || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Current/Exit Price</span>
                    <span className="font-mono font-bold">
                        ${(selectedTrade?.status === 'open'
                            ? (currentPrices[selectedTrade.asset_symbol.toLowerCase().replace('/', '')] || selectedTrade.entry_price)
                            : (selectedTrade?.exit_price || selectedTrade?.entry_price || 0)
                        ).toLocaleString()}
                    </span>
                </div>
                <div className="h-px bg-slate-800/50 my-2" />
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Amount</span>
                    <span className="font-bold text-white">${parseFloat(selectedTrade?.amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">PnL</span>
                    <span className={`font-bold ${calculatePnL(selectedTrade) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {calculatePnL(selectedTrade) >= 0 ? '+' : ''}${calculatePnL(selectedTrade).toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-500/60 font-bold uppercase mb-1">Take Profit</p>
                    <p className="text-sm font-mono font-bold text-emerald-500">
                        {selectedTrade?.tp_price ? `$${parseFloat(selectedTrade.tp_price).toLocaleString()}` : 'Not Set'}
                    </p>
                </div>
                <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
                    <p className="text-[10px] text-rose-500/60 font-bold uppercase mb-1">Stop Loss</p>
                    <p className="text-sm font-mono font-bold text-rose-500">
                        {selectedTrade?.sl_price ? `$${parseFloat(selectedTrade.sl_price).toLocaleString()}` : 'Not Set'}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                <FaInfoCircle className="text-blue-500" />
                <p className="text-[10px] text-blue-400 font-medium">
                    This trade is managed by the AI Engine. SL and TP are automatically adjusted based on real-time market volatility.
                </p>
            </div>
          </div>

          <div className="p-6 pt-0">
             <Button
                onClick={() => setShowTradeDetails(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-6 rounded-2xl"
             >
                Close Details
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </GTpayoutLayout>
  );
};

export default TradingBot;
