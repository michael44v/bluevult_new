import React from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { SiBinance, SiCoinbase, SiKraken, SiOkx, SiBybit } from "react-icons/si";
import { FaGlobe, FaShieldAlt, FaBolt, FaExchangeAlt, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const exchanges = [
  { name: "Binance", icon: SiBinance, color: "text-[#F3BA2F]", volume: "$12.4B", rating: 9.8 },
  { name: "Coinbase", icon: SiCoinbase, color: "text-[#0052FF]", volume: "$2.1B", rating: 9.5 },
  { name: "Kraken", icon: SiKraken, color: "text-[#5841D8]", volume: "$0.8B", rating: 9.2 },
  { name: "OKX", icon: SiOkx, color: "text-white", volume: "$1.5B", rating: 8.9 },
  { name: "Bybit", icon: SiBybit, color: "text-[#F3BA2F]", volume: "$1.2B", rating: 8.7 },
];

const Exchanges: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d1421] text-white">
      <Header />
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Top Cryptocurrency Exchanges</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Compare the world's leading crypto exchanges and see why BlueVult offers the best environment for your trading needs.
          </p>
        </div>

        <div className="bg-[#17212d] border border-[#1a2535] rounded-3xl overflow-hidden mb-20 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1e2d3d] border-b border-[#1a2535]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Exchange</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">24h Volume</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Trust Score</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2535]">
                {exchanges.map((ex) => (
                  <tr key={ex.name} className="hover:bg-[#1e2d3d] transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <ex.icon className={`text-2xl ${ex.color}`} />
                        <span className="font-bold">{ex.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                      {ex.volume}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${ex.rating * 10}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold">{ex.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-[#17212d] border border-[#1a2535] p-8 rounded-3xl">
            <FaGlobe className="text-4xl text-[#3861fb] mb-6" />
            <h3 className="text-xl font-bold mb-4">Global Access</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connect to global markets through BlueVult's high-speed infrastructure. Trade across multiple exchanges from a single interface.
            </p>
          </div>
          <div className="bg-[#17212d] border border-[#1a2535] p-8 rounded-3xl">
            <FaShieldAlt className="text-4xl text-green-400 mb-6" />
            <h3 className="text-xl font-bold mb-4">Security First</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We aggregate data from only the most trusted and regulated exchanges, ensuring your trading environment is always secure.
            </p>
          </div>
          <div className="bg-[#17212d] border border-[#1a2535] p-8 rounded-3xl">
            <FaBolt className="text-4xl text-yellow-400 mb-6" />
            <h3 className="text-xl font-bold mb-4">Instant Execution</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Proprietary routing algorithms ensure your orders are executed at the best possible price across all supported exchanges.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#3861fb] to-[#2a50d8] rounded-[3rem] p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Why Trade on BlueVult?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8 text-left">
                {[
                    "Lowest Fees in the Industry",
                    "24/7 Priority Customer Support",
                    "Advanced Trading Tools",
                    "Regulated & Compliant"
                ].map(feature => (
                    <div key={feature} className="flex items-center gap-2 bg-white/10 p-3 rounded-2xl">
                        <FaCheckCircle className="text-white" />
                        <span className="text-sm font-semibold">{feature}</span>
                    </div>
                ))}
            </div>
            <Link to="/signUp">
                <button className="bg-white text-[#3861fb] px-8 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105">
                    Start Trading Now
                </button>
            </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Exchanges;
