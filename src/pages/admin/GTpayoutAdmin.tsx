import { useState, useEffect } from "react";
import { FaRobot, FaChartLine, FaHistory, FaCogs, FaUsers, FaList, FaChartBar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AdminLayout from "./components/AdminLayout";

const GTpayoutAdmin = () => {
  const [stats, setStats] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch("/api/admin-api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "admin_gtpayout_overview" }),
        });
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
          setTrades(data.recent_trades);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <div className="p-10 text-white">Loading GTpayout Admin...</div>;

  return (
    <AdminLayout title="GTpayout Management">
    <div className="p-0 space-y-6 bg-[#020617] text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FaRobot className="text-emerald-500" /> GTpayout Management
        </h1>
        <div className="flex gap-2">
            <Link to="/admin/gtpayout/trades">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 font-bold">
                <FaList /> Bot Trades
              </Button>
            </Link>
            <Link to="/admin/gtpayout/analytics">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 font-bold">
                <FaChartBar /> Bot Analytics
              </Button>
            </Link>
            <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition">
            Global Bot Settings
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Trading Volume", value: `$${parseFloat(stats?.total_balance || 0).toLocaleString()}`, icon: <FaChartLine />, color: "text-blue-500" },
          { label: "Active Bot Sessions", value: stats?.active_bots || 0, icon: <FaRobot />, color: "text-emerald-500" },
          { label: "Total Trades Executed", value: stats?.total_trades || 0, icon: <FaHistory />, color: "text-purple-500" },
          { label: "Platform Profit (Share)", value: `$${parseFloat(stats?.total_profit || 0).toLocaleString()}`, icon: <FaUsers />, color: "text-yellow-500" },
        ].map((s, i) => (
          <div key={i} className="bg-[#0a0f1f] p-6 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}>{s.icon}</div>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-2xl font-black">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0a0f1f] rounded-2xl border border-white/5 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="font-bold">Global Recent Trades</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 uppercase text-[10px] font-black tracking-widest border-b border-white/5">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Asset</th>
                <th className="py-4 px-6">Direction</th>
                <th className="py-4 px-6">Amount</th>
                <th className="py-4 px-6 text-right">PnL</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {trades.map((trade: any, i: number) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-bold">{trade.user_name}</td>
                  <td className="py-4 px-6 text-gray-300">{trade.asset_symbol}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${trade.direction === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-mono">${parseFloat(trade.amount).toLocaleString()}</td>
                  <td className="py-4 px-6 text-right font-bold text-emerald-500">
                    {parseFloat(trade.pnl) >= 0 ? '+' : ''}{parseFloat(trade.pnl).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="bg-white/5 text-gray-400 px-2 py-1 rounded-full text-[10px] font-bold border border-white/10 uppercase">
                      {trade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default GTpayoutAdmin;
