import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import {
  FaExchangeAlt,
  FaUser,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaRobot,
  FaSearch
} from "react-icons/fa";
import { Input } from "@/components/ui/input";

const GTpayoutTrades = () => {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const res = await fetch("/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "admin_get_all_trades" }),
      });
      const json = await res.json();
      if (json.success) {
        setTrades(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrades = trades.filter(t =>
    t.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.asset_symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.trade_id.toString().includes(searchTerm)
  );

  return (
    <AdminLayout title="GTpayout Trades">
    <div className="p-0 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Trades Management</h1>
          <p className="text-sm text-slate-500">Monitor all manual and bot trades across the platform.</p>
        </div>
        <div className="relative w-full md:w-64">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search users or assets..."
            className="pl-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Trade ID</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Asset</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Result (PnL)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={8} className="px-6 py-4 h-16 bg-slate-50/50 dark:bg-slate-800/20" />
                  </tr>
                ))
              ) : filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500 italic">No trades found matching your criteria.</td>
                </tr>
              ) : (
                filteredTrades.map((t) => (
                  <tr key={t.trade_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">#{t.trade_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                          <FaUser size={12} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{t.user_name}</p>
                          <p className="text-[10px] text-slate-500">{t.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">{t.asset_symbol}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`flex items-center gap-1 font-bold ${t.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {t.direction === 'up' ? <FaArrowUp size={10} /> : <FaArrowDown size={10} />}
                          {t.direction === 'up' ? 'LONG' : 'SHORT'}
                        </span>
                        {t.is_bot == 1 && (
                          <span className="flex items-center gap-1 text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full w-fit font-black">
                            <FaRobot size={8} /> AI BOT
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">${parseFloat(t.amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                       <span className={`font-black ${parseFloat(t.pnl) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {parseFloat(t.pnl) >= 0 ? '+' : ''}${parseFloat(t.pnl).toLocaleString()}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${
                        t.status === 'won' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        t.status === 'lost' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <FaClock size={10} />
                        {new Date(t.start_time).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default GTpayoutTrades;
