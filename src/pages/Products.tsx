import React from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { FaWallet, FaChartPie, FaShieldAlt, FaMobileAlt, FaCode, FaUsers, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const products = [
  {
    title: "Secure Wallet",
    description: "Store, send, and receive over 100+ cryptocurrencies with military-grade encryption and cold storage support.",
    icon: FaWallet,
    color: "bg-blue-500/10 text-blue-400"
  },
  {
    title: "Portfolio Analytics",
    description: "Advanced charts and real-time tracking of your assets. Get deep insights into your trading performance.",
    icon: FaChartPie,
    color: "bg-purple-500/10 text-purple-400"
  },
  {
    title: "Institutional Security",
    description: "Multi-signature architecture and 2FA protection for every transaction. Your assets are insured and secure.",
    icon: FaShieldAlt,
    color: "bg-green-500/10 text-green-400"
  },
  {
    title: "Mobile App",
    description: "Trade on the go with our fully featured mobile application. Available for both iOS and Android.",
    icon: FaMobileAlt,
    color: "bg-yellow-500/10 text-yellow-400"
  },
  {
    title: "Trading API",
    description: "Connect your trading bots or custom applications with our high-throughput REST and WebSocket APIs.",
    icon: FaCode,
    color: "bg-red-500/10 text-red-400"
  },
  {
    title: "Affiliate Program",
    description: "Earn up to 40% commission by inviting friends. High-tier rewards for active community builders.",
    icon: FaUsers,
    color: "bg-teal-500/10 text-teal-400"
  }
];

const Products: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d1421] text-white">
      <Header />
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Ecosystem of Products</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Everything you need to trade, manage, and grow your crypto portfolio in one secure platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {products.map((product, idx) => (
            <div key={idx} className="group bg-[#17212d] border border-[#1a2535] p-8 rounded-[2.5rem] hover:border-[#3861fb] transition-all hover:-translate-y-2 duration-300 shadow-xl">
              <div className={`w-14 h-14 ${product.color} rounded-2xl flex items-center justify-center mb-6 text-2xl group-hover:scale-110 transition-transform`}>
                <product.icon />
              </div>
              <h3 className="text-xl font-bold mb-4">{product.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                {product.description}
              </p>
              <Link to="/signUp" className="flex items-center gap-2 text-[#3861fb] text-sm font-bold hover:gap-3 transition-all">
                Learn more <FaArrowRight />
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-[#17212d] border border-[#1a2535] rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 mb-20 shadow-2xl">
            <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6">BlueVult Wallet - Coming Soon</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Our next-generation non-custodial wallet is currently in beta. Get early access to the most secure way to manage your private keys and interact with DeFi protocols.
                </p>
                <div className="flex flex-wrap gap-4">
                    <button className="bg-[#3861fb] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#2a50d8] transition-colors">
                        Join Waitlist
                    </button>
                    <button className="border border-gray-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-white/5 transition-colors">
                        Read Whitepaper
                    </button>
                </div>
            </div>
            <div className="flex-1 w-full flex justify-center">
                <div className="relative w-64 h-64 bg-[#3861fb]/20 rounded-full flex items-center justify-center animate-pulse">
                    <FaWallet className="text-8xl text-[#3861fb]" />
                </div>
            </div>
        </div>

        <div className="text-center">
            <h2 className="text-2xl font-bold mb-8">Ready to explore our products?</h2>
            <Link to="/signUp">
                <button className="bg-white text-[#0d1421] px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-transform transform hover:scale-105">
                    Create Free Account
                </button>
            </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
