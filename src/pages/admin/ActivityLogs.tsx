import { useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { FaSearch, FaUser, FaCog, FaExchangeAlt, FaShieldAlt, FaEdit } from "react-icons/fa";
import { useActivityLogs, useActivityLogStats } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

const ActivityLogs: React.FC = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: logs = [], isLoading: logsLoading } = useActivityLogs();
  const { data: stats, isLoading: statsLoading } = useActivityLogStats();

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.actor.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || log.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    const icons = {
      user: <FaUser className="text-blue-400" />,
      admin: <FaEdit className="text-yellow-400" />,
      system: <FaCog className="text-gray-400" />,
      security: <FaShieldAlt className="text-red-400" />,
      transaction: <FaExchangeAlt className="text-green-400" />,
    };
    return icons[category as keyof typeof icons] || <FaCog />;
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      user: "bg-blue-500/20 text-blue-400",
      admin: "bg-yellow-500/20 text-yellow-400",
      system: "bg-gray-500/20 text-gray-400",
      security: "bg-red-500/20 text-red-400",
      transaction: "bg-green-500/20 text-green-400",
    };
    return styles[category as keyof typeof styles] || "bg-gray-500/20 text-gray-400";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <AdminLayout title="Activity Logs">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Activity Logs</h2>
            <p className="text-gray-400">Monitor all admin and system activities</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="system">System</option>
              <option value="security">Security</option>
              <option value="transaction">Transaction</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {statsLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-20 bg-[#1a1d2a]" />
            ))
          ) : (
            <>
              <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Total Logs</p>
                <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
              </div>
              <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">User Actions</p>
                <p className="text-2xl font-bold text-blue-400">{stats?.user || 0}</p>
              </div>
              <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Admin Actions</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.admin || 0}</p>
              </div>
              <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Security Events</p>
                <p className="text-2xl font-bold text-red-400">{stats?.security || 0}</p>
              </div>
              <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
                <p className="text-gray-400 text-sm">Transactions</p>
                <p className="text-2xl font-bold text-green-400">{stats?.transaction || 0}</p>
              </div>
            </>
          )}
        </div>

        {/* Logs Table */}
        <div className="bg-[#1a1d2a] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f111b]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actor</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Details</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">IP</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logsLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <Skeleton className="h-10 bg-gray-800" />
                      </td>
                    </tr>
                  ))
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      No activity logs found
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.log_id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCategoryBadge(log.category)}`}>
                            {log.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">{log.action}</td>
                      <td className="px-6 py-4">
                        <p className="text-white">{log.actor}</p>
                        {log.target && <p className="text-gray-400 text-xs">→ {log.target}</p>}
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">{log.details}</td>
                      <td className="px-6 py-4 text-gray-400 font-mono text-sm">{log.ip_address}</td>
                      <td className="px-6 py-4 text-gray-400 text-sm">{formatDate(log.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs;