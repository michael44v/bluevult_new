import TopBar from '@/components/dashboard/TopBar';
import { useState } from "react";
import { FaBars, FaCopy } from "react-icons/fa";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "../../components/landing/Footer";
import { FaMoon, FaSun, FaBell, FaUserCircle } from "react-icons/fa";

interface Referral {
  username: string;
  joinedDate: string;
  amountEarned: string;
}

const sampleReferrals: Referral[] = [
  { username: "user123", joinedDate: "2026-01-20", amountEarned: "$50" },
  { username: "cryptoFan", joinedDate: "2026-01-21", amountEarned: "$30" },
  { username: "blockchainGuru", joinedDate: "2026-01-22", amountEarned: "$20" },
];

const ReferralPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const referralLink = "https://bluevult.com/referral/"+localStorage.getItem("user_name");

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    //alert("Referral link copied!");
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
         <TopBar title="Affiliates" onSidebarToggle={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <div className="p-6 space-y-6 mt-16">
          {/* Referral Link */}
         <div className="bg-white dark:bg-[#0a1120] p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:items-center gap-4 w-full">
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300 mb-2">
                Share your referral link with friends and earn rewards when they sign up!
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-[#0a1120] dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
                <button
                  onClick={handleCopy}
                  className="bg-[#00C4B4] hover:bg-[#00b3a0] text-white px-4 py-3 rounded-lg transition flex items-center gap-2"
                >
                  <FaCopy /> Copy
                </button>
              </div>
            </div>
          </div>

          {/* Referral Table */}
          <div className="bg-white dark:bg-[#0a1120] rounded-2xl shadow-lg p-4 md:p-6 overflow-x-auto w-full">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Referrals</h2>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#020617]">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Username</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Joined Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amount Earned</th>
                </tr>
              </thead>
               {/* Referral Table 
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {sampleReferrals.map((ref, idx) => (
                  <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-[#1a1d2a]">
                    <td className="px-4 py-2 text-gray-900 dark:text-white">{ref.username}</td>
                    <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{ref.joinedDate}</td>
                    <td className="px-4 py-2 text-green-500 font-semibold">{ref.amountEarned}</td>
                  </tr>
                ))}
              </tbody>*/}
              <h2>No referrals Yet.</h2>
            </table>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;