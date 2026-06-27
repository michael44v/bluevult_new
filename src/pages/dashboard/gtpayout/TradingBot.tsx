import { useState, useEffect } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FaRobot, FaPlay, FaStop, FaHistory, FaCogs, FaChartBar, FaTrophy } from "react-icons/fa";

const TradingBot = () => {
  const uid = localStorage.getItem("user_id");
  const [botStatus, setBotStatus] = useState<"running" | "paused" | "stopped">("stopped");
  const [mode, setMode] = useState<"conservative" | "balanced" | "aggressive" | "custom">("balanced");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const botModes = [
    { key: "conservative", label: "Conservative", risk: "Low", return: "2-5%", desc: "Low risk, steady growth focusing on capital preservation." },
    { key: "balanced", label: "Balanced", risk: "Medium", return: "5-15%", desc: "Moderate risk with balanced strategy for consistent returns." },
    { key: "aggressive", label: "Aggressive", risk: "High", return: "15-40%", desc: "High risk, high reward strategy for rapid portfolio growth." },
  ];

  const handleStart = async () => {
    setLoading(true);
    try {
        const res = await fetch("https://bluevult.com/api/index.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: "bot_action", uid, action: "start", mode }),
        });
        const data = await res.json();
        if (data.success) {
            setBotStatus("running");
            toast.success(`AI Trading Bot started in ${mode} mode`);
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
        const res = await fetch("https://bluevult.com/api/index.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ q: "bot_action", uid, action: "stop" }),
        });
        const data = await res.json();
        if (data.success) {
            setBotStatus("stopped");
            toast.info("AI Trading Bot stopped");
        }
    } catch (err) {
        toast.error("Failed to stop bot");
    } finally {
        setLoading(false);
    }
  };

  return (
    <GTpayoutLayout title="AI Trading Bot">
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Bot Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
            {botStatus === "running" && (
                <div className="absolute top-0 right-0 p-4">
                    <span className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Trading
                    </span>
                </div>
            )}

            <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-2xl ${botStatus === "running" ? "bg-emerald-500/20 text-emerald-500" : "bg-slate-800 text-slate-400"}`}>
                    <FaRobot size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">GTpayout AI Engine</h2>
                    <p className="text-slate-400 text-sm">Automated algorithmic trading strategy</p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {botModes.map((m) => (
                    <div
                        key={m.key}
                        onClick={() => setBotStatus === "stopped" && setMode(m.key as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${mode === m.key ? 'bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-600/10' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'}`}
                    >
                        <p className={`text-xs font-bold uppercase mb-2 ${mode === m.key ? 'text-blue-400' : 'text-slate-500'}`}>{m.label}</p>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-xs text-slate-400">Target ROI</p>
                                <p className="text-lg font-bold text-white">{m.return}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-500">Risk</p>
                                <p className={`text-xs font-bold ${m.risk === 'Low' ? 'text-emerald-500' : m.risk === 'Medium' ? 'text-yellow-500' : 'text-rose-500'}`}>{m.risk}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                {botModes.find(m => m.key === mode)?.desc} The bot uses EMA crossover, RSI, MACD, and Sentiment analysis to execute high-probability trades.
            </p>

            <div className="flex gap-4">
                {botStatus === "stopped" ? (
                    <Button
                        onClick={handleStart}
                        disabled={loading}
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-6 rounded-2xl shadow-lg shadow-emerald-500/20"
                    >
                        <FaPlay className="mr-2" /> {loading ? "Initializing..." : "Activate AI Bot"}
                    </Button>
                ) : (
                    <Button
                        onClick={handleStop}
                        disabled={loading}
                        className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-6 rounded-2xl shadow-lg shadow-rose-500/20"
                    >
                        <FaStop className="mr-2" /> {loading ? "Stopping..." : "Stop Trading"}
                    </Button>
                )}
                <Button variant="outline" className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-white py-6 rounded-2xl">
                    <FaCogs />
                </Button>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FaHistory className="text-blue-500" /> AI Decision History
            </h3>
            <div className="space-y-4">
                {[
                    { signal: 'BUY', asset: 'BTC/USD', confidence: '88%', reason: 'EMA crossover confirmed on 15m timeframe', time: '2 mins ago' },
                    { signal: 'SELL', asset: 'ETH/USD', confidence: '74%', reason: 'RSI overbought on 5m timeframe', time: '15 mins ago' },
                    { signal: 'BUY', asset: 'SOL/USD', confidence: '92%', reason: 'Strong support bounce at $124.50', time: '42 mins ago' },
                ].map((log, i) => (
                    <div key={i} className="p-4 bg-slate-800/40 rounded-xl border border-slate-800 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.signal === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{log.signal}</span>
                                <span className="text-sm font-bold text-white">{log.asset}</span>
                            </div>
                            <p className="text-xs text-slate-400">{log.reason}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-blue-400">{log.confidence} Conf.</p>
                            <p className="text-[10px] text-slate-600">{log.time}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Bot Analytics */}
        <div className="space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <FaChartBar className="text-purple-500" /> Performance Analytics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Today's PnL</p>
                        <p className="text-xl font-bold text-emerald-500">+$1,245.30</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Win Rate</p>
                        <p className="text-xl font-bold text-white">82.4%</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Profit</p>
                        <p className="text-xl font-bold text-emerald-500">+$14,280</p>
                    </div>
                    <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Trades</p>
                        <p className="text-xl font-bold text-white">142</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FaTrophy className="text-yellow-500" /> Bot Ranking
                </h3>
                <div className="space-y-4">
                    {[
                        { name: 'AI Scalper Pro', roi: '+42.5%', status: 'Best Performance' },
                        { name: 'Trend Master', roi: '+28.2%', status: 'Reliable' },
                    ].map((rank, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-slate-600">#{i+1}</span>
                                <div>
                                    <p className="text-xs font-bold text-white">{rank.name}</p>
                                    <p className="text-[10px] text-slate-500">{rank.status}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-500">{rank.roi}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>
    </GTpayoutLayout>
  );
};

export default TradingBot;
