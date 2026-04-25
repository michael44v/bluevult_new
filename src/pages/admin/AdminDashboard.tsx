import {
  FaUsers,
  FaIdCard,
  FaExchangeAlt,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import AdminSidebar from "./components/AdminSidebar";
import { Skeleton } from "@/components/ui/skeleton";
<<<<<<< HEAD
import {
  useDashboardStats,
  useTransactions,
  useWithdrawals,
  useKYCSubmissions,
  useUpdateTransactionStatus,
  useRevenue,
} from "@/hooks/useAdminData";
import { toast } from "sonner";
import { useMemo, useState } from "react";

/* ================= Utils ================= */
function fillLast7Days(chart: { date: string; value: number }[]) {
  const filled: { date: string; value: number }[] = [];
  const today = new Date();
  let lastValue = 0;

  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const dateStr = day.toISOString().slice(0, 10);
    const existing = chart.find((c) => c.date === dateStr);
    if (existing) lastValue = Number(existing.value);
    filled.push({ date: dateStr, value: lastValue });
  }

  return filled;
}

/* ================= Stat Card ================= */
const StatCard = ({
  icon,
  label,
  value,
  change,
  changeType,
  color,
  isLoading,
}: {
=======
import { 
  useDashboardStats, 
  useTransactions, 
  useWithdrawals,
  useKYCSubmissions,
  useUpdateTransactionStatus 
} from "@/hooks/useAdminData";
import { toast } from "sonner";

// Sample chart data (would be fetched from analytics endpoint in production)
const revenueData = [
  { date: "Jan 20", value: 45000 },
  { date: "Jan 21", value: 52000 },
  { date: "Jan 22", value: 48000 },
  { date: "Jan 23", value: 61000 },
  { date: "Jan 24", value: 55000 },
  { date: "Jan 25", value: 67000 },
  { date: "Jan 26", value: 72000 },
];

const StatCard = ({ icon, label, value, change, changeType, color, isLoading }: {
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  color: string;
  isLoading?: boolean;
}) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-200">
    <div className="flex items-center justify-between">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      {!isLoading && (
<<<<<<< HEAD
        <span
          className={`flex items-center gap-1 text-sm font-medium ${
            changeType === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
=======
        <span className={`flex items-center gap-1 text-sm font-medium ${changeType === "up" ? "text-green-500" : "text-red-500"}`}>
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
          {changeType === "up" ? <FaArrowUp /> : <FaArrowDown />}
          {change}
        </span>
      )}
    </div>
<<<<<<< HEAD

=======
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
    {isLoading ? (
      <Skeleton className="h-8 w-24 mt-4 mb-1" />
    ) : (
      <p className="text-2xl font-bold text-gray-900 mt-4">{value}</p>
    )}
<<<<<<< HEAD

    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

/* ================= Dashboard ================= */
const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: transactions } = useTransactions();
  const { data: withdrawals } = useWithdrawals();
  const { data: revenueRaw } = useRevenue();
  const { data: kycDataRaw } = useKYCSubmissions();
  const updateTransaction = useUpdateTransactionStatus();

  const statsData = stats?.data ?? {
    totalUsers: 0,
    pendingKYC: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
  };

  const userChangePercent = Math.min(statsData.totalUsers * 3, 300);

  /* ================= Revenue ================= */
  const revenueData = useMemo(() => {
    if (!revenueRaw || !Array.isArray(revenueRaw.data?.chart))
      return fillLast7Days([]);

    let cumulative = 0;
    const sorted = revenueRaw.data.chart
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item) => {
        cumulative += Number(item.value);
        return { date: item.date, value: cumulative };
      });

    return fillLast7Days(sorted);
  }, [revenueRaw]);

  /* ================= KYC ================= */
  const kycStatusData = useMemo(() => {
    if (!kycDataRaw?.data) {
      return [
        { name: "Approved", value: 0, color: "#22c55e" },
        { name: "Pending", value: 0, color: "#eab308" },
        { name: "Declined", value: 0, color: "#ef4444" },
      ];
    }

    const { approved, pending, declined } = kycDataRaw.data;

    return [
      { name: "Approved", value: approved, color: "#22c55e" },
      { name: "Pending", value: pending, color: "#eab308" },
      { name: "Declined", value: declined, color: "#ef4444" },
    ];
  }, [kycDataRaw]);
=======
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals();
  const { data: kycSubmissions } = useKYCSubmissions();
  const updateTransaction = useUpdateTransactionStatus();

  // Calculate KYC stats from real data
  const kycStatusData = (() => {
    if (!kycSubmissions || kycSubmissions.length === 0) {
      return [
        { name: "Approved", value: 65, color: "#22c55e" },
        { name: "Pending", value: 25, color: "#eab308" },
        { name: "Rejected", value: 10, color: "#ef4444" },
      ];
    }
    const total = kycSubmissions.length;
    const verified = kycSubmissions.filter(k => k.user?.kyc === "verified").length;
    const pending = kycSubmissions.filter(k => k.user?.kyc === "pending" || k.user?.kyc === "unverified").length;
    const rejected = kycSubmissions.filter(k => k.user?.kyc === "rejected").length;
    return [
      { name: "Approved", value: Math.round((verified / total) * 100) || 0, color: "#22c55e" },
      { name: "Pending", value: Math.round((pending / total) * 100) || 0, color: "#eab308" },
      { name: "Rejected", value: Math.round((rejected / total) * 100) || 0, color: "#ef4444" },
    ];
  })();

  // Get recent activity from transactions
  const recentActivity = (transactions || []).slice(0, 5).map((t) => ({
    id: t.trans_id,
    action: t.trans_type === "deposit" ? "Deposit received" : 
            t.trans_type === "withdrawal" ? (t.trans_stat === "approved" ? "Withdrawal approved" : "Withdrawal requested") :
            "Transaction",
    user: t.user?.user_email || `User #${t.user_id}`,
    amount: `${t.trans_amt} ${t.crypto}`,
    time: new Date(t.trans_time).toLocaleString(),
    type: t.trans_type,
  }));

  // Get pending withdrawals
  const pendingWithdrawals = (withdrawals || [])
    .filter(w => w.trans_stat === "pending")
    .slice(0, 5)
    .map((w) => ({
      id: w.trans_id,
      user: w.user?.user_email || `User #${w.user_id}`,
      amount: `${w.trans_amt} ${w.crypto}`,
      method: w.crypto === "BTC" || w.crypto === "ETH" ? "Crypto" : "Bank Transfer",
      status: w.trans_stat,
    }));

  const handleApproveWithdrawal = (transId: number) => {
    updateTransaction.mutate(
      { transId, status: "approved" },
      {
        onSuccess: () => toast.success("Withdrawal approved"),
        onError: () => toast.error("Failed to approve withdrawal"),
      }
    );
  };

  const handleRejectWithdrawal = (transId: number) => {
    updateTransaction.mutate(
      { transId, status: "rejected" },
      {
        onSuccess: () => toast.success("Withdrawal rejected"),
        onError: () => toast.error("Failed to reject withdrawal"),
      }
    );
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  /* ================= Layout ================= */
  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-50">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <AdminSidebar />
      </aside>

      {/* Main */}
      <main className="md:ml-64 p-4 md:p-6 space-y-6">

        {/* Mobile header */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 border rounded-lg bg-white"
          >
            ☰
          </button>
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
        </div>

        {/* Desktop header */}
        <h1 className="hidden md:block text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<FaUsers className="text-xl text-blue-400" />}
            label="Total Users"
            value={statsData.totalUsers.toLocaleString()}
            change={`${userChangePercent}%`}
            changeType="up"
            color="bg-blue-500/20"
            isLoading={statsLoading}
          />
          <StatCard
            icon={<FaIdCard className="text-xl text-yellow-400" />}
            label="Pending KYC"
            value={statsData.pendingKYC.toString()}
            change="+5.2%"
            changeType="up"
            color="bg-yellow-500/20"
            isLoading={statsLoading}
          />
          <StatCard
            icon={<FaExchangeAlt className="text-xl text-green-400" />}
            label="Total Deposits"
            value={formatCurrency(statsData.totalDeposits)}
            change="+18.3%"
            changeType="up"
            color="bg-green-500/20"
            isLoading={statsLoading}
          />
          <StatCard
            icon={<FaWallet className="text-xl text-purple-400" />}
            label="Pending Withdrawals"
            value={statsData.pendingWithdrawals.toString()}
            change="-2.1%"
            changeType="down"
=======
    <div className="flex min-h-screen">
      <AdminSidebar />

      <main className="flex-1 bg-gray-50 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            icon={<FaUsers className="text-xl text-blue-400" />} 
            label="Total Users" 
            value={stats?.totalUsers?.toLocaleString() || "0"} 
            change="+12.5%" 
            changeType="up" 
            color="bg-blue-500/20"
            isLoading={statsLoading}
          />
          <StatCard 
            icon={<FaIdCard className="text-xl text-yellow-400" />} 
            label="Pending KYC" 
            value={stats?.pendingKYC?.toString() || "0"} 
            change="+5.2%" 
            changeType="up" 
            color="bg-yellow-500/20"
            isLoading={statsLoading}
          />
          <StatCard 
            icon={<FaExchangeAlt className="text-xl text-green-400" />} 
            label="Total Deposits" 
            value={formatCurrency(stats?.totalDeposits || 0)} 
            change="+18.3%" 
            changeType="up" 
            color="bg-green-500/20"
            isLoading={statsLoading}
          />
          <StatCard 
            icon={<FaWallet className="text-xl text-purple-400" />} 
            label="Pending Withdrawals" 
            value={stats?.pendingWithdrawals?.toString() || "0"} 
            change="-2.1%" 
            changeType="down" 
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
            color="bg-purple-500/20"
            isLoading={statsLoading}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border">
            <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={revenueData}>
<<<<<<< HEAD
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  fill="#22c55e33"
                />
=======
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#374151" fontSize={12} />
                <YAxis stroke="#374151" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8 }} 
                  labelStyle={{ color: "#111827" }} 
                  formatter={(val: number) => [`$${val.toLocaleString()}`, "Revenue"]} 
                />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#colorRevenue)" strokeWidth={2} />
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
              </AreaChart>
            </ResponsiveContainer>
          </div>

<<<<<<< HEAD
         <div className="bg-white rounded-2xl p-6 border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Status</h3>
  <ResponsiveContainer width="100%" height={180}>
    <PieChart>
      <Pie
        data={kycStatusData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={70}
        innerRadius={45}
      >
        {kycStatusData.map((entry, index) => (
          <Cell key={index} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8 }}
        labelStyle={{ color: "#111827" }}
      />
    </PieChart>
  </ResponsiveContainer>
  <div className="space-y-2 mt-4">
    {kycStatusData.map((item) => (
      <div key={item.name} className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-gray-700">{item.name}</span>
=======
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={kycStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={45}>
                  {kycStatusData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb", borderRadius: 8 }} 
                  labelStyle={{ color: "#111827" }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-4">
              {kycStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
        </div>
        <span className="font-medium text-gray-900">{item.value}</span>
      </div>
    ))}
  </div>
</div>

<<<<<<< HEAD
=======
        {/* Activity & Withdrawals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === "deposit" ? "bg-green-500/20 text-green-400" :
                        activity.type === "withdrawal" ? "bg-purple-500/20 text-purple-400" :
                        "bg-blue-500/20 text-blue-400"
                      }`}>
                        <FaExchangeAlt />
                      </div>
                      <div>
                        <p className="text-gray-900 text-sm">{activity.action}</p>
                        <p className="text-gray-600 text-xs">{activity.user}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 text-sm font-medium">{activity.amount}</p>
                      <p className="flex items-center gap-1 text-gray-600 text-xs">
                        <FaClock className="text-xs" />{activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Withdrawals</h3>
            {withdrawalsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingWithdrawals.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending withdrawals</p>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div>
                      <p className="text-gray-900 text-sm">{withdrawal.user}</p>
                      <p className="text-gray-600 text-xs">{withdrawal.method}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-gray-900 text-sm font-medium">{withdrawal.amount}</p>
                      <div className="flex gap-2 mt-1">
                        <button 
                          onClick={() => handleApproveWithdrawal(withdrawal.id)}
                          disabled={updateTransaction.isPending}
                          className="p-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition disabled:opacity-50"
                        >
                          <FaCheckCircle />
                        </button>
                        <button 
                          onClick={() => handleRejectWithdrawal(withdrawal.id)}
                          disabled={updateTransaction.isPending}
                          className="p-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition disabled:opacity-50"
                        >
                          <FaTimesCircle />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
