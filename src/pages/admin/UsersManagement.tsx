import { useState, useEffect } from "react";
import './admincss.css';
import AdminLayout from "./components/AdminLayout";
import { FaSearch, FaEdit, FaBan, FaCheckCircle, FaEye } from "react-icons/fa";



interface User {
  user_id: number;
  user_name: string;
  user_email: string;
  kyc: string;
  user_phone: string;
  user_picture: string;
  user_reg_date: string;
  user_region: string;
  user_dob: string;
  user_address: string;
  us_citizen: string;
}

const UsersManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);


  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "fetch_users" }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setUsers(json.data);
      else setUsers([]);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      verified: "bg-green-500/20 text-green-400",
      unverified: "bg-yellow-500/20 text-yellow-400",
      rejected: "bg-red-500/20 text-red-400",
    };
    return styles[status] || "bg-gray-500/20 text-gray-400";
  };


  const toggleUserStatus = async (user: User) => {
    const newStatus = user.status === "suspended" ? "active" : "suspended";
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: 'toggle_status', userId: user.id, status: newStatus }),
      });
      const json = await res.json();

      if (json.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
        );

        const emailSubject =
          newStatus === "suspended"
            ? "Notice: Your account has been suspended"
            : "Notice: Your account has been activated";

        const emailMessage =
          newStatus === "suspended"
            ? "After our review, your BlueVult account wallet has been suspended."
            : "Good news! Your BlueVult account wallet has been activated.";

        fetch('https://bluevult.com/api/mail.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subject: emailSubject,
            name: user.name,
            email: user.email,
            message: emailMessage
          })
        })
        .then(res => res.json())
        .then(console.log)
        .catch(console.error);
      } else {
        alert("Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update user status");
    }
  };


  return (
    <AdminLayout title="Users Management">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">All Users</h2>
            <p className="text-gray-400">Manage and monitor user accounts</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-auto">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#1a1d2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Total Users</p>

            <p className="text-2xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Active</p>
            <p className="text-2xl font-bold text-green-400">{users.filter(u => u.status === "active").length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Suspended</p>
            <p className="text-2xl font-bold text-red-400">{users.filter(u => u.status === "suspended").length}</p>
          </div>
          <div className="bg-[#1a1d2a] rounded-xl p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{users.filter(u => u.status === "pending").length}</p>

          </div>
        </div>

        {/* Users Table */}

        <div className="bg-[#1a1d2a] rounded-2xl border border-gray-800 overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#0f111b]">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">KYC</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Balance</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Last Login</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-6">Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-400 py-6">No users found</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition">
                  <td className="px-4 py-2">
                    <p className="text-white font-medium">{user.name}</p>
                    <p className="text-gray-400 text-sm">{user.email}</p>
                    <p className="text-gray-500 text-xs">{user.id}</p>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(user.kycStatus)}`}>
                      {user.kycStatus}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-white font-medium">{user.balance}</td>
                  <td className="px-4 py-2 text-gray-400">{user.lastLogin}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className={`p-2 rounded-lg transition ${
                          user.status === "suspended"
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        }`}
                        title={user.status === "suspended" ? "Activate" : "Suspend"}
                        onClick={() => toggleUserStatus(user)}
                      >
                        {user.status === "suspended" ? <FaCheckCircle /> : <FaBan />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-[#1a1d2a] rounded-2xl p-6 max-w-lg w-full border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><p className="text-gray-400 text-sm">Name</p><p className="text-white">{selectedUser.name}</p></div>
                <div><p className="text-gray-400 text-sm">Email</p><p className="text-white">{selectedUser.email}</p></div>
                <div><p className="text-gray-400 text-sm">User ID</p><p className="text-white">{selectedUser.id}</p></div>
                <div><p className="text-gray-400 text-sm">Balance</p><p className="text-white">{selectedUser.balance}</p></div>
                <div><p className="text-gray-400 text-sm">Status</p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedUser.status)}`}>{selectedUser.status}</span></div>
                <div><p className="text-gray-400 text-sm">KYC Status</p><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(selectedUser.kycStatus)}`}>{selectedUser.kycStatus}</span></div>
                <div><p className="text-gray-400 text-sm">Join Date</p><p className="text-white">{selectedUser.joinDate}</p></div>
                <div><p className="text-gray-400 text-sm">Last Login</p><p className="text-white">{selectedUser.lastLogin}</p></div>

              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default UsersManagement;
