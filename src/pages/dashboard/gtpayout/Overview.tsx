import { useState, useEffect } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import {
  FaWallet,
  FaChartLine,
  FaRobot,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaExchangeAlt,
  FaPlay,
  FaStop,
  FaHandPointer,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Overview = () => {
  const uid = localStorage.getItem("user_id");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferDirection, setTransferDirection] = useState<"main_to_trading" | "trading_to_main">("main_to_trading");
  const [isTransferring, setIsTransferring] = useState(false);

  const performanceData = [
    { date: "May 11", value: 92000 },
    { date: "May 12", value: 105000 },
    { date: "May 13", value: 98000 },
    { date: "May 14", value: 112000 },
    { date: "May 15", value: 110000 },
    { date: "May 16", value: 118000 },
    { date: "May 17", value: 128540 },
  ];

  const assetAllocation = [
    { name: "BTC", value: 45.2, color: "#F7931A" },
    { name: "ETH", value: 28.7, color: "#627EEA" },
    { name: "SOL", value: 12.4, color: "#14F195" },
    { name: "USDT", value: 9.6, color: "#26A17B" },
    { name: "Others", value: 4.1, color: "#8247E5" },
  ];

  const fetchData = async () => {
    try {
      const response = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "gtpayout_stats", uid }),
      });
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [uid]);

  const handleTransfer = async () => {
    const amt = parseFloat(transferAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsTransferring(true);
    try {
      const from = transferDirection === "main_to_trading" ? "main" : "trading";
      const to = transferDirection === "main_to_trading" ? "trading" : "main";

      const response = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "transfer_funds", uid, from, to, amount: amt }),
      });
      const json = await response.json();
      if (json.success) {
        toast.success(json.message);
        setTransferAmount("");
        setShowTransferModal(false);
        fetchData();
      } else {
        toast.error(json.message);
      }
    } catch (error) {
      toast.error("Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const StatBox = ({ label, value, subValue, trend, trendColor }: any) => (
    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg">
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold ${trendColor}`}>{trend}</span>
        {subValue && <span className="text-[10px] text-slate-500">{subValue}</span>}
      </div>
    </div>
  );

  return (
    <GTpayoutLayout title="GTpayout Dashboard">
      <div className="max-w-[1400px] mx-auto space-y-6 pb-10">

        {/* Top Section: Balance & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Wallet Balance Card */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <div>
              <p className="text-slate-400 text-sm mb-1">Main Wallet Balance</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold text-white">
                  ${parseFloat(data?.main_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/wallets/deposit">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 font-bold">Deposit</Button>
              </Link>
              <Link to="/withdrawal">
                <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-6 font-bold">Withdraw</Button>
              </Link>
            </div>
          </div>

          {/* Trading Wallet Balance Card */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <div>
              <p className="text-slate-400 text-sm mb-1">Trading Wallet Balance</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold text-white">
                  ${parseFloat(data?.wallet?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                <span className="bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <FaArrowUp className="text-[8px]" /> +12.45%
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/dashboard/gtpayout/trading">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 font-bold">Trade Now</Button>
              </Link>
              <Link to="/dashboard/gtpayout/bot">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-slate-900 rounded-xl px-4 font-bold">Bot</Button>
              </Link>
              <Button
                size="sm"
                onClick={() => {
                  setTransferDirection("trading_to_main");
                  setShowTransferModal(true);
                }}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-4 font-bold"
              >
                Transfer
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox
            label="Today's Profit"
            value={`$${parseFloat(data?.wallet?.today_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="+8.91% (24h)"
            trendColor="text-emerald-500"
          />
          <StatBox
            label="Total Profit"
            value={`$${parseFloat(data?.wallet?.total_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            trend="+35.62%"
            trendColor="text-emerald-500"
          />
          <StatBox
            label="Win Rate"
            value={`${data?.wallet?.win_rate || 0}%`}
            trend="+6.21%"
            trendColor="text-emerald-500"
          />
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 shadow-lg flex justify-between items-center">
            <div>
              <p className="text-slate-400 text-sm mb-1">Active Bots</p>
              <p className="text-2xl font-bold text-white mb-1">{data?.bot_active ? 1 : 0}</p>
              <span className={`${data?.bot_active ? 'text-emerald-500' : 'text-slate-500'} text-[10px] font-bold flex items-center gap-1`}>
                <div className={`w-1.5 h-1.5 rounded-full ${data?.bot_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} /> {data?.bot_active ? 'Running' : 'Stopped'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-500 rotate-12">
               <FaRobot size={20} />
            </div>
          </div>
        </div>

        {/* Charts & Allocation */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Performance Overview */}
          <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Performance Overview</h3>
              <select className="bg-slate-800 border-none text-xs rounded-lg px-2 py-1 outline-none">
                <option>7D</option>
                <option>1M</option>
                <option>All</option>
              </select>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold mb-6">Asset Allocation</h3>
            <div className="h-[200px] flex items-center justify-center relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={assetAllocation}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {assetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-[10px] text-slate-500 uppercase">Total</p>
                  <p className="text-sm font-bold text-white">$128,540</p>
               </div>
            </div>
            <div className="space-y-2 mt-4">
              {assetAllocation.map((asset) => (
                <div key={asset.name} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: asset.color }} />
                    <span className="text-slate-400 font-bold">{asset.name}</span>
                  </div>
                  <span className="text-white font-bold">{asset.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Trades & Quick Buttons */}
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Recent Trades */}
          <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase tracking-wider border-b border-slate-800">
                    <th className="pb-3 px-2">Pair</th>
                    <th className="pb-3 px-2">Type</th>
                    <th className="pb-3 px-2">Amount</th>
                    <th className="pb-3 px-2 text-right">Profit</th>
                    <th className="pb-3 px-2 text-center">Status</th>
                    <th className="pb-3 px-2 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {(data?.trades || []).map((trade: any) => (
                    <tr key={trade.trade_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-2 font-bold text-white">{trade.asset_symbol}</td>
                      <td className={`py-4 px-2 font-bold ${trade.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>{trade.direction === 'up' ? 'Long' : 'Short'}</td>
                      <td className="py-4 px-2 text-slate-300 font-medium">${parseFloat(trade.amount).toLocaleString()}</td>
                      <td className={`py-4 px-2 font-bold text-right ${parseFloat(trade.pnl) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {parseFloat(trade.pnl) >= 0 ? '+' : ''}${parseFloat(trade.pnl).toLocaleString()}
                      </td>
                      <td className="py-4 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${trade.status === 'won' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : trade.status === 'lost' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                          {trade.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-2 text-slate-500 text-right">{new Date(trade.start_time).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instant Payout & Quick Actions */}
          <div className="space-y-6">
             <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/20 shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                   Instant Payout
                </h3>
                <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-4">
                   <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-500 text-xs">USDT (TRC20)</span>
                      <FaArrowDown className="text-slate-600 text-[10px]" />
                   </div>
                   <p className="text-2xl font-extrabold text-white">
                     ${parseFloat(data?.wallet?.total_profit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                   </p>
                </div>
                <Button
                  onClick={() => {
                    setTransferDirection("trading_to_main");
                    setTransferAmount(data?.wallet?.total_profit || "0");
                    setShowTransferModal(true);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center gap-2"
                >
                   <FaExchangeAlt /> Withdraw Now
                </Button>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <Link to="/dashboard/gtpayout/trading" className="block">
                    <Button variant="outline" className="w-full border-slate-700 bg-slate-900 hover:bg-slate-800 text-white h-auto py-4 flex flex-col items-center gap-2 rounded-2xl">
                        <FaHandPointer className="text-blue-500" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Manual Trade</span>
                    </Button>
                </Link>
                <Link to="/dashboard/gtpayout/bot" className="block">
                    <Button variant="outline" className="w-full border-slate-700 bg-slate-900 hover:bg-slate-800 text-white h-auto py-4 flex flex-col items-center gap-2 rounded-2xl">
                        <FaRobot className="text-emerald-500" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Start Bot</span>
                    </Button>
                </Link>
                <Link to="/dashboard/gtpayout/wallet" className="block">
                    <Button variant="outline" className="w-full border-slate-700 bg-slate-900 hover:bg-slate-800 text-white h-auto py-4 flex flex-col items-center gap-2 rounded-2xl">
                        <FaExchangeAlt className="text-purple-500" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Transfer</span>
                    </Button>
                </Link>
                <Button variant="outline" className="w-full border-slate-700 bg-slate-900 hover:bg-slate-800 text-white h-auto py-4 flex flex-col items-center gap-2 rounded-2xl">
                    <FaStop className="text-rose-500" />
                    <span className="text-[10px] uppercase font-bold tracking-wider">Stop Bot</span>
                </Button>
             </div>
          </div>

        </div>

      </div>

      {/* Transfer Modal */}
      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
        <DialogContent className="bg-[#0f172a] border border-slate-800 text-white sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FaExchangeAlt className="text-blue-500" /> Quick Transfer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex p-1 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                onClick={() => setTransferDirection("main_to_trading")}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${transferDirection === "main_to_trading" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Main to Trading
              </button>
              <button
                onClick={() => setTransferDirection("trading_to_main")}
                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${transferDirection === "trading_to_main" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Trading to Main
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Amount to Transfer</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="bg-slate-900 border-slate-800 text-white h-14 pl-8 rounded-2xl focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-between px-1">
                <span className="text-[10px] text-slate-500">Available:
                  <span className="text-slate-300 ml-1 font-bold">
                    ${transferDirection === "main_to_trading"
                      ? parseFloat(data?.main_balance || 0).toLocaleString()
                      : parseFloat(data?.wallet?.balance || 0).toLocaleString()}
                  </span>
                </span>
                <button
                  onClick={() => setTransferAmount(transferDirection === "main_to_trading" ? data?.main_balance : data?.wallet?.balance)}
                  className="text-[10px] text-blue-500 font-bold hover:underline"
                >
                  Transfer Max
                </button>
              </div>
            </div>

            <Button
              onClick={handleTransfer}
              disabled={isTransferring}
              className="w-full bg-blue-600 hover:bg-blue-700 py-7 rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20"
            >
              {isTransferring ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : "Confirm Transfer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </GTpayoutLayout>
  );
};

export default Overview;
