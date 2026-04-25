import AdminLayout from "./components/AdminLayout";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FaUsers, FaMoneyBillWave, FaExchangeAlt, FaChartLine, FaArrowUp, FaArrowDown } from "react-icons/fa";
import { useAnalyticsData } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

const AnalyticsAdmin: React.FC = () => {
  const { data: analytics, isLoading, error } = useAnalyticsData();

  // Fallback data for when API is not available
  const fallbackData = {
    userGrowth: [
      { month: "Aug", users: 8500 },
      { month: "Sep", users: 9200 },
      { month: "Oct", users: 10100 },
      { month: "Nov", users: 11200 },
      { month: "Dec", users: 12000 },
      { month: "Jan", users: 12847 },
    ],
    revenueData: [
      { month: "Aug", revenue: 180000 },
      { month: "Sep", revenue: 220000 },
      { month: "Oct", revenue: 195000 },
      { month: "Nov", revenue: 280000 },
      { month: "Dec", revenue: 320000 },
      { month: "Jan", revenue: 385000 },
    ],
    transactionVolume: [
      { day: "Mon", volume: 450000 },
      { day: "Tue", volume: 520000 },
      { day: "Wed", volume: 380000 },
      { day: "Thu", volume: 620000 },
      { day: "Fri", volume: 580000 },
      { day: "Sat", volume: 420000 },
      { day: "Sun", volume: 350000 },
    ],
    assetDistribution: [
      { name: "BTC", value: 45, color: "#f7931a" },
      { name: "ETH", value: 25, color: "#627eea" },
      { name: "USDT", value: 20, color: "#26a17b" },
      { name: "Others", value: 10, color: "#6b7280" },
    ],
    topCountries: [
      { country: "United States", users: 3200, percentage: 25 },
      { country: "United Kingdom", users: 1800, percentage: 14 },
      { country: "Germany", users: 1500, percentage: 12 },
      { country: "Nigeria", users: 1200, percentage: 9 },
      { country: "Canada", users: 1000, percentage: 8 },
    ],
    stats: {
      monthlyActiveUsers: 8432,
      monthlyRevenue: 385000,
      weeklyVolume: 3320000,
      conversionRate: 12.4,
      mauChange: 15.3,
      revenueChange: 20.3,
      volumeChange: 8.7,
      conversionChange: -1.2,
    },
  };

  const data = analytics || fallbackData;

  if (isLoading) {
    return (
      <AdminLayout title="Analytics">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64 bg-[#1a1d2a]" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array(4).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-24 bg-[#1a1d2a]" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 bg-[#1a1d2a]" />
            <Skeleton className="h-80 bg-[#1a1d2a]" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>
          <p className="text-gray-400">Comprehensive overview of platform performance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FaUsers className="text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Monthly Active Users</p>
                <p className="text-xl font-bold text-white">{data.stats.monthlyActiveUsers.toLocaleString()}</p>
                <span className={`text-xs flex items-center gap-1 ${data.stats.mauChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.stats.mauChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {data.stats.mauChange >= 0 ? "+" : ""}{data.stats.mauChange}%
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <FaMoneyBillWave className="text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Monthly Revenue</p>
                <p className="text-xl font-bold text-white">${(data.stats.monthlyRevenue / 1000).toFixed(0)}K</p>
                <span className={`text-xs flex items-center gap-1 ${data.stats.revenueChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.stats.revenueChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {data.stats.revenueChange >= 0 ? "+" : ""}{data.stats.revenueChange}%
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <FaExchangeAlt className="text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Weekly Volume</p>
                <p className="text-xl font-bold text-white">${(data.stats.weeklyVolume / 1000000).toFixed(2)}M</p>
                <span className={`text-xs flex items-center gap-1 ${data.stats.volumeChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.stats.volumeChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {data.stats.volumeChange >= 0 ? "+" : ""}{data.stats.volumeChange}%
                </span>
              </div>
            </div>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-500/20 rounded-xl">
                <FaChartLine className="text-yellow-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Conversion Rate</p>
                <p className="text-xl font-bold text-white">{data.stats.conversionRate}%</p>
                <span className={`text-xs flex items-center gap-1 ${data.stats.conversionChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {data.stats.conversionChange >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                  {data.stats.conversionChange}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth */}
          <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1d2a", border: "1px solid #374151", borderRadius: "8px" }} />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="url(#colorUsers)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Growth */}
          <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Growth</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1d2a", border: "1px solid #374151", borderRadius: "8px" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Volume */}
          <div className="lg:col-span-2 bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Transaction Volume</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.transactionVolume}>
                <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: "#1a1d2a", border: "1px solid #374151", borderRadius: "8px" }} formatter={(value: number) => [`$${value.toLocaleString()}`, "Volume"]} />
                <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Asset Distribution */}
          <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Asset Distribution</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data.assetDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={45}>
                  {data.assetDistribution.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#1a1d2a", border: "1px solid #374151", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {data.assetDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-white font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Top Countries by Users</h3>
          <div className="space-y-4">
            {data.topCountries.map((country) => (
              <div key={country.country} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white">{country.country}</span>
                    <span className="text-gray-400 text-sm">{country.users.toLocaleString()} users ({country.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full">
                    <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${country.percentage * 4}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsAdmin;