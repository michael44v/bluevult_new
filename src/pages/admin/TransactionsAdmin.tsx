import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { FaSearch, FaDownload, FaEye } from "react-icons/fa";
<<<<<<< HEAD

interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: "Deposit" | "Withdraw" | "Transfer" | "Trade";
  amount: string;
  currency: string;
  status: "pending" | "approved" | "declined";
  wallet: string;
  date: string;
=======
import { useTransactions, useUsers } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionWithUser {
  trans_id: number;
  user_id: number;
  trans_type: string;
  crypto: string;
  trans_amt: number;
  trans_time: string;
  trans_stat: string;
  user_wallet: string;
  user_name?: string;
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
}

const TransactionsAdmin: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
<<<<<<< HEAD
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "admin_get_transactions" }),
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle Approve / Decline
  const handleTransactionAction = async (t_id: string, action: "approve_tx" | "decline_tx") => {
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: action, txn_id: t_id }),
      });
      const data = await res.json();
      if (data.success) {
          alert(data.message);
        fetchTransactions(); // Refresh after action
        setSelectedTx(null);
      } else {
        alert("Action failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filters
  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.userName.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.userId.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || tx.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || tx.status.toLowerCase() === statusFilter.toLowerCase();
=======
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTx, setSelectedTx] = useState<TransactionWithUser | null>(null);

  const { data: transactions, isLoading: txLoading, error } = useTransactions();
  const { data: users, isLoading: usersLoading } = useUsers();

  const isLoading = txLoading || usersLoading;

  // Merge transaction data with user data
  const txWithUsers: TransactionWithUser[] = (transactions || []).map((tx) => {
    const user = users?.find(u => u.user_id === tx.user_id);
    return {
      ...tx,
      user_name: user?.user_name,
    };
  });

  const filteredTransactions = txWithUsers.filter((tx) => {
    const matchesSearch = (tx.user_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      tx.trans_id.toString().includes(search) ||
      tx.user_id.toString().includes(search);
    const matchesType = typeFilter === "all" || tx.trans_type.toLowerCase() === typeFilter;
    const matchesStatus = statusFilter === "all" || tx.trans_stat.toLowerCase() === statusFilter;
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
    return matchesSearch && matchesType && matchesStatus;
  });

  // Helpers for badge colors
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
<<<<<<< HEAD
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      declined: "bg-red-500/20 text-red-400",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400";
=======
      completed: "bg-green-500/20 text-green-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      failed: "bg-red-500/20 text-red-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    return styles[status.toLowerCase()] || "bg-gray-500/20 text-gray-400";
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {
<<<<<<< HEAD
      Deposit: "bg-green-500/20 text-green-400",
      Withdraw: "bg-purple-500/20 text-purple-400",
      Transfer: "bg-blue-500/20 text-blue-400",
      Trade: "bg-yellow-500/20 text-yellow-400",
    };
    return styles[type] || "bg-gray-500/20 text-gray-400";
  };

  // Stats
  const totalDeposits = transactions
    .filter(t => t.type.toLowerCase() === "deposit" && t.status === "approved")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type.toLowerCase() === "withdraw" && t.status === "approved")
    .reduce((sum, t) => sum + Number(t.amount), 0);
=======
      deposit: "bg-green-500/20 text-green-400",
      withdrawal: "bg-purple-500/20 text-purple-400",
      transfer: "bg-blue-500/20 text-blue-400",
      trade: "bg-yellow-500/20 text-yellow-400",
    };
    return styles[type.toLowerCase()] || "bg-gray-500/20 text-gray-400";
  };

  // Calculate totals
  const totalDeposits = txWithUsers
    .filter(t => t.trans_type.toLowerCase() === "deposit")
    .reduce((acc, t) => acc + Number(t.trans_amt), 0);
  
  const totalWithdrawals = txWithUsers
    .filter(t => t.trans_type.toLowerCase() === "withdrawal")
    .reduce((acc, t) => acc + Math.abs(Number(t.trans_amt)), 0);

  if (error) {
    return (
      <AdminLayout title="Transactions">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load transactions. Please check your API connection.</p>
        </div>
      </AdminLayout>
    );
  }
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5

  return (
    <AdminLayout title="Transactions">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">All Transactions</h2>
            <p className="text-gray-400">Monitor all platform transactions</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user or TXN ID..."
              className="px-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white"
            />

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white">
              <option value="all">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdraw">Withdrawal</option>
              <option value="Transfer">Transfer</option>
              <option value="Trade">Trade</option>
            </select>

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
            </select>

            <button className="px-4 py-2 bg-red-600 rounded-lg text-white flex items-center gap-2">
              <FaDownload /> Export
            </button>
          </div>
        </div>

        {/* Stats */}
<<<<<<< HEAD
        <div className="grid md:grid-cols-4 gap-4">
          <Stat title="Total Transactions" value={transactions.length} />
          <Stat title="Total Deposits" value={`$${totalDeposits.toLocaleString()}`} color="text-green-400" />
          <Stat title="Total Withdrawals" value={`$${totalWithdrawals.toLocaleString()}`} color="text-purple-400" />
          <Stat title="Pending" value={transactions.filter(t => t.status === "pending").length} color="text-yellow-400" />
        </div>

        {/* Transactions Table */}
        <div className="bg-[#1a1d2a] rounded-xl border border-gray-800 overflow-x-auto">
          <table className="w-full text-white">
            <thead className="bg-[#0f111b]">
              <tr>
                <th className="px-6 py-3 text-left text-white text-sm">Transaction ID</th>
                <th className="px-6 py-3 text-left text-white text-sm">User Name</th>
                <th className="px-6 py-3 text-left text-white text-sm">Type</th>
                <th className="px-6 py-3 text-left text-white text-sm">Amount</th>
                <th className="px-6 py-3 text-left text-white text-sm">Wallet</th>
                <th className="px-6 py-3 text-left text-white text-sm">Status</th>
                <th className="px-6 py-3 text-left text-white text-sm">Date</th>
                <th className="px-6 py-3 text-left text-white text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className={`hover:bg-white/5 transition ${tx.status === "approved" ? "bg-green-900/10" : tx.status === "pending" ? "bg-yellow-900/10" : "bg-red-900/10"}`}>
                  <td className="px-6 py-3 font-mono">{tx.id}</td>
                  <td className="px-6 py-3">{tx.userName} ({Number(tx.userId)+734350})</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded ${getTypeBadge(tx.type)}`}>{tx.type}</span>
                  </td>
                 <td className="px-6 py-3">
  ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<br></br>({Number(tx.currency).toFixed(5)}BTC)
</td>

                  <td className="px-6 py-3">{tx.wallet}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded ${getStatusBadge(tx.status)}`}>{tx.status}</span>
                  </td>
                  <td className="px-6 py-3">{tx.date}</td>
                  <td className="px-6 py-3">
                    <button onClick={() => setSelectedTx(tx)}>
                      <FaEye className="text-blue-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="p-4 text-gray-400">Loading transactions...</p>}
=======
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Transactions</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-white">{transactions?.length || 0}</p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Deposits</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-green-400">${totalDeposits.toLocaleString()}</p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Withdrawals</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-purple-400">${totalWithdrawals.toLocaleString()}</p>
            )}
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Pending</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-yellow-400">
                {txWithUsers.filter(t => t.trans_stat.toLowerCase() === "pending").length}
              </p>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-[#1a1d2a] rounded-2xl border border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f111b]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Transaction</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Crypto</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-10" /></td>
                    </tr>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.trans_id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <p className="text-white font-mono text-sm">TXN-{tx.trans_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white">{tx.user_name || `User #${tx.user_id}`}</p>
                        <p className="text-gray-400 text-xs">ID: {tx.user_id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeBadge(tx.trans_type)}`}>
                          {tx.trans_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-medium ${tx.trans_type.toLowerCase() === "deposit" ? "text-green-400" : "text-red-400"}`}>
                          {tx.trans_type.toLowerCase() === "deposit" ? "+" : "-"}
                          {Number(tx.trans_amt).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-400">{tx.crypto}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(tx.trans_stat)}`}>
                          {tx.trans_stat}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {new Date(tx.trans_time).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
        </div>

        {/* Modal */}
        {selectedTx && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1d2a] p-6 rounded-xl w-full max-w-md border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Transaction Details</h3>
                <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
              </div>
<<<<<<< HEAD

              <div className="space-y-3 text-white text-sm">
                <div className="flex justify-between"><span className="font-semibold">Transaction ID:</span> <span>{selectedTx.id}</span></div>
                <div className="flex justify-between"><span className="font-semibold">User:</span> <span>{selectedTx.userName} ({selectedTx.userId})</span></div>
                <div className="flex justify-between"><span className="font-semibold">Type:</span> <span className={`px-2 py-1 rounded ${getTypeBadge(selectedTx.type)}`}>{selectedTx.type}</span></div>
                <div className="flex justify-between"><span className="font-semibold">Amount:</span> <span>${selectedTx.amount} ({selectedTx.currency} BTC)</span></div>
                <div className="flex justify-between"><span className="font-semibold">Wallet:</span> <span>{selectedTx.wallet}</span></div>
                <div className="flex justify-between"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded ${getStatusBadge(selectedTx.status)}`}>{selectedTx.status}</span></div>
                <div className="flex justify-between"><span className="font-semibold">Date:</span> <span>{selectedTx.date}</span></div>
=======
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Transaction ID</p>
                    <p className="text-white font-mono">TXN-{selectedTx.trans_id}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">User</p>
                    <p className="text-white">{selectedTx.user_name || `User #${selectedTx.user_id}`}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Type</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getTypeBadge(selectedTx.trans_type)}`}>
                      {selectedTx.trans_type}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Amount</p>
                    <p className={`font-medium ${selectedTx.trans_type.toLowerCase() === "deposit" ? "text-green-400" : "text-red-400"}`}>
                      {Number(selectedTx.trans_amt).toLocaleString()} {selectedTx.crypto}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedTx.trans_stat)}`}>
                      {selectedTx.trans_stat}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Crypto</p>
                    <p className="text-white">{selectedTx.crypto}</p>
                  </div>
                  {selectedTx.user_wallet && selectedTx.user_wallet !== "nill" && (
                    <div className="col-span-2">
                      <p className="text-gray-400 text-sm">Wallet Address</p>
                      <p className="text-white font-mono text-sm break-all">{selectedTx.user_wallet}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-gray-400 text-sm">Date & Time</p>
                    <p className="text-white">{new Date(selectedTx.trans_time).toLocaleString()}</p>
                  </div>
                </div>
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
              </div>

              {selectedTx.status.toLowerCase() === "pending" && (
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => handleTransactionAction(selectedTx.id, "approve_tx")} className="px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700">Approve</button>
                  <button onClick={() => handleTransactionAction(selectedTx.id, "decline_tx")} className="px-4 py-2 bg-red-600 rounded-lg text-white hover:bg-red-700">Decline</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

const Stat = ({ title, value, color = "text-white" }: any) => (
  <div className="bg-[#1a1d2a] p-4 rounded-xl border border-gray-800">
    <p className="text-gray-400 text-sm">{title}</p>
    <p className={`text-2xl font-bold ${color}`}>{value}</p>
  </div>
);

export default TransactionsAdmin;
