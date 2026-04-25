import TopBar from '@/components/dashboard/TopBar';
import { useState, useEffect } from "react";
import { FaBars, FaMoon, FaSun, FaBell, FaUserCircle, FaCopy } from "react-icons/fa";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "../../components/landing/Footer";

interface Transaction {
  id: string | number; // could come as number from backend
  type: "Deposit" | "Withdraw" | "Transfer";
  amount: string;
  currency: string;
  date: string;
  status: "approved" | "Pending" | "Rejected";
}

const TransactionHistory: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
     document.body.style.transition = "opacity 0.5s";
      document.body.style.opacity = "1";

    const fetchTransactions = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("https://bluevult.com/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "transactions", uid: userId }),
        });

        const data = await res.json();

        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch transactions.");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(
    (txn) =>
      String(txn.id).toLowerCase().includes(search.toLowerCase()) ||
      txn.type.toLowerCase().includes(search.toLowerCase()) ||
      txn.currency.toLowerCase().includes(search.toLowerCase())
  );

  const copyToClipboard = (text: string | number) => {
    navigator.clipboard.writeText(String(text));
    alert(`Copied to clipboard`);
  };

  return (
    <div className={`${dark ? "dark" : ""} flex min-h-screen bg-gray-100 dark:bg-[#0f111b]`}>
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
        {/* Top Bar */}
        <TopBar title="History" onSidebarToggle={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <div className="p-6 space-y-6 mt-16">
          {/* Search */}
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 dark:bg-[#0a1120] dark:border-gray-600 dark:text-white"
          />

          {loading && <p className="text-white mt-4">Loading transactions...</p>}
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {!loading && !error && filteredTransactions.length === 0 && (
            <p className="text-gray-400 dark:text-gray-500 mt-4">No recent transactions found.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {filteredTransactions.map((txn) => (
              <div
                key={txn.id}
                className="bg-white dark:bg-[#0a1120] p-4 rounded-2xl shadow-lg flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900 dark:text-white">{txn.type}</span>
                  <span
                    className={`font-bold ${
                      txn.status === "Completed"
                        ? "text-green-500"
                        : txn.status === "Pending"
                        ? "text-yellow-400"
                        : "text-red-500"
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>

               <p className="text-black-700 dark:text-gray-300"><b>
                  Amount: {new Intl.NumberFormat('en-US', { 
                    style: 'currency', 
                    currency: txn.currency || 'USD', 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  }).format(Number(txn.amount))} {txn.currency} </b>({txn.amountBTC} BTC)
                </p>

                <div className="flex items-center gap-2">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">ID: {Number(txn.id)}</p>
                  <button
                    onClick={() => copyToClipboard(txn.id)}
                    className="text-xs text-teal-400 hover:text-teal-500 transition"
                  >
                    <FaCopy />
                  </button>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm">Date: {txn.date}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;