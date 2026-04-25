import { useState, useEffect, ReactNode } from "react";
import Sidebar from "./dashboardWidgets/Sidebar";
import TradingViewWidget from "./dashboardWidgets/bitcoinChart";
import Footer from "@/components/landing/Footer";

import { Link } from "react-router-dom";

import {
  FaBell,
  FaMoon,
  FaSun,
  FaUserCircle,
  FaBitcoin,
  FaDollarSign,
  FaChartLine,
  FaWallet,
  FaBars,
  FaArrowUp,
  FaExchangeAlt,
  FaUniversity,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ------------------------
// Types
// ------------------------
interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  trend: string;
  gradient: string;
  bgTrack: string;
  progressWidth: string;
}

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

interface Transaction {
  id: number;
  type: "Deposit" | "Withdraw" | "Transfer";
  amount: string;
  date: string;
  status: "Completed" | "Pending" | "Failed";
}

// ------------------------
// Static sample data (portfolio)
// ------------------------
const portfolioData = [
  { name: "BTC", value: 55 },
  { name: "ETH", value: 25 },
  { name: "SOL", value: 10 },
  { name: "ADA", value: 10 },
];
const COLORS = ["#F7931A", "#627EEA", "#00FFA3", "#FF2D55"];

// ------------------------
// Action buttons
// ------------------------
const actions = [
  { label: "Deposit", icon: <FaUniversity />, bg: "bg-[#0a1120]", hoverBg: "hover:bg-[#00C4B4]", link: "/wallets/deposit" },
  { label: "Withdraw", icon: <FaArrowUp />, bg: "bg-[#0a1120]", hoverBg: "hover:bg-[#00C4B4]",  link: "/withdrawal" },
  { label: "Connect Wallet", icon: <FaExchangeAlt />, bg: "bg-[#0a1120]", hoverBg: "hover:bg-blue-600",  link: "/connect_wallet"  },
];

// ------------------------
// Main Dashboard Component
// ------------------------
const Dashboard: React.FC = () => {
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("user_name") || "");
  const [uid] = useState(localStorage.getItem("user_id") || "");

  const [stats, setStats] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  // ------------------------
  // Fetch dashboard data
  // ------------------------
  useEffect(() => {
    document.body.style.transition = "opacity 0.5s";
    document.body.style.opacity = "1";

    if (!uid) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "dashboard", uid }),
        });

        const data = await res.json();
        setStats(Array.isArray(data.wallets) ? data.wallets : []);
        setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoadingStats(false);
        setLoadingTransactions(false);
      }
    };

    fetchDashboard();
  }, [uid]);

  // ------------------------
  // Card gradients and icons
  // ------------------------
  const gradients = {
    yellow: "from-yellow-400 to-yellow-500",
    green: "from-green-400 to-green-500",
    purple: "from-purple-500 to-pink-500",
    indigo: "from-indigo-500 to-blue-500",
  };
  const bgTracks = {
    yellow: "bg-yellow-400/20",
    green: "bg-green-400/20",
    purple: "bg-purple-500/20",
    indigo: "bg-indigo-500/20",
  };
  const icons = {
    BTC: <FaBitcoin />,
    USD: <FaDollarSign />,
    Growth: <FaChartLine />,
    Assets: <FaWallet />,
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-100 dark:bg-[#0f111b] text-gray-900 dark:text-gray-100 transition">

        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0a0f1f] shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:ml-64">

          {/* Topbar */}
          <div className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-[#0f111b] border-b border-gray-700 px-6 flex items-center justify-between z-50">
            <div className="flex items-center gap-4">
              <button className="lg:hidden p-2 rounded-md text-white hover:bg-white/10" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <FaBars className="text-xl text-white" />
              </button>
              <h1 className="text-lg font-bold text-white"> Dashboard</h1>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={() => setDark(!dark)} className="p-2 rounded-lg hover:bg-gray-800 transition">
                {dark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-400" />}
              </button>
              <button className="relative p-2 rounded-lg hover:bg-gray-800 transition">
                <FaBell className="text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
              </button>
              <FaUserCircle className="text-3xl opacity-80 text-white" />
            </div>
          </div>

          {/* Main dashboard content */}
          <div className="p-6 space-y-6 mt-16">
            <h2><b>Welcome Back: </b> {userName || "Loading..."}</h2>

            {/* Wallet + Portfolio Stats */}
            <div className="lg:hidden">
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <div className="grid grid-cols-2 gap-4">
                  {loadingStats
                    ? Array(4).fill(0).map((_, idx) => (
                        <div key={idx} className="animate-pulse flex items-center gap-3">
                          <div className="p-3 rounded-full bg-gray-300/30 w-12 h-12" />
                          <div className="flex flex-col gap-1">
                            <div className="h-3 w-16 bg-gray-300 rounded" />
                            <div className="h-5 w-20 bg-gray-300 rounded" />
                            <div className="h-3 w-10 bg-gray-300 rounded" />
                          </div>
                        </div>
                      ))
                    : stats.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`p-3 rounded-full ${item.color ? `bg-${item.color}-400/15 text-${item.color}-500` : "bg-gray-200 text-gray-500"}`}>
                            {icons[item.type] || <FaWallet />}
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{item.label}</p>
                            <p className="font-semibold">{item.value}</p>
                            <span className="text-xs text-green-500">{item.trend}</span>
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </div>

            <div className="hidden lg:grid grid-cols-4 gap-6">
              {loadingStats
                ? Array(4).fill(0).map((_, idx) => (
                    <div key={idx} className="animate-pulse bg-gray-300/20 rounded-2xl h-28" />
                  ))
                : stats.map((item, idx) => (
                    <StatCard
                      key={idx}
                      icon={icons[item.type] || <FaWallet />}
                      label={item.label}
                      value={item.value}
                      trend={item.trend}
                      gradient={gradients[item.color] || "from-gray-400 to-gray-500"}
                      bgTrack={bgTracks[item.color] || "bg-gray-200"}
                      progressWidth="w-3/4"
                    />
                  ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-between gap-3 mt-6">
              {actions.map((action) => (
           <Link to={action.link}>    <button key={action.label} className={`flex-1 min-w-[100px] max-w-[120px] flex flex-col items-center justify-center p-1 rounded-2xl shadow-2xl text-white font-semibold transition ${action.bg} ${action.hoverBg}`}>
                  <div className="text-xl mb-1">{action.icon}</div>
                  <span className="text-sm">{action.label}</span>
                </button></Link>
              ))}
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-3 gap-6">
              <TradingViewWidget />
              <div className="hidden md:block">
                <ChartCard title="Portfolio Allocation">
                  <div className="flex flex-col items-center space-y-4">
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={portfolioData} dataKey="value" nameKey="name" outerRadius={70} innerRadius={40}>
                          {portfolioData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="w-full space-y-2">
                      {portfolioData.map((asset, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <p className="text-sm font-medium text-gray-300">{asset.name} ({asset.value}%)</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ChartCard>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-gradient-to-br from-[#0f111b] to-[#0b0e17] p-4 md:p-6 rounded-2xl shadow-2xl border border-white/5 max-w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                <Link to="/history"> <h2 className="text-white font-semibold text-base md:text-lg flex items-center gap-2">📜 Recent Transactions ...see more</h2></Link>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">Latest account activity & movements</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Live</span>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-gray-300 table-fixed">
                  <thead>
                    <tr className="border-b border-gray-700/60 text-gray-400 uppercase tracking-wide">
                      <th className="p-2 md:p-3">ID</th>
                      <th className="p-2 md:p-3">Type</th>
                      <th className="p-2 md:p-3">Amount</th>
                      <th className="p-2 md:p-3 hidden md:table-cell">Date</th>
                      <th className="p-2 md:p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTransactions
                      ? Array(3).fill(0).map((_, idx) => (
                          <tr key={idx} className="animate-pulse border-b border-gray-800 h-10">
                            <td colSpan={5} className="h-8 bg-gray-500/20 rounded" />
                          </tr>
                        ))
                      : transactions.map((tx) => (
                          <tr key={tx.id} className="border-b border-gray-800 hover:bg-white/5 transition">
                            <td className="p-2 md:p-3 font-mono text-gray-400">#{tx.id}</td>
                            <td className="p-2 md:p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === "Deposit" ? "bg-green-500/10 text-green-400" : tx.type === "Withdraw" ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"}`}>{tx.type}</span>
                            </td>
                            <td className="p-2 md:p-3 font-semibold text-white">{tx.amount}</td>
                            <td className="p-2 md:p-3 text-gray-400 hidden md:table-cell">{tx.date}</td>
                            <td className="p-2 md:p-3 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === "Completed" ? "bg-green-500/10 text-green-400" : tx.status === "Pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>{tx.status}</span>
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

// ------------------------
// Stat Card Component
// ------------------------
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, gradient, bgTrack, progressWidth }) => (
  <div className="bg-[#0f111b] rounded-2xl shadow-xl p-5 flex flex-col justify-between transition hover:shadow-2xl">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full bg-gradient-to-br ${gradient} text-white text-2xl flex items-center justify-center`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-400 font-semibold">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      <span className={`font-semibold text-sm ${trend.startsWith("▼") ? "text-red-500" : "text-green-500"}`}>{trend}</span>
    </div>
    <div className={`h-2 w-full ${bgTrack} rounded-full mt-3`}>
      <div className={`h-2 ${progressWidth} bg-gradient-to-br ${gradient} rounded-full`}></div>
    </div>
  </div>
);

// ------------------------
// Chart Card Component
// ------------------------
const ChartCard: React.FC<ChartCardProps> = ({ title, children, className }) => (
  <div className={`bg-[#0f111b] rounded-2xl p-4 shadow-xl ${className}`}>
    <h2 className="text-white font-medium mb-3">{title}</h2>
    {children}
  </div>
);

export default Dashboard;