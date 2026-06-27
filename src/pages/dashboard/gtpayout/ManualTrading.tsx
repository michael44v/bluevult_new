import { useState, useEffect } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import TradingChart from "./TradingChart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaHistory, FaListUl } from "react-icons/fa";

const ManualTrading = () => {
  const uid = localStorage.getItem("user_id");
  const [asset, setAsset] = useState("BTC/USD");
  const [amount, setAmount] = useState("100");
  const [duration, setDuration] = useState("1m");
  const [balance, setBalance] = useState(0);
  const [orderBook, setOrderBook] = useState<{ price: number; amount: number; total: number; type: 'buy' | 'sell' }[]>([]);
  const [recentTrades, setRecentTrades] = useState<any[]>([]);

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

    // Fetch trades
    const fetchTrades = async () => {
      const res = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "gtpayout_stats", uid }),
      });
      const data = await res.json();
      if (data.success) {
        setRecentTrades(data.trades || []);
      }
    };
    fetchTrades();

    // Generate Mock Order Book
    const generateOrderBook = () => {
      const basePrice = asset === "BTC/USD" ? 65000 : 3500;
      const orders: any[] = [];
      for (let i = 0; i < 15; i++) {
        orders.push({
          price: basePrice + (Math.random() * 100 - 50),
          amount: Math.random() * 2,
          type: Math.random() > 0.5 ? 'buy' : 'sell'
        });
      }
      setOrderBook(orders.sort((a, b) => b.price - a.price));
    };
    generateOrderBook();
    const interval = setInterval(generateOrderBook, 3000);
    return () => clearInterval(interval);
  }, [uid, asset]);

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

  return (
    <GTpayoutLayout title="Manual Trading">
      <div className="flex flex-col h-full space-y-4">

        {/* Top Ticker / Balance Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Trading Balance</span>
              <span className="text-xl font-extrabold text-emerald-500 font-mono">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="h-10 w-px bg-slate-800 hidden md:block" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Asset</span>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="bg-transparent text-white font-bold outline-none cursor-pointer"
              >
                {assets.map(a => <option key={a} value={a} className="bg-slate-900">{a}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 md:pb-0">
             {[
               { label: '24h High', value: '$67,421.00', color: 'text-white' },
               { label: '24h Low', value: '$64,120.50', color: 'text-white' },
               { label: '24h Change', value: '+2.45%', color: 'text-emerald-500' },
               { label: '24h Volume', value: '1.2B USDT', color: 'text-slate-400' },
             ].map((item, i) => (
               <div key={i} className="flex flex-col min-w-[80px]">
                 <span className="text-[9px] text-slate-500 font-bold">{item.label}</span>
                 <span className={`text-xs font-bold ${item.color}`}>{item.value}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Main Grid: Order Book | Chart | Trade Execution */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full min-h-[600px]">

          {/* Left: Order Book (Binance Style) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center gap-2">
               <FaListUl className="text-blue-500 text-xs" />
               <h3 className="text-xs font-bold uppercase text-slate-400">Order Book</h3>
            </div>
            <div className="flex-1 overflow-y-auto font-mono text-[10px]">
               <div className="grid grid-cols-2 p-2 text-slate-500 font-bold border-b border-slate-800/50">
                  <span>Price</span>
                  <span className="text-right">Amount</span>
               </div>

               {/* Sells */}
               <div className="space-y-0.5 p-1">
                  {orderBook.filter(o => o.type === 'sell').slice(0, 8).map((o, i) => (
                    <div key={i} className="grid grid-cols-2 relative group hover:bg-slate-800/50 cursor-pointer p-1 rounded">
                       <div className="absolute inset-0 bg-rose-500/10 origin-right transition-transform" style={{ width: `${(o.amount / 2) * 100}%` }} />
                       <span className="text-rose-500 font-bold z-10">{o.price.toFixed(2)}</span>
                       <span className="text-right text-slate-400 z-10">{o.amount.toFixed(4)}</span>
                    </div>
                  ))}
               </div>

               <div className="py-2 text-center border-y border-slate-800 bg-slate-800/30">
                  <span className="text-sm font-bold text-white">65,241.50</span>
               </div>

               {/* Buys */}
               <div className="space-y-0.5 p-1">
                  {orderBook.filter(o => o.type === 'buy').slice(0, 8).map((o, i) => (
                    <div key={i} className="grid grid-cols-2 relative group hover:bg-slate-800/50 cursor-pointer p-1 rounded">
                       <div className="absolute inset-0 bg-emerald-500/10 origin-right transition-transform" style={{ width: `${(o.amount / 2) * 100}%` }} />
                       <span className="text-emerald-500 font-bold z-10">{o.price.toFixed(2)}</span>
                       <span className="text-right text-slate-400 z-10">{o.amount.toFixed(4)}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>

          {/* Middle: Chart */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 overflow-hidden">
                <TradingChart symbol={asset} />
             </div>

             {/* Bottom: Trade History / Positions */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl h-48 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                   <div className="flex gap-4">
                      <button className="text-xs font-bold text-blue-500 border-b-2 border-blue-500 pb-1">Open Positions</button>
                      <button className="text-xs font-bold text-slate-500 hover:text-white pb-1">Order History</button>
                   </div>
                   <FaHistory className="text-slate-600 text-xs" />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                   <table className="w-full text-left text-[10px]">
                      <thead>
                        <tr className="text-slate-500 uppercase">
                          <th>Time</th>
                          <th>Asset</th>
                          <th>Side</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-slate-300">
                         {recentTrades.map((t, i) => (
                           <tr key={i} className="border-b border-slate-800/50">
                              <td className="py-2">{new Date(t.start_time).toLocaleTimeString()}</td>
                              <td className="py-2 font-bold text-white">{t.asset_symbol}</td>
                              <td className={`py-2 font-bold ${t.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.direction.toUpperCase()}</td>
                              <td className="py-2">${parseFloat(t.amount).toLocaleString()}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${t.status === 'won' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                  {t.status.toUpperCase()}
                                </span>
                              </td>
                           </tr>
                         ))}
                         {recentTrades.length === 0 && (
                           <tr>
                              <td colSpan={5} className="text-center py-8 text-slate-600">No active positions.</td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

          {/* Right: Execution Form */}
          <div className="lg:col-span-3 space-y-4">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="flex gap-2 mb-6 p-1 bg-slate-800 rounded-xl">
                   <button className="flex-1 py-2 bg-emerald-500 text-slate-900 font-bold rounded-lg text-sm">Buy</button>
                   <button className="flex-1 py-2 text-slate-400 font-bold rounded-lg text-sm hover:text-white">Sell</button>
                </div>

                <div className="space-y-4">
                   <div>
                      <div className="flex justify-between mb-2">
                         <label className="text-[10px] text-slate-500 font-bold uppercase">Amount (USDT)</label>
                         <span className="text-[10px] text-slate-500 font-bold uppercase">Avbl: <span className="text-white">{balance.toFixed(2)}</span></span>
                      </div>
                      <div className="relative">
                         <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-slate-800 border-slate-700 h-12 text-white font-bold focus:ring-emerald-500"
                         />
                         <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">USDT</span>
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Duration</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 h-12 rounded-md px-4 text-white font-bold outline-none"
                      >
                         <option value="1m">1 Minute</option>
                         <option value="5m">5 Minutes</option>
                         <option value="15m">15 Minutes</option>
                         <option value="1h">1 Hour</option>
                      </select>
                   </div>

                   <div className="grid grid-cols-4 gap-2 pt-2">
                      {['25%', '50%', '75%', '100%'].map(p => (
                        <button
                          key={p}
                          onClick={() => setAmount((balance * (parseInt(p) / 100)).toString())}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold py-1.5 rounded transition-colors"
                        >
                          {p}
                        </button>
                      ))}
                   </div>

                   <div className="pt-4 flex flex-col gap-3">
                      <Button
                        onClick={() => handleTrade('up')}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-extrabold h-14 rounded-xl text-lg shadow-lg shadow-emerald-500/20"
                      >
                         <FaArrowUp className="mr-2" /> BUY / LONG
                      </Button>
                      <Button
                        onClick={() => handleTrade('down')}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold h-14 rounded-xl text-lg shadow-lg shadow-rose-500/20"
                      >
                         <FaArrowDown className="mr-2" /> SELL / SHORT
                      </Button>
                   </div>
                </div>
             </div>

             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
                   <FaExchangeAlt className="text-blue-500" /> Market Info
                </h4>
                <div className="space-y-3">
                   <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-bold">Payout</span>
                      <span className="text-emerald-500 font-bold">+85%</span>
                   </div>
                   <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-bold">Min Amount</span>
                      <span className="text-white font-bold">$10.00</span>
                   </div>
                   <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500 font-bold">Market Status</span>
                      <span className="text-emerald-500 font-bold">Open</span>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </div>
    </GTpayoutLayout>
  );
};

export default ManualTrading;
