import { useState, useEffect } from "react";
import AdminLayout from "./components/AdminLayout";
import { FaSearch, FaPlus, FaMinus, FaHistory, FaExclamationTriangle } from "react-icons/fa";
import { useUsers, useUpdateUserBalance } from "@/hooks/useAdminData";
import { Skeleton } from "@/components/ui/skeleton";

interface UserWithBalance {
  user_id: number;
  user_name: string;
  user_email: string;
  user_balance?: number;
}

<<<<<<< HEAD
interface Adjustment {
  id: number;
  user: string;
  type: "add" | "subtract";
  amount: string;
  reason: string;
  admin: string;
  date: string;
}
=======
const recentAdjustments = [
  { id: 1, user: "john@example.com", type: "add", amount: "+$500 USD", reason: "Compensation for service issue", admin: "super_admin", date: "2026-01-25" },
  { id: 2, user: "alice@example.com", type: "subtract", amount: "-0.1 BTC", reason: "Fraud investigation recovery", admin: "super_admin", date: "2026-01-24" },
  { id: 3, user: "carol@example.com", type: "add", amount: "+1000 USDT", reason: "Referral bonus", admin: "admin1", date: "2026-01-23" },
];
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5

const BalanceAdjustment: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserWithBalance | null>(null);
  const [adjustmentType, setAdjustmentType] = useState<"credit" | "debit">("credit");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch users dynamically
  const fetchUsers = async () => {
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "fetch_users" }),
      });
      const data = await res.json();
      if (data.success) setUsers(data.data);
      else alert("Error fetching users: " + data.message);
    } catch (err) {
      console.error("Fetch users error:", err);
      alert("Failed to fetch users");
    }
  };

  // 🔹 Fetch recent adjustments dynamically
  const fetchAdjustments = async () => {
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "fetch_adjustments" }),
      });
      const data = await res.json();
      if (data.success) setAdjustments(data.data);
    } catch (err) {
      console.error("Fetch adjustments error:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAdjustments();
  }, []);

<<<<<<< HEAD
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase())
=======
  const { data: users, isLoading, error } = useUsers();
  const updateBalance = useUpdateUserBalance();

  const filteredUsers = (users || []).filter((user) =>
    user.user_name.toLowerCase().includes(search.toLowerCase()) ||
    user.user_email.toLowerCase().includes(search.toLowerCase()) ||
    user.user_id.toString().includes(search)
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
  );

  const handleSubmit = () => {
    if (!selectedUser || !amount || !reason) {
      alert("Please fill in all fields");
      return;
    }
    setConfirmOpen(true);
  };

<<<<<<< HEAD
  const handleConfirm = async () => {
  if (!selectedUser) return;
  setLoading(true);

  try {
    // 🔹 Submit adjustment
    const res = await fetch("https://bluevult.com/api/admin-api.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: "adjust_balance",
        user_id: selectedUser.id,
        type: adjustmentType,
        currency,
        amount,
        reason,
      }),
    });

    const data = await res.json();
    if (data.success) {
      alert("Balance adjustment submitted successfully!");

      // 🔹 Send email notification to user
      const emailSubject =
        adjustmentType === "add"
          ? `Deposit Received: ${amount} ${currency}`
          : `Withdrawal / Deduction: ${amount} ${currency}`;

      const emailMessage =
        adjustmentType === "add"
          ? `Hello ${selectedUser.name},<br><br>We have added ${amount} ${currency} to your BlueVult account as per our recent adjustment.<br><br>Reason: ${reason}<br><br>Thank you for using BlueVult.`
          : `Hello ${selectedUser.name},<br><br>${amount} ${currency} has been deducted from your BlueVult account as per our recent adjustment.<br><br>Reason: ${reason}<br><br>Please contact support if you have any questions.`;

      fetch("https://bluevult.com/api/mail.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: emailSubject,
          name: selectedUser.name,
          email: selectedUser.email,
          message: emailMessage,
        }),
      })
        .then((res) => res.json())
        .then(console.log)
        .catch(console.error);

      // 🔹 Reset form
      setSelectedUser(null);
      setAmount("");
      setReason("");
      setConfirmOpen(false);
      fetchAdjustments();
      fetchUsers();
    } else {
      alert("Error: " + data.message);
    }
  } catch (err) {
    console.error("API error:", err);
    alert("An unexpected error occurred while submitting adjustment.");
  }

  setLoading(false);
};


  const getBadgeColor = (value: number) => {
    if (value > 0) return "bg-green-600/20 text-green-400";
    if (value < 0) return "bg-red-600/20 text-red-400";
    return "bg-gray-600/20 text-gray-400";
=======
  const handleConfirm = () => {
    if (!selectedUser) return;
    
    updateBalance.mutate({
      userId: selectedUser.user_id,
      amount: parseFloat(amount),
      type: adjustmentType,
      reason,
    }, {
      onSuccess: () => {
        alert("Balance adjustment submitted successfully!");
        setConfirmOpen(false);
        setSelectedUser(null);
        setAmount("");
        setReason("");
      },
      onError: () => {
        alert("Failed to adjust balance. Please try again.");
      }
    });
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
  };

  if (error) {
    return (
      <AdminLayout title="Balance Adjustment">
        <div className="text-center py-12">
          <p className="text-red-400">Failed to load users. Please check your API connection.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Balance Adjustment">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Manual Balance Adjustment</h2>
          <p className="text-gray-400">Add or subtract funds from user accounts (Super Admin only)</p>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 flex items-start gap-3">
          <FaExclamationTriangle className="text-yellow-400 text-xl flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 font-medium">Warning: This action is irreversible</p>
            <p className="text-yellow-300 text-sm">All balance adjustments are logged and audited. Use with caution.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Selection */}
          <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Select User</h3>
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
<<<<<<< HEAD
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 rounded-lg text-left transition ${
                    selectedUser?.id === user.id
                      ? "bg-red-600/20 border border-red-500"
                      : "bg-[#0f111b] hover:bg-gray-800 border border-transparent"
                  }`}
                >
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                  <div className="grid grid-cols-2 text-sm mt-1 gap-2">
                    <span className={`px-2 py-1 rounded ${getBadgeColor(user.btcBalance)}`}>USD BALANCE: {user.balance}</span>
                     <span className={`px-2 py-1 rounded ${getBadgeColor(user.btcBalance)}`}>User Status: {user.status}</span>
                   
                       </div>
                </button>
              ))}
=======
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))
              ) : filteredUsers.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No users found</p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.user_id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-4 rounded-lg text-left transition ${
                      selectedUser?.user_id === user.user_id
                        ? "bg-red-600/20 border border-red-500"
                        : "bg-[#0f111b] hover:bg-gray-800 border border-transparent"
                    }`}
                  >
                    <p className="text-white font-medium">{user.user_name}</p>
                    <p className="text-gray-400 text-sm">{user.user_email}</p>
                    <p className="text-gray-500 text-xs">ID: {user.user_id}</p>
                  </button>
                ))
              )}
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
            </div>
          </div>

          {/* Adjustment Form */}
          <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Adjustment Details</h3>
            {selectedUser ? (
              <div className="space-y-4">
<<<<<<< HEAD
=======
                {/* Selected User Info */}
                <div className="bg-[#0f111b] rounded-lg p-4">
                  <p className="text-white font-medium">{selectedUser.user_name}</p>
                  <p className="text-gray-400 text-sm">{selectedUser.user_email}</p>
                  <p className="text-gray-500 text-xs">User ID: {selectedUser.user_id}</p>
                </div>
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5

                {/* Adjustment Type */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Adjustment Type</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setAdjustmentType("credit")}
                      className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                        adjustmentType === "credit"
                          ? "bg-green-600 text-white"
                          : "bg-[#0f111b] text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <FaPlus /> Add Funds
                    </button>
                    <button
                      onClick={() => setAdjustmentType("debit")}
                      className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition ${
                        adjustmentType === "debit"
                          ? "bg-red-600 text-white"
                          : "bg-[#0f111b] text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <FaMinus /> Subtract Funds
                    </button>
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="USD">USD</option>
                   
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Enter amount in ${currency}`}
                    className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Reason (Required)</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter reason for this adjustment..."
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0f111b] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={!amount || !reason}
                  className={`w-full py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    adjustmentType === "credit"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : "bg-red-600 hover:bg-red-700 text-white"
                  }`}
                  disabled={loading}
                >
<<<<<<< HEAD
                  {loading ? "Submitting..." : `${adjustmentType === "add" ? "Add" : "Subtract"} ${amount} ${currency}`}
=======
                  {adjustmentType === "credit" ? "Add" : "Subtract"} {amount} {currency}
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
                </button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>Select a user to make adjustments</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Adjustments Table */}
        <div className="bg-[#1a1d2a] rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <FaHistory className="text-gray-400" />
            <h3 className="text-lg font-semibold text-white">Recent Adjustments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {adjustments.map((adj) => (
                  <tr key={adj.id}>
                    <td className="px-4 py-3 text-white">{adj.user}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          adj.type === "add" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {adj.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 font-medium ${adj.type === "add" ? "text-green-400" : "text-red-400"}`}>
                      {adj.amount}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{adj.reason}</td>
                    <td className="px-4 py-3 text-gray-400">{adj.admin}</td>
                    <td className="px-4 py-3 text-gray-400">{adj.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d2a] rounded-2xl p-6 max-w-md w-full border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Adjustment</h3>
              <div className="bg-yellow-500/20 rounded-lg p-4 mb-4">
                <p className="text-yellow-400 text-sm">
                  You are about to {adjustmentType === "credit" ? "add" : "subtract"} {amount} {currency} {adjustmentType === "credit" ? "to" : "from"} {selectedUser?.user_email}
                </p>
              </div>
              <p className="text-gray-400 text-sm mb-4">Reason: {reason}</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={updateBalance.isPending}
                  className={`flex-1 py-3 rounded-lg text-white transition disabled:opacity-50 ${
                    adjustmentType === "credit" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                  }`}
                  disabled={loading}
                >
<<<<<<< HEAD
                  {loading ? "Submitting..." : "Confirm"}
=======
                  {updateBalance.isPending ? "Processing..." : "Confirm"}
>>>>>>> 41c2da549fdfe9a56159b71ebd6adf0d9558cda5
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default BalanceAdjustment;
