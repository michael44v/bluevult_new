import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { FaSearch, FaDownload, FaEye } from "react-icons/fa";


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

}

const TransactionsAdmin: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [editingDate, setEditingDate] = useState<string>("");

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

    return matchesSearch && matchesType && matchesStatus;
  });

  // Helpers for badge colors
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {

      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      declined: "bg-red-500/20 text-red-400",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400";

  };

  const getTypeBadge = (type: string) => {
    const styles: Record<string, string> = {

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
                    <button onClick={() => {
                        setSelectedTx(tx);
                        setEditingDate(tx.date);
                    }}>
                      <FaEye className="text-blue-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="p-4 text-gray-400">Loading transactions...</p>}

        </div>

        {/* Modal */}
        {selectedTx && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1d2a] p-6 rounded-xl w-full max-w-md border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Transaction Details</h3>
                <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-white text-lg">✕</button>
              </div>


              <div className="space-y-3 text-white text-sm">
                <div className="flex justify-between"><span className="font-semibold">Transaction ID:</span> <span>{selectedTx.id}</span></div>
                <div className="flex justify-between"><span className="font-semibold">User:</span> <span>{selectedTx.userName} ({selectedTx.userId})</span></div>
                <div className="flex justify-between"><span className="font-semibold">Type:</span> <span className={`px-2 py-1 rounded ${getTypeBadge(selectedTx.type)}`}>{selectedTx.type}</span></div>
                <div className="flex justify-between"><span className="font-semibold">Amount:</span> <span>${selectedTx.amount} ({selectedTx.currency} BTC)</span></div>
                <div className="flex justify-between"><span className="font-semibold">Wallet:</span> <span>{selectedTx.wallet}</span></div>
                <div className="flex justify-between"><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded ${getStatusBadge(selectedTx.status)}`}>{selectedTx.status}</span></div>
                <div className="flex flex-col gap-1">
                    <span className="font-semibold">Date:</span>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={editingDate}
                            onChange={(e) => setEditingDate(e.target.value)}
                            className="flex-1 bg-[#0f111b] border border-gray-700 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <button
                            onClick={async () => {
                                try {
                                    const res = await fetch("https://bluevult.com/api/admin-api.php", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            q: "update_tx_date",
                                            txn_id: selectedTx.id,
                                            new_date: editingDate
                                        }),
                                    });
                                    const data = await res.json();
                                    if (data.success) {
                                        alert("Date updated successfully");
                                        fetchTransactions();
                                    } else {
                                        alert("Failed to update date: " + data.message);
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert("Error updating date");
                                }
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs transition"
                        >
                            Update
                        </button>
                    </div>
                </div>
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
