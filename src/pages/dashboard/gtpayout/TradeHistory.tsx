import { useState, useEffect } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import { FaFilter, FaDownload, FaSearch, FaRobot } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const TradeHistory = () => {
  const uid = localStorage.getItem("user_id");
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchTrades = async () => {
    try {
      const response = await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "gtpayout_stats", uid }),
      });
      const json = await response.json();
      setTrades(json.trades || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
    const tid = setInterval(fetchTrades, 3000);
    return () => clearInterval(tid);
  }, [uid]);

  const filteredTrades = trades.filter((t) => {
    if (filter === "all") return true;
    if (filter === "won") return t.status === "won";
    if (filter === "lost") return t.status === "lost";
    if (filter === "open") return t.status === "open";
    if (filter === "bot") return parseInt(t.is_bot) === 1;
    return true;
  });

  return (
    <GTpayoutLayout title="Trade History">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 w-full md:w-auto">
            <FaSearch className="text-slate-500" />
            <input
              type="text"
              placeholder="Search trade ID..."
              className="bg-transparent border-none outline-none text-sm text-white w-full"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="won">Won Only</option>
              <option value="lost">Lost Only</option>
              <option value="open">Open Only</option>
              <option value="bot">AI Bot Only</option>
            </select>

            <Button variant="outline" className="border-slate-800 bg-slate-900 text-white rounded-xl flex items-center gap-2">
              <FaDownload /> Export CSV
            </Button>
          </div>
        </div>

        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-900 text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 font-bold">Trade ID</th>
                  <th className="py-4 px-6 font-bold">Asset</th>
                  <th className="py-4 px-6 font-bold">Type</th>
                  <th className="py-4 px-6 font-bold">Amount</th>
                  <th className="py-4 px-6 font-bold">Entry</th>
                  <th className="py-4 px-6 font-bold">Exit</th>
                  <th className="py-4 px-6 font-bold text-right">Profit/Loss</th>
                  <th className="py-4 px-6 font-bold text-center">Status</th>
                  <th className="py-4 px-6 font-bold text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {loading ? (
                  <tr><td colSpan={9} className="py-10 text-center text-slate-500 italic">Loading trade history...</td></tr>
                ) : filteredTrades.length === 0 ? (
                  <tr><td colSpan={9} className="py-10 text-center text-slate-500 italic">No trades found matching your criteria.</td></tr>
                ) : filteredTrades.map((trade: any) => (
                  <tr key={trade.trade_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 text-slate-400 font-mono flex items-center gap-2">
                        {parseInt(trade.is_bot) === 1 && <FaRobot className="text-blue-400" title="AI Bot Trade" />}
                        #GT-{trade.trade_id}
                    </td>
                    <td className="py-4 px-6 font-bold text-white">{trade.asset_symbol}</td>
                    <td className={`py-4 px-6 font-bold uppercase ${trade.direction === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {trade.direction === 'up' ? 'Long' : 'Short'}
                    </td>
                    <td className="py-4 px-6 text-white font-medium">${parseFloat(trade.amount).toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-400">${parseFloat(trade.entry_price).toLocaleString()}</td>
                    <td className="py-4 px-6 text-slate-400">{trade.exit_price ? `$${parseFloat(trade.exit_price).toLocaleString()}` : '-'}</td>
                    <td className={`py-4 px-6 text-right font-bold ${parseFloat(trade.pnl) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {parseFloat(trade.pnl) >= 0 ? '+' : ''}${parseFloat(trade.pnl).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                        trade.status === 'won' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        trade.status === 'lost' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-right text-xs">
                      {new Date(trade.start_time).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </GTpayoutLayout>
  );
};

export default TradeHistory;
