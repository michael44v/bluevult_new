import { useState, useEffect, ReactNode } from "react";
import Sidebar from "./dashboardWidgets/Sidebar";
import TradingViewWidget from "./dashboardWidgets/bitcoinChart";
import Footer from "@/components/landing/Footer";
import CryptoAsset from "@/components/dashboard/CryptoAsset";
import TopBar from "@/components/dashboard/TopBar";

import { Link, useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem("user_name") || "");
  const [uid] = useState(localStorage.getItem("user_id") || "");

  const [stats, setStats] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cryptoData, setCryptoData] = useState<any[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedAssetName, setSelectedAssetName] = useState("");

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

    const fetchNotifications = async () => {
      try {
        const res = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "get_notifications", uid }),
        });
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications);
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    const fetchCryptoData = async () => {
        try {
            const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,cardano,ripple,dogecoin&order=market_cap_desc&per_page=7&page=1&sparkline=true");
            const data = await res.json();
            if (Array.isArray(data)) {
                setCryptoData(data.map(coin => ({
                    name: coin.name,
                    symbol: coin.symbol,
                    price: coin.current_price.toLocaleString(),
                    change: coin.price_change_percentage_24h.toFixed(2),
                    isUp: coin.price_change_percentage_24h > 0,
                    icon: coin.image,
                    color: coin.symbol === 'btc' ? '#F7931A' : coin.symbol === 'eth' ? '#627EEA' : '#14F195',
                    data: coin.sparkline_in_7d.price.slice(-20).map((p: number) => ({ value: p })),
                    tvSymbol: `BINANCE:${coin.symbol.toUpperCase()}USDT`
                })));
            }
        } catch (err) {
            console.error("Error fetching crypto data:", err);
        }
    }

    fetchDashboard();
    fetchNotifications();
    fetchCryptoData();

    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
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
  const icons: Record<string, ReactNode> = {
    BTC: <FaBitcoin />,
    USD: <FaDollarSign />,
    Growth: <FaChartLine />,
    Assets: <FaWallet />,
  };

  const toggleDark = () => {
    const newDark = !dark;
    setDark(newDark);
    document.documentElement.classList.toggle("dark", newDark);
    localStorage.setItem("theme", newDark ? "dark" : "light");
  };

  const markNotificationsSeen = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && notifications.some(n => n.is_notified === 0)) {
       await fetch("https://bluevult.com/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "mark_notifications_seen", uid }),
      });
    }
  };

  const unreadCount = notifications.filter(n => n.notification_status === 'unread').length;

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-gray-100 transition-colors duration-300">

        {/* Mobile overlay */}
        {sidebarOpen && <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0a0f1f] shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:ml-64 pb-24 lg:pb-0">

          {/* Topbar */}
          <TopBar title="Dashboard" onSidebarToggle={() => setSidebarOpen(true)} />

          {/* Main dashboard content */}
          <div className="p-6 space-y-6 mt-16">
            <h2 className="text-xl font-bold"><b>Welcome Back: </b> {userName || "Loading..."}</h2>

            {/* Wallet + Portfolio Stats */}
            <div className="lg:hidden">
              <div className="bg-white dark:bg-[#0a1120] rounded-2xl shadow-lg p-5 border border-gray-100 dark:border-gray-800">
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
                      gradient={(gradients as any)[item.color] || "from-gray-400 to-gray-500"}
                      bgTrack={(bgTracks as any)[item.color] || "bg-gray-200"}
                      progressWidth="w-3/4"
                    />
                  ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap justify-between gap-3 mt-6">
              {actions.map((action) => (
                <Link key={action.label} to={action.link} className="flex-1">
                  <button className={`w-full flex flex-col items-center justify-center py-4 rounded-2xl shadow-lg text-white font-bold transition transform hover:scale-105 active:scale-95 ${action.bg} ${action.hoverBg} border border-white/10`}>
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <span className="text-xs uppercase tracking-wider">{action.label}</span>
                  </button>
                </Link>
              ))}
            </div>

            {/* Main Section */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Asset List (Trust Wallet Style) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assets</h2>
                  <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">See all</span>
                </div>
                <div className="grid gap-3">
                  {cryptoData.length === 0 ? (
                    Array(7).fill(0).map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
                    ))
                  ) : (
                    cryptoData.map((asset) => (
                      <div key={asset.symbol} onClick={() => {
                        setSelectedSymbol(asset.tvSymbol);
                        setSelectedAssetName(asset.name);
                        setIsChartModalOpen(true);
                      }}>
                        <CryptoAsset {...asset} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Allocation & Sidebar Info */}
              <div className="space-y-8">
                <div className="hidden lg:block">
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

      {/* Chart Modal */}
      {isChartModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-5xl bg-white dark:bg-[#0f111b] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedAssetName} Price Chart</h3>
                <p className="text-xs text-gray-500">Live data from TradingView</p>
              </div>
              <button
                onClick={() => setIsChartModalOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <FaBars className="rotate-45" />
              </button>
            </div>
            <div className="p-2 md:p-6 bg-white dark:bg-[#0f111b]">
              <TradingViewWidget symbol={selectedSymbol} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ------------------------
// Stat Card Component
// ------------------------
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, gradient, bgTrack, progressWidth }) => (
  <div className="bg-[#0f111b] rounded-2xl shadow-xl p-5 flex flex-col justify-between transition hover:shadow-2xl border border-white/5">
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
  <div className={`bg-[#0f111b] rounded-2xl p-4 shadow-xl border border-white/5 ${className}`}>
    <h2 className="text-white font-medium mb-3">{title}</h2>
    {children}
  </div>
);

export default Dashboard;
