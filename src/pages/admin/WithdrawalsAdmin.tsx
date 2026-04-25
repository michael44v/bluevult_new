import { useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { FaSearch, FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import { useWithdrawals, useUsers, useUpdateTransactionStatus } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

interface WithdrawalWithUser {
  trans_id: number;
  user_id: number;
  trans_type: string;
  crypto: string;
  trans_amt: number;
  trans_time: string;
  trans_stat: string;
  user_wallet: string;
  user_name?: string;
  user_email?: string;
}

const WithdrawalsAdmin: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedWd, setSelectedWd] = useState<WithdrawalWithUser | null>(null);

  const { data: withdrawals, isLoading: wdLoading, error } = useWithdrawals();
  const { data: users, isLoading: usersLoading } = useUsers();
  const updateStatus = useUpdateTransactionStatus();

  const isLoading = wdLoading || usersLoading;

  // Merge withdrawal data with user data
  const wdWithUsers: WithdrawalWithUser[] = (withdrawals || []).map((wd) => {
    const user = users?.find(u => u.user_id === wd.user_id);
    return {
      ...wd,
      user_name: user?.user_name,
      user_email: user?.user_email,
    };
  });

  const filteredWithdrawals = wdWithUsers.filter((wd) => {
    const matchesSearch = (wd.user_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      wd.trans_id.toString().includes(search) ||
      (wd.user_email?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || wd.trans_stat.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
      processing: "bg-blue-500/20 text-blue-400",
      completed: "bg-green-500/20 text-green-400",
    };
    return styles[status.toLowerCase()] || "bg-gray-500/20 text-gray-400";
  };

  const handleApprove = (transId: number) => {
    updateStatus.mutate({ transId, status: "approved" });
    setSelectedWd(null);
  };

  const handleReject = (transId: number) => {
    updateStatus.mutate({ transId, status: "rejected" });
    setSelectedWd(null);
  };

  const pendingTotal = wdWithUsers
    .filter(w => w.trans_stat.toLowerCase() === "pending")
    .reduce((acc, w) => acc + Number(w.trans_amt), 0);

  if (error) {
    return (
      <AdminLayout title="Withdrawals">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load withdrawals. Please check your API connection.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Withdrawals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Withdrawal Requests</h2>
            <p className="text-gray-400">Review and process withdrawal requests</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Requests</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-white">{withdrawals?.length || 0}</p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Pending</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-yellow-400">
                {wdWithUsers.filter(w => w.trans_stat.toLowerCase() === "pending").length}
              </p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Pending Amount</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-yellow-400">${pendingTotal.toLocaleString()}</p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Approved Today</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-green-400">
                {wdWithUsers.filter(w => w.trans_stat.toLowerCase() === "approved").length}
              </p>
            )}
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="bg-[#1a1d2a] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f111b]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Request ID</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Wallet</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Requested</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                ) : filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      No withdrawal requests found
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((wd) => (
                    <tr key={wd.trans_id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-white font-mono text-sm">WD-{wd.trans_id}</td>
                      <td className="px-6 py-4">
                        <p className="text-white">{wd.user_name || `User #${wd.user_id}`}</p>
                        <p className="text-gray-400 text-xs">{wd.user_email || `ID: ${wd.user_id}`}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{Number(wd.trans_amt).toLocaleString()}</p>
                        <p className="text-gray-400 text-xs">{wd.crypto}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm font-mono truncate max-w-[150px]">
                          {wd.user_wallet !== "nill" ? wd.user_wallet : "N/A"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(wd.trans_stat)}`}>
                          {wd.trans_stat}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(wd.trans_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedWd(wd)}
                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                          >
                            <FaEye />
                          </button>
                          {wd.trans_stat.toLowerCase() === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(wd.trans_id)}
                                disabled={updateStatus.isPending}
                                className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition disabled:opacity-50"
                              >
                                <FaCheckCircle />
                              </button>
                              <button
                                onClick={() => handleReject(wd.trans_id)}
                                disabled={updateStatus.isPending}
                                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition disabled:opacity-50"
                              >
                                <FaTimesCircle />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Details Modal */}
        {selectedWd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d2a] rounded-2xl p-6 max-w-lg w-full border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Withdrawal Details</h3>
                <button onClick={() => setSelectedWd(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Request ID</p>
                    <p className="text-white font-mono">WD-{selectedWd.trans_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">User</p>
                    <p className="text-white">{selectedWd.user_name || `User #${selectedWd.user_id}`}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className="text-white font-medium">{Number(selectedWd.trans_amt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Currency</p>
                    <p className="text-white">{selectedWd.crypto}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-400 text-sm">Destination Wallet</p>
                    <p className="text-white font-mono text-sm break-all">
                      {selectedWd.user_wallet !== "nill" ? selectedWd.user_wallet : "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedWd.trans_stat)}`}>
                      {selectedWd.trans_stat}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Requested</p>
                    <p className="text-white">{new Date(selectedWd.trans_time).toLocaleString()}</p>
                  </div>
                </div>
                {selectedWd.trans_stat.toLowerCase() === "pending" && (
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => handleApprove(selectedWd.trans_id)}
                      disabled={updateStatus.isPending}
                      className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaCheckCircle /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedWd.trans_id)}
                      disabled={updateStatus.isPending}
                      className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <FaTimesCircle /> Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default WithdrawalsAdmin;
