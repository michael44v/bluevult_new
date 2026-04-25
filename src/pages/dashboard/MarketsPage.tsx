import TopBar from '@/components/dashboard/TopBar';
import { useState, useEffect } from "react";
import { FaBars, FaMoon, FaSun, FaBell, FaUserCircle, FaChartLine, FaArrowUp, FaArrowDown } from "react-icons/fa";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";

import { Link } from "react-router-dom";

// Sample data
interface Asset {
  id: string;
  name: string;
  type: "Crypto" | "Stock";
  symbol: string;
  price: string;
  change: string;
  description: string;
}

const sampleAssets: Asset[] = [
  {
    id: "BTC",
    name: "Bitcoin",
    type: "Crypto",
    symbol: "BTC",
    price: "$26,000",
    change: "+2.5%",
    description: "The first decentralized cryptocurrency.",
  },
  {
    id: "ETH",
    name: "Ethereum",
    type: "Crypto",
    symbol: "ETH",
    price: "$1,650",
    change: "+1.8%",
    description: "Decentralized platform for smart contracts.",
  },
  {
    id: "AAPL",
    name: "Apple Inc.",
    type: "Stock",
    symbol: "AAPL",
    price: "$150",
    change: "+0.7%",
    description: "Leading technology company in consumer electronics.",
  },
  {
    id: "TSLA",
    name: "Tesla",
    type: "Stock",
    symbol: "TSLA",
    price: "$730",
    change: "-1.2%",
    description: "Electric vehicle and clean energy company.",
  },
];

const MarketsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  // Close disclaimer automatically after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowDisclaimer(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`${dark ? "dark" : ""} flex flex-col min-h-screen bg-gray-100 dark:bg-[#0f111b]`}>
      <div className="flex flex-1">
        {/* Sidebar */}
        <div
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 max-w-full">
          {/* Top Bar */}
          <TopBar title="Markets" onSidebarToggle={() => setSidebarOpen(true)} />

          {/* Disclaimer Modal */}
          {showDisclaimer && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-[#0a1120] p-6 rounded-2xl shadow-lg max-w-sm text-center">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2">Disclaimer</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                Trading involves risk. Please invest responsibly and only with funds you can afford to lose.

                </p>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="px-4 py-2 bg-[#00C4B4] text-white rounded-lg hover:bg-teal-500 transition"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          {/* Page Content */}
         <div className="p-6 space-y-6 mt-16">
            {/* Live Indicator */}
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">Live Prices</span>
            </div>

            {/* Assets Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {sampleAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-white dark:bg-[#0a1120] p-4 rounded-2xl shadow-lg flex flex-col gap-3 hover:scale-105 transform transition"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {asset.type === "Crypto" ? <FaChartLine className="text-blue-500" /> : <FaChartLine className="text-yellow-500" />}
                      <span className="font-semibold text-gray-900 dark:text-white">{asset.name}</span>
                    </div>
                    <span className={`text-gray-500 dark:text-gray-400`}>{asset.type}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{asset.description}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-gray-900 dark:text-white">{asset.price}</span>
                    <span className={`font-semibold ${asset.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                      {asset.change}
                    </span>
                  </div>
                  <Link to="/wallets/deposit">
                  <button className="mt-2 px-4 py-2 bg-[#00C4B4] text-white rounded-lg hover:bg-teal-500 transition">
                    Invest Now
                  </button></Link>
                  {/* Widgets */}
                  <div className="flex gap-2 mt-2">
                    <span className="bg-gray-100 dark:bg-[#1a1d2a] px-2 py-1 rounded-lg text-xs">Volatility Low</span>
                    <span className="bg-gray-100 dark:bg-[#1a1d2a] px-2 py-1 rounded-lg text-xs">Market Cap High</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Table of Assets */}
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full bg-white dark:bg-[#0a1120] rounded-2xl overflow-hidden shadow-lg">
                <thead className="bg-gray-200 dark:bg-[#1a1d2a]">
                  <tr>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-300">Name</th>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-300">Type</th>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-300">Symbol</th>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-300">Price</th>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-300">Change</th>
                    <th className="text-left p-3 text-gray-700 dark:text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleAssets.map((asset) => (
                    <tr key={asset.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-3 text-gray-900 dark:text-white">{asset.name}</td>
                      <td className="p-3 text-gray-900 dark:text-white">{asset.type}</td>
                      <td className="p-3 text-gray-900 dark:text-white">{asset.symbol}</td>
                      <td className="p-3 text-gray-900 dark:text-white">{asset.price}</td>
                      <td className={`p-3 font-semibold ${asset.change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
                        {asset.change}
                      </td>
                      <td className="p-3">
                         <Link to="/wallets/deposit">
                        <button className="px-3 py-1 bg-[#00C4B4] text-white rounded-lg hover:bg-teal-500 transition">
                          Invest Now
                        </button></Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes Section */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-[#0a1120] rounded-2xl shadow-inner">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Notes:</h3>
              <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm">
                <li>All prices are live and updated every minute.</li>
                <li>Invest responsibly and understand the market risk.</li>
                <li>Past performance is not indicative of future results.</li>
              </ul>
            </div>

            {/* Footer */}
             <div className="p-6 space-y-6">
            <Footer />
         </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;