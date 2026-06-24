import { useState, useMemo } from "react";
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
import {
  useDashboardStats,
  useTransactions,
  useWithdrawals,
  useKYCSubmissions,
  useUpdateTransactionStatus,
  useRevenue,
} from "@/hooks/useAdminData";
import { toast } from "sonner";

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
        <span
          className={`flex items-center gap-1 text-sm font-medium ${
            changeType === "up" ? "text-green-500" : "text-red-500"
          }`}
        >
          {changeType === "up" ? <FaArrowUp /> : <FaArrowDown />}
          {change}
        </span>
      )}
    </div>
    {isLoading ? (
      <Skeleton className="h-8 w-24 mt-4 mb-1" />
    ) : (
      <p className="text-2xl font-bold text-gray-900 mt-4">{value}</p>
    )}
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);

/* ================= Dashboard ================= */
const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: transactions, isLoading: transactionsLoading } = useTransactions();
  const { data: withdrawals, isLoading: withdrawalsLoading } = useWithdrawals();
  const { data: revenueRaw } = useRevenue();
  const { data: kycDataRaw } = useKYCSubmissions();
  const updateTransaction = useUpdateTransactionStatus();

  const statsData = stats ?? {
    totalUsers: 0,
    pendingKYC: 0,
    totalDeposits: 0,
    pendingWithdrawals: 0,
  };

  /* ================= Revenue ================= */
  const revenueData = useMemo(() => {
    if (!revenueRaw || !Array.isArray(revenueRaw?.chart))
      return fillLast7Days([]);

    let cumulative = 0;
    const sorted = revenueRaw.chart
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item: any) => {
        cumulative += Number(item.value);
        return { date: item.date, value: cumulative };
      });

    return fillLast7Days(sorted);
  }, [revenueRaw]);

  /* ================= KYC ================= */
  const kycStatusData = useMemo(() => {
    if (!kycDataRaw) {
      return [
        { name: "Approved", value: 0, color: "#22c55e" },
        { name: "Pending", value: 0, color: "#eab308" },
        { name: "Declined", value: 0, color: "#ef4444" },
      ];
    }

    const { approved, pending, declined } = kycDataRaw;
    const total = approved + pending + declined || 1;

    return [
      { name: "Approved", value: Math.round((approved / total) * 100), color: "#22c55e" },
      { name: "Pending", value: Math.round((pending / total) * 100), color: "#eab308" },
      { name: "Declined", value: Math.round((declined / total) * 100), color: "#ef4444" },
    ];
  }, [kycDataRaw]);

  const recentActivity = (transactions || []).slice(0, 5).map((t: any) => ({
    id: t.id,
    action: t.type === "Deposit" ? "Deposit received" : "Withdrawal requested",
    user: t.userName || `User #${t.userId}`,
    amount: `$${t.amount}`,
    time: t.date,
    type: t.type.toLowerCase(),
  }));

  const pendingWithdrawalsList = (withdrawals || [])
    .filter((w: any) => w.trans_stat === "Pending")
    .slice(0, 5);

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
      { transId, status: "declined" },
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

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<FaUsers className="text-xl text-blue-400" />}
            label="Total Users"
            value={statsData.totalUsers.toLocaleString()}
            change="+12.5%"
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
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#374151" fontSize={12} />
                <YAxis stroke="#374151" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">KYC Status</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={kycStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={45}>
                  {kycStatusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
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
        </div>

        {/* Activity & Withdrawals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {transactionsLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${activity.type === "deposit" ? "bg-green-500/20 text-green-400" : "bg-purple-500/20 text-purple-400"}`}>
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
              <Skeleton className="h-40 w-full" />
            ) : pendingWithdrawalsList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No pending withdrawals</p>
            ) : (
              <div className="space-y-4">
                {pendingWithdrawalsList.map((withdrawal: any) => (
                  <div key={withdrawal.trans_id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0">
                    <div>
                      <p className="text-gray-900 text-sm">{withdrawal.user_email}</p>
                      <p className="text-gray-600 text-xs">{withdrawal.crypto}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-gray-900 text-sm font-medium">${withdrawal.trans_amt}</p>
                      <div className="flex gap-2 mt-1">
                        <button onClick={() => handleApproveWithdrawal(withdrawal.trans_id)} className="p-1 bg-green-500/20 text-green-400 rounded">
                          <FaCheckCircle />
                        </button>
                        <button onClick={() => handleRejectWithdrawal(withdrawal.trans_id)} className="p-1 bg-red-500/20 text-red-400 rounded">
                          <FaTimesCircle />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
