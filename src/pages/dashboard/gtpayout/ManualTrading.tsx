import { useState, useEffect } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import TradingChart from "./TradingChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaArrowUp, FaArrowDown, FaClock } from "react-icons/fa";

const ManualTrading = () => {
  const uid = localStorage.getItem("user_id");
  const [asset, setAsset] = useState("BTC/USD");
  const [timeframe, setTimeframe] = useState("1m");
  const [amount, setAmount] = useState("100");
  const [duration, setDuration] = useState("1m");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const res = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "gtpayout_wallet", uid }),
      });
      const data = await res.json();
      if (data.success) {
        setBalance(parseFloat(data.trading_wallet.balance));
      }
    };
    fetchBalance();
  }, [uid]);

  const handleTrade = async (direction: 'up' | 'down') => {
    const amt = parseFloat(amount);
    if (amt > balance) {
      toast.error("Insufficient Trading Wallet balance");
      return;
    }

    try {
      const res = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: "execute_trade",
          uid,
          symbol: asset,
          amount: amt,
          direction,
          duration
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Trade ${direction.toUpperCase()} opened for $${amount}`);
        setBalance(prev => prev - amt);
      } else {
        toast.error(data.message || "Failed to execute trade");
      }
    } catch (err) {
      toast.error("Connection error");
    }
  };

  const assets = ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "XAU/USD", "EUR/USD", "GBP/USD", "USD/JPY"];
  const timeframes = ["1m", "5m", "15m", "30m", "1h"];

  return (
    <GTpayoutLayout title="Manual Trading">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-160px)]">

        {/* Left: Chart Section */}
        <div className="flex-1 bg-slate-900/50 rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="bg-slate-800 text-white text-sm rounded-lg px-3 py-2 outline-none border border-slate-700"
              >
                {assets.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                {timeframes.map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${timeframe === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Balance</p>
              <p className="text-emerald-500 font-extrabold font-mono">${balance.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex-1 p-4 relative">
             <TradingChart symbol={asset} />
          </div>
        </div>

        {/* Right: Trading Controls */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-6">
            <h3 className="text-lg font-bold">Open Trade</h3>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-800 border-slate-700 h-14 pl-8 text-xl font-bold text-white focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="col-span-2 bg-slate-800 border border-slate-700 h-14 rounded-md px-4 text-white font-bold outline-none"
                  >
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="30m">30 Minutes</option>
                    <option value="1h">1 Hour</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={() => handleTrade('up')}
                  className="bg-emerald-500 hover:bg-emerald-600 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <FaArrowUp size={24} />
                  <span className="font-extrabold uppercase tracking-widest text-xs">Buy (UP)</span>
                </Button>
                <Button
                  onClick={() => handleTrade('down')}
                  className="bg-rose-500 hover:bg-rose-600 h-24 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg shadow-rose-500/20"
                >
                  <FaArrowDown size={24} />
                  <span className="font-extrabold uppercase tracking-widest text-xs">Sell (DOWN)</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
             <h4 className="text-sm font-bold mb-4 flex items-center gap-2 text-slate-400">
                <FaClock /> Active Trades
             </h4>
             <div className="text-center py-6">
                <p className="text-xs text-slate-600">No active trades at the moment.</p>
             </div>
          </div>
        </div>

      </div>
    </GTpayoutLayout>
  );
};

export default ManualTrading;
