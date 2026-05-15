import { useState, useEffect, useRef, ReactNode, useCallback } from "react";
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
  FaCircle,
} from "react-icons/fa";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
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

interface CryptoAssetData {
  name: string;
  symbol: string;
  price: string;
  rawPrice: number;
  change: string;
  isUp: boolean;
  icon: string;
  color: string;
  data: { value: number }[];
  tvSymbol: string;
  prevPrice?: number;
  flash?: "up" | "down" | null;
}

// Binance stream symbols for live ticks
const BINANCE_SYMBOLS: Record<string, string> = {
  btc: "btcusdt",
  eth: "ethusdt",
  sol: "solusdt",
  bnb: "bnbusdt",
  ada: "adausdt",
  xrp: "xrpusdt",
  doge: "dogeusdt",
};

// CoinGecko ID → symbol map
const COINGECKO_IDS = "bitcoin,ethereum,solana,binancecoin,cardano,ripple,dogecoin";

const portfolioWeights: Record<string, number> = {
  btc: 0.55,
  eth: 0.25,
  sol: 0.10,
  ada: 0.10,
};

const COLORS = ["#F7931A", "#627EEA", "#00FFA3", "#FF2D55"];

const actions = [
  { label: "Deposit", icon: <FaUniversity />, bg: "bg-[#0a1120]", hoverBg: "hover:bg-[#00C4B4]", link: "/wallets/deposit" },
  { label: "Withdraw", icon: <FaArrowUp />, bg: "bg-[#0a1120]", hoverBg: "hover:bg-[#00C4B4]", link: "/withdrawal" },
  { label: "Connect Wallet", icon: <FaExchangeAlt />, bg: "bg-[#0a1120]", hoverBg: "hover:bg-blue-600", link: "/connect_wallet" },
];

const SPARKLINE_MAX = 30; // rolling window for sparkline

// ------------------------
// Hook: Binance Multi-stream WebSocket
// ------------------------
function useBinanceLivePrices(symbols: string[], onTick: (symbol: string, price: number) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (symbols.length === 0) return;

    const streams = symbols.map(s => `${s}@trade`).join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.data && msg.data.s && msg.data.p) {
            const symbol = msg.data.s.toLowerCase().replace("usdt", "");
            const price = parseFloat(msg.data.p);
            onTickRef.current(symbol, price);
          }
        } catch {}
      };

      ws.onclose = () => {
        // Reconnect after 3s on unexpected close
        setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) connect();
        }, 3000);
      };
    };

    connect();

    return () => {
      wsRef.current?.close();
    };
  }, [symbols.join(",")]);
}

// ------------------------
// Main Dashboard Component
// ------------------------
const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName] = useState(localStorage.getItem("user_name") || "");
  const [uid] = useState(localStorage.getItem("user_id") || "");

  const [stats, setStats] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [newTxIds, setNewTxIds] = useState<Set<number>>(new Set());
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cryptoData, setCryptoData] = useState<CryptoAssetData[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState("BINANCE:BTCUSDT");
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);
  const [selectedAssetName, setSelectedAssetName] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [portfolioData, setPortfolioData] = useState([
    { name: "BTC", value: 55 },
    { name: "ETH", value: 25 },
    { name: "SOL", value: 10 },
    { name: "ADA", value: 10 },
  ]);

  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const sparklineBuffers = useRef<Record<string, number[]>>({});

  // ------------------------
  // Live price tick handler
  // ------------------------
  const handlePriceTick = useCallback((symbol: string, price: number) => {
    setWsConnected(true);
    setLastUpdated(new Date());

    setCryptoData(prev => {
      const idx = prev.findIndex(c => c.symbol === symbol);
      if (idx === -1) return prev;

      const asset = prev[idx];
      const prevPrice = asset.rawPrice;
      const direction = price > prevPrice ? "up" : price < prevPrice ? "down" : null;

      // Update sparkline buffer
      if (!sparklineBuffers.current[symbol]) {
        sparklineBuffers.current[symbol] = asset.data.map(d => d.value);
      }
      sparklineBuffers.current[symbol].push(price);
      if (sparklineBuffers.current[symbol].length > SPARKLINE_MAX) {
        sparklineBuffers.current[symbol].shift();
      }

      const updated = [...prev];
      updated[idx] = {
        ...asset,
        rawPrice: price,
        price: formatPrice(price, symbol),
        prevPrice,
        flash: direction,
        data: sparklineBuffers.current[symbol].map(v => ({ value: v })),
      };

      // Clear flash after 600ms
      if (direction) {
        clearTimeout(flashTimers.current[symbol]);
        flashTimers.current[symbol] = setTimeout(() => {
          setCryptoData(d => {
            const i = d.findIndex(c => c.symbol === symbol);
            if (i === -1) return d;
            const copy = [...d];
            copy[i] = { ...copy[i], flash: null };
            return copy;
          });
        }, 600);
      }

      return updated;
    });
  }, []);

  const binanceSymbols = Object.values(BINANCE_SYMBOLS);
  useBinanceLivePrices(binanceSymbols, handlePriceTick);

  // ------------------------
  // Initial data from CoinGecko
  // ------------------------
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINGECKO_IDS}&order=market_cap_desc&per_page=7&page=1&sparkline=true`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted: CryptoAssetData[] = data.map(coin => {
            const sparkline = coin.sparkline_in_7d?.price?.slice(-SPARKLINE_MAX) ?? [];
            sparklineBuffers.current[coin.symbol] = [...sparkline];
            return {
              name: coin.name,
              symbol: coin.symbol,
              rawPrice: coin.current_price,
              price: formatPrice(coin.current_price, coin.symbol),
              change: coin.price_change_percentage_24h?.toFixed(2) ?? "0.00",
              isUp: (coin.price_change_percentage_24h ?? 0) > 0,
              icon: coin.image,
              color: coin.symbol === "btc" ? "#F7931A" : coin.symbol === "eth" ? "#627EEA" : "#14F195",
              data: sparkline.map((p: number) => ({ value: p })),
              tvSymbol: `BINANCE:${coin.symbol.toUpperCase()}USDT`,
              flash: null,
            };
          });
          setCryptoData(formatted);
        }
      } catch (err) {
        console.error("Error fetching crypto data:", err);
      }
    };

    fetchCryptoData();
  }, []);

  // ------------------------
  // Portfolio allocation weights by live market cap proxy
  // ------------------------
  useEffect(() => {
    if (cryptoData.length === 0) return;
    const tracked = cryptoData.filter(c => portfolioWeights[c.symbol]);
    const weightedPrices = tracked.map(c => ({
      name: c.symbol.toUpperCase(),
      value: Math.round((portfolioWeights[c.symbol] ?? 0) * 100),
    }));
    if (weightedPrices.length > 0) setPortfolioData(weightedPrices);
  }, [cryptoData.map(c => c.rawPrice).join(",")]);

  // ------------------------
  // Fetch dashboard stats + transactions
  // ------------------------
  useEffect(() => {
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

        // Detect new transactions on polling refresh
        if (Array.isArray(data.transactions)) {
          setTransactions(prev => {
            const prevIds = new Set(prev.map(t => t.id));
            const incoming = data.transactions as Transaction[];
            const newIds = incoming.filter(t => !prevIds.has(t.id)).map(t => t.id);
            if (newIds.length > 0) {
              setNewTxIds(new Set(newIds));
              setTimeout(() => setNewTxIds(new Set()), 3000);
            }
            return incoming;
          });
        }
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
        if (data.success) setNotifications(data.notifications);
      } catch {}
    };

    fetchDashboard();
    fetchNotifications();

    // Poll transactions every 30s
    const txInterval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(txInterval);
  }, [uid]);

  // ------------------------
  // Helpers
  // ------------------------
  const gradients: Record<string, string> = {
    yellow: "from-yellow-400 to-yellow-500",
    green: "from-green-400 to-green-500",
    purple: "from-purple-500 to-pink-500",
    indigo: "from-indigo-500 to-blue-500",
  };
  const bgTracks: Record<string, string> = {
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

  const unreadCount = notifications.filter(n => n.notification_status === "unread").length;

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-gray-100 transition-colors duration-300">

        {sidebarOpen && (
          <div className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#0a0f1f] shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col lg:ml-64 pb-24 lg:pb-0">
          <TopBar title="Dashboard" onSidebarToggle={() => setSidebarOpen(true)} />

          <div className="p-6 space-y-6 mt-16">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold"><b>Welcome Back:</b> {userName || "Loading..."}</h2>

              {/* Live connection badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-[#0a1120] text-xs font-medium">
                <FaCircle className={`text-[8px] ${wsConnected ? "text-green-400 animate-pulse" : "text-yellow-400"}`} />
                <span className="text-gray-300">
                  {wsConnected
                    ? lastUpdated
                      ? `Live · ${lastUpdated.toLocaleTimeString()}`
                      : "Connected"
                    : "Connecting..."}
                </span>
              </div>
            </div>

            {/* Mobile wallet stats */}
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

            {/* Desktop stat cards */}
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
                <Link key={action.label} to={action.link} className="flex-1">
                  <button className={`w-full flex flex-col items-center justify-center py-4 rounded-2xl shadow-lg text-white font-bold transition transform hover:scale-105 active:scale-95 ${action.bg} ${action.hoverBg} border border-white/10`}>
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <span className="text-xs uppercase tracking-wider">{action.label}</span>
                  </button>
                </Link>
              ))}
            </div>

            {/* Main section */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Asset List with live prices */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Assets</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : "Loading..."}
                    </span>
                    <span className="text-sm text-blue-600 font-medium cursor-pointer hover:underline">See all</span>
                  </div>
                </div>
                <div className="grid gap-3">
                  {cryptoData.length === 0
                    ? Array(7).fill(0).map((_, i) => (
                        <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-2xl" />
                      ))
                    : cryptoData.map((asset) => (
                        <div
                          key={asset.symbol}
                          onClick={() => {
                            setSelectedSymbol(asset.tvSymbol);
                            setSelectedAssetName(asset.name);
                            setIsChartModalOpen(true);
                          }}
                          className={`transition-all duration-200 rounded-2xl ${
                            asset.flash === "up"
                              ? "ring-1 ring-green-400/50 bg-green-400/5"
                              : asset.flash === "down"
                              ? "ring-1 ring-red-400/50 bg-red-400/5"
                              : ""
                          }`}
                        >
                          {/* Price flash indicator on the asset row */}
                          <div className="relative">
                            <CryptoAsset {...asset} />
                            {asset.flash && (
                              <span
                                className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold animate-ping pointer-events-none ${
                                  asset.flash === "up" ? "text-green-400" : "text-red-400"
                                }`}
                              >
                                {asset.flash === "up" ? "▲" : "▼"}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              {/* Portfolio allocation */}
              <div className="space-y-8">
                <div className="hidden lg:block">
                  <ChartCard title="Portfolio Allocation">
                    <div className="flex flex-col items-center space-y-4">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie
                            data={portfolioData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={70}
                            innerRadius={40}
                            animationBegin={0}
                            animationDuration={300}
                          >
                            {portfolioData.map((_, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "#0f111b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                            labelStyle={{ color: "#fff" }}
                            formatter={(value: any) => [`${value}%`, ""]}
                          />
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

                {/* Live price ticker mini panel */}
                <div className="hidden lg:block">
                  <ChartCard title="🔴 Live Prices">
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-700">
                      {cryptoData.slice(0, 5).map((asset) => (
                        <div
                          key={asset.symbol}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ${
                            asset.flash === "up"
                              ? "bg-green-500/10"
                              : asset.flash === "down"
                              ? "bg-red-500/10"
                              : "bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <img src={asset.icon} alt={asset.name} className="w-5 h-5 rounded-full" />
                            <span className="text-xs font-bold text-gray-300 uppercase">{asset.symbol}</span>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-mono font-bold transition-colors duration-200 ${
                              asset.flash === "up" ? "text-green-400" : asset.flash === "down" ? "text-red-400" : "text-white"
                            }`}>
                              ${asset.price}
                            </p>
                            <p className={`text-[10px] font-medium ${asset.isUp ? "text-green-400" : "text-red-400"}`}>
                              {asset.isUp ? "▲" : "▼"} {Math.abs(parseFloat(asset.change))}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ChartCard>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-gradient-to-br from-[#0f111b] to-[#0b0e17] p-4 md:p-6 rounded-2xl shadow-2xl border border-white/5 max-w-full">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Link to="/history">
                    <h2 className="text-white font-semibold text-base md:text-lg flex items-center gap-2">
                      📜 Recent Transactions ...see more
                    </h2>
                  </Link>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">Latest account activity & movements</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Polls every 30s</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                    <FaCircle className="text-[6px] animate-pulse" /> Live
                  </span>
                </div>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-sm text-gray-300 table-fixed">
                  <thead>
                    <tr className="border-b border-gray-700/60 text-gray-400 uppercase tracking-wide text-xs">
                      <th className="p-2 md:p-3 text-left">ID</th>
                      <th className="p-2 md:p-3 text-left">Type</th>
                      <th className="p-2 md:p-3 text-left">Amount</th>
                      <th className="p-2 md:p-3 text-left hidden md:table-cell">Date</th>
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
                          <tr
                            key={tx.id}
                            className={`border-b border-gray-800 transition-all duration-500 ${
                              newTxIds.has(tx.id)
                                ? "bg-green-500/10 ring-1 ring-inset ring-green-500/30"
                                : "hover:bg-white/5"
                            }`}
                          >
                            <td className="p-2 md:p-3 font-mono text-gray-400">
                              #{tx.id}
                              {newTxIds.has(tx.id) && (
                                <span className="ml-1 text-[10px] text-green-400 font-bold uppercase">new</span>
                              )}
                            </td>
                            <td className="p-2 md:p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tx.type === "Deposit"
                                  ? "bg-green-500/10 text-green-400"
                                  : tx.type === "Withdraw"
                                  ? "bg-red-500/10 text-red-400"
                                  : "bg-blue-500/10 text-blue-400"
                              }`}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="p-2 md:p-3 font-semibold text-white">{tx.amount}</td>
                            <td className="p-2 md:p-3 text-gray-400 hidden md:table-cell">{tx.date}</td>
                            <td className="p-2 md:p-3 text-right">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                tx.status === "Completed"
                                  ? "bg-green-500/10 text-green-400"
                                  : tx.status === "Pending"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-red-500/10 text-red-400"
                              }`}>
                                {tx.status}
                              </span>
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
// Price formatter
// ------------------------
function formatPrice(price: number, symbol: string): string {
  if (["xrp", "ada", "doge"].includes(symbol)) {
    return price.toFixed(4);
  }
  if (price >= 1000) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toFixed(2);
}

// ------------------------
// Stat Card Component
// ------------------------
const StatCard: React.FC<StatCardProps> = ({ icon, label, value, trend, gradient, bgTrack, progressWidth }) => (
  <div className="bg-[#0f111b] rounded-2xl shadow-xl p-5 flex flex-col justify-between transition hover:shadow-2xl border border-white/5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-full bg-gradient-to-br ${gradient} text-white text-2xl flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-400 font-semibold">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </div>
      <span className={`font-semibold text-sm ${trend.startsWith("▼") ? "text-red-500" : "text-green-500"}`}>{trend}</span>
    </div>
    <div className={`h-2 w-full ${bgTrack} rounded-full mt-3`}>
      <div className={`h-2 ${progressWidth} bg-gradient-to-br ${gradient} rounded-full`} />
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