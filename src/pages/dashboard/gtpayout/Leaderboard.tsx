import { useState, useEffect } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import { FaTrophy, FaMedal, FaUserCircle, FaSearch, FaFileCsv, FaFilePdf } from "react-icons/fa";
import { Button } from "@/components/ui/button";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState<"all" | "monthly">("all");

  const leaders = [
    { rank: 1, name: "Alex Rivers", profit: "$124,500", roi: "+142.5%", winRate: "88%", trades: 1242 },
    { rank: 2, name: "Elena K.", profit: "$98,200", roi: "+115.2%", winRate: "82%", trades: 856 },
    { rank: 3, name: "Marcus Stone", profit: "$84,150", roi: "+98.4%", winRate: "79%", trades: 2104 },
    { rank: 4, name: "Sarah Chen", profit: "$72,400", roi: "+85.1%", winRate: "85%", trades: 642 },
    { rank: 5, name: "David Miller", profit: "$68,900", roi: "+78.9%", winRate: "74%", trades: 1530 },
    { rank: 6, name: "Yuki T.", profit: "$62,100", roi: "+72.4%", winRate: "81%", trades: 420 },
    { rank: 7, name: "Jordan B.", profit: "$58,400", roi: "+68.2%", winRate: "77%", trades: 980 },
    { rank: 8, name: "Maria G.", profit: "$52,100", roi: "+62.1%", winRate: "75%", trades: 1120 },
    { rank: 9, name: "Sam Wilson", profit: "$48,900", roi: "+58.4%", winRate: "72%", trades: 840 },
    { rank: 10, name: "Chris P.", profit: "$45,200", roi: "+52.1%", winRate: "70%", trades: 1420 },
  ];

  const RankBadge = ({ rank }: { rank: number }) => {
    if (rank === 1) return <FaTrophy className="text-yellow-500" size={20} />;
    if (rank === 2) return <FaMedal className="text-slate-300" size={20} />;
    if (rank === 3) return <FaMedal className="text-amber-600" size={20} />;
    return <span className="text-slate-500 font-bold w-5 text-center">{rank}</span>;
  };

  return (
    <GTpayoutLayout title="Leaderboard">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-2xl border border-yellow-500/20">
               <FaTrophy size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Trading Hall of Fame</h2>
              <p className="text-slate-400 text-sm">Top performing traders and bots on GTpayout</p>
            </div>
          </div>

          <div className="flex bg-slate-800 rounded-xl p-1 border border-slate-700 w-full md:w-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "all" ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All Time
            </button>
            <button
              onClick={() => setActiveTab("monthly")}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "monthly" ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Top 3 Podiums */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Rank 2 */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center text-center order-2 md:order-1 h-[260px] justify-center">
                <div className="relative mb-4">
                    <FaUserCircle size={64} className="text-slate-400" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                        <FaMedal className="text-slate-300" />
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{leaders[1].name}</h3>
                <p className="text-emerald-500 font-extrabold text-xl">{leaders[1].profit}</p>
                <p className="text-xs text-slate-500 uppercase font-bold mt-2">ROI: {leaders[1].roi}</p>
            </div>

            {/* Rank 1 */}
            <div className="bg-slate-900/80 p-8 rounded-3xl border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/10 flex flex-col items-center text-center order-1 md:order-2 h-[320px] justify-center relative">
                <div className="absolute -top-4 bg-yellow-500 text-slate-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Master Trader</div>
                <div className="relative mb-4">
                    <FaUserCircle size={80} className="text-slate-300" />
                    <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-slate-800 border-2 border-yellow-500 flex items-center justify-center shadow-lg">
                        <FaTrophy className="text-yellow-500" />
                    </div>
                </div>
                <h3 className="font-bold text-2xl mb-1">{leaders[0].name}</h3>
                <p className="text-emerald-400 font-black text-3xl">{leaders[0].profit}</p>
                <p className="text-sm text-slate-400 uppercase font-bold mt-2 tracking-widest">ROI: {leaders[0].roi}</p>
            </div>

            {/* Rank 3 */}
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col items-center text-center order-3 md:order-3 h-[240px] justify-center">
                <div className="relative mb-4">
                    <FaUserCircle size={64} className="text-slate-400" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                        <FaMedal className="text-amber-600" />
                    </div>
                </div>
                <h3 className="font-bold text-lg mb-1">{leaders[2].name}</h3>
                <p className="text-emerald-500 font-extrabold text-xl">{leaders[2].profit}</p>
                <p className="text-xs text-slate-500 uppercase font-bold mt-2">ROI: {leaders[2].roi}</p>
            </div>
        </div>

        {/* Table List */}
        <div className="bg-slate-900/50 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/30">
                <h3 className="font-bold">Full Rankings</h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-xs h-9">
                        <FaFileCsv className="mr-2" /> CSV
                    </Button>
                    <Button variant="outline" size="sm" className="bg-slate-800 border-slate-700 text-xs h-9">
                        <FaFilePdf className="mr-2" /> PDF
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-slate-500 uppercase text-[10px] font-black tracking-widest border-b border-slate-800/50">
                            <th className="py-4 px-6">Rank</th>
                            <th className="py-4 px-6">User</th>
                            <th className="py-4 px-6">Total Profit</th>
                            <th className="py-4 px-6">ROI</th>
                            <th className="py-4 px-6">Win Rate</th>
                            <th className="py-4 px-6 text-right">Trades</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {leaders.map((leader) => (
                            <tr key={leader.rank} className={`hover:bg-slate-800/20 transition-colors ${leader.rank <= 3 ? 'bg-slate-800/10' : ''}`}>
                                <td className="py-4 px-6">
                                    <RankBadge rank={leader.rank} />
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <FaUserCircle className="text-slate-600" size={24} />
                                        <span className="font-bold text-white text-sm">{leader.name}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-emerald-500 font-bold text-sm">{leader.profit}</td>
                                <td className="py-4 px-6 text-white font-bold text-sm">{leader.roi}</td>
                                <td className="py-4 px-6 text-slate-300 font-medium text-sm">{leader.winRate}</td>
                                <td className="py-4 px-6 text-slate-500 text-right font-mono text-sm">{leader.trades}</td>
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

export default Leaderboard;
