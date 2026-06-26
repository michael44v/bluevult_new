import { useState, useEffect } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from "recharts";
import { FaChartBar, FaTrophy, FaHistory, FaPercentage } from "react-icons/fa";

const Performance = () => {
  const uid = localStorage.getItem("user_id");
  const [data, setData] = useState<any>(null);

  const dailyData = [
    { name: "Mon", profit: 2400 },
    { name: "Tue", profit: 1398 },
    { name: "Wed", profit: 9800 },
    { name: "Thu", profit: 3908 },
    { name: "Fri", profit: 4800 },
    { name: "Sat", profit: 3800 },
    { name: "Sun", profit: 4300 },
  ];

  const winLossData = [
    { name: "Won", value: 65, color: "#10b981" },
    { name: "Lost", value: 35, color: "#f43f5e" },
  ];

  const equityCurve = [
    { time: "00:00", balance: 10000 },
    { time: "04:00", balance: 10250 },
    { time: "08:00", balance: 10100 },
    { time: "12:00", balance: 10800 },
    { time: "16:00", balance: 10600 },
    { time: "20:00", balance: 11200 },
    { time: "23:59", balance: 11500 },
  ];

  useEffect(() => {
    // Fetch stats if needed
  }, [uid]);

  const AnalyticsCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <GTpayoutLayout title="Performance Analytics">
      <div className="max-w-[1400px] mx-auto space-y-6 pb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnalyticsCard title="Total ROI" value="+145.2%" icon={FaPercentage} color="bg-blue-600" />
          <AnalyticsCard title="Win Rate" value="65.4%" icon={FaTrophy} color="bg-emerald-600" />
          <AnalyticsCard title="Total Trades" value="1,284" icon={FaHistory} color="bg-purple-600" />
          <AnalyticsCard title="Avg. Profit" value="$245.20" icon={FaChartBar} color="bg-orange-600" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">

          {/* Equity Curve */}
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold mb-6">Equity Curve (24h)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityCurve}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={3} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Profit */}
          <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-bold mb-6">Daily Profit/Loss</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                    cursor={{fill: '#1e293b', opacity: 0.4}}
                  />
                  <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                    {dailyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.profit >= 5000 ? '#10b981' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        <div className="grid lg:grid-cols-3 gap-6">
           <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold mb-6">Most Traded Assets</h3>
              <div className="space-y-4">
                 {[
                   { name: 'BTC/USD', trades: 450, pct: 75, color: 'bg-orange-500' },
                   { name: 'ETH/USD', trades: 210, pct: 35, color: 'bg-blue-500' },
                   { name: 'XAU/USD', trades: 180, pct: 30, color: 'bg-yellow-500' },
                   { name: 'SOL/USD', trades: 120, pct: 20, color: 'bg-emerald-500' },
                 ].map(asset => (
                   <div key={asset.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                         <span className="text-white">{asset.name}</span>
                         <span className="text-slate-400">{asset.trades} trades</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                         <div className={`h-full ${asset.color}`} style={{ width: `${asset.pct}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="lg:col-span-2 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
              <h3 className="text-lg font-bold mb-6">Trade Duration Distribution</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={[
                     { min: '1m', count: 120 },
                     { min: '5m', count: 340 },
                     { min: '15m', count: 560 },
                     { min: '30m', count: 210 },
                     { min: '1h', count: 90 },
                   ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="min" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
                   </LineChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>

      </div>
    </GTpayoutLayout>
  );
};

export default Performance;
