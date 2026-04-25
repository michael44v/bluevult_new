import AdminLayout from "./components/AdminLayout";
import { FaBitcoin, FaEthereum, FaDollarSign, FaWallet, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { SiTether, SiBinance } from "react-icons/si";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { usePlatformWallets, useWalletMovements, useWalletBalanceHistory } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

const WalletsAdmin: React.FC = () => {
  const { data: wallets = [], isLoading: walletsLoading } = usePlatformWallets();
  const { data: movements = [], isLoading: movementsLoading } = useWalletMovements();
  const { data: balanceHistory = [], isLoading: historyLoading } = useWalletBalanceHistory();

  // Fallback data
  const fallbackWallets = [
    { wallet_id: 1, name: "Bitcoin", symbol: "BTC", balance: "45.234 BTC", usd_value: 2845230, address: "bc1q...platform1", change_24h: 2.4 },
    { wallet_id: 2, name: "Ethereum", symbol: "ETH", balance: "892.45 ETH", usd_value: 1523450, address: "0x...platform2", change_24h: 1.8 },
    { wallet_id: 3, name: "USDT", symbol: "USDT", balance: "1,250,000 USDT", usd_value: 1250000, address: "T...platform3", change_24h: 0 },
    { wallet_id: 4, name: "BNB", symbol: "BNB", balance: "3,450 BNB", usd_value: 892340, address: "bnb...platform4", change_24h: -0.5 },
    { wallet_id: 5, name: "USD Reserve", symbol: "USD", balance: "$2,500,000", usd_value: 2500000, address: "Bank Account ****4521", change_24h: 0 },
  ];

  const fallbackHistory = [
    { date: "Jan 20", btc: 42.5, eth: 850, usdt: 1100000 },
    { date: "Jan 21", btc: 43.2, eth: 865, usdt: 1150000 },
    { date: "Jan 22", btc: 44.1, eth: 870, usdt: 1180000 },
    { date: "Jan 23", btc: 44.8, eth: 880, usdt: 1200000 },
    { date: "Jan 24", btc: 45.0, eth: 888, usdt: 1220000 },
    { date: "Jan 25", btc: 45.1, eth: 890, usdt: 1240000 },
    { date: "Jan 26", btc: 45.2, eth: 892, usdt: 1250000 },
  ];

  const fallbackMovements = [
    { movement_id: 1, type: "in" as const, asset: "BTC", amount: "+0.5 BTC", source: "User Deposit", created_at: "2 hours ago" },
    { movement_id: 2, type: "out" as const, asset: "ETH", amount: "-2.3 ETH", source: "Withdrawal", created_at: "4 hours ago" },
    { movement_id: 3, type: "in" as const, asset: "USDT", amount: "+50,000 USDT", source: "User Deposit", created_at: "6 hours ago" },
    { movement_id: 4, type: "out" as const, asset: "BTC", amount: "-0.25 BTC", source: "Withdrawal", created_at: "8 hours ago" },
    { movement_id: 5, type: "in" as const, asset: "ETH", amount: "+5.0 ETH", source: "User Deposit", created_at: "12 hours ago" },
  ];

  const displayWallets = wallets.length > 0 ? wallets : fallbackWallets;
  const displayHistory = balanceHistory.length > 0 ? balanceHistory : fallbackHistory;
  const displayMovements = movements.length > 0 ? movements : fallbackMovements;

  const getWalletIcon = (symbol: string) => {
    switch (symbol) {
      case "BTC": return <FaBitcoin />;
      case "ETH": return <FaEthereum />;
      case "USDT": return <SiTether />;
      case "BNB": return <SiBinance />;
      default: return <FaDollarSign />;
    }
  };

  const getWalletColor = (symbol: string) => {
    switch (symbol) {
      case "BTC": return "bg-orange-500/20 text-orange-400";
      case "ETH": return "bg-blue-500/20 text-blue-400";
      case "USDT": return "bg-green-500/20 text-green-400";
      case "BNB": return "bg-yellow-500/20 text-yellow-400";
      default: return "bg-green-500/20 text-green-400";
    }
  };

  const totalUsdValue = displayWallets.reduce((acc, w) => acc + w.usd_value, 0);

  const formatTime = (time: string) => {
    if (time.includes("ago")) return time;
    return new Date(time).toLocaleString();
  };

  return (
    <AdminLayout title="Platform Wallets">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Wallet Balances</h2>
          <p className="text-gray-400">Monitor and manage platform-level cryptocurrency holdings</p>
        </div>

        {/* Total Balance Card */}
        <div className="bg-gradient-to-r from-[#1a1d2a] to-[#252836] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-500/20 rounded-xl">
              <FaWallet className="text-3xl text-green-400" />
            </div>
            <div>
              <p className="text-gray-400">Total Platform Balance</p>
              {walletsLoading ? (
                <Skeleton className="h-10 w-48 bg-gray-700" />
              ) : (
                <p className="text-4xl font-bold text-white">${totalUsdValue.toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>

        {/* Wallet Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {walletsLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-48 bg-[#1a1d2a]" />
            ))
          ) : (
            displayWallets.map((wallet) => (
              <div key={wallet.wallet_id} className="bg-[#1a1d2a] rounded-2xl p-5 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${getWalletColor(wallet.symbol)}`}>
                      {getWalletIcon(wallet.symbol)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{wallet.name}</p>
                      <p className="text-gray-400 text-sm">{wallet.symbol}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${wallet.change_24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {wallet.change_24h >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                    {wallet.change_24h >= 0 ? "+" : ""}{wallet.change_24h}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-2xl font-bold text-white">{wallet.balance}</p>
                    <p className="text-gray-400">≈ ${wallet.usd_value.toLocaleString()}</p>
                  </div>
                  <div className="pt-2 border-t border-gray-800">
                    <p className="text-xs text-gray-500">Address</p>
                    <p className="text-sm text-gray-400 font-mono truncate">{wallet.address}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Charts and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance History Chart */}
          <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">USDT Balance History</h3>
            {historyLoading ? (
              <Skeleton className="h-[250px] bg-gray-800" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={displayHistory}>
                  <defs>
                    <linearGradient id="colorUsdt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1d2a", border: "1px solid #374151", borderRadius: "8px" }}
                    labelStyle={{ color: "#fff" }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "USDT"]}
                  />
                  <Area type="monotone" dataKey="usdt" stroke="#22c55e" fill="url(#colorUsdt)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Movements */}
          <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Wallet Movements</h3>
            {movementsLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-14 bg-gray-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayMovements.map((movement) => (
                  <div key={movement.movement_id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${movement.type === "in" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {movement.type === "in" ? <FaArrowDown /> : <FaArrowUp />}
                      </div>
                      <div>
                        <p className="text-white font-medium">{movement.amount}</p>
                        <p className="text-gray-400 text-xs">{movement.source}</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{formatTime(movement.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default WalletsAdmin;