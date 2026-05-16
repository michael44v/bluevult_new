import React from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { FaBook, FaVideo, FaLightbulb, FaSearch, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const categories = [
  { name: "Getting Started", count: 12, icon: FaLightbulb, color: "text-yellow-400" },
  { name: "Trading 101", count: 24, icon: FaBook, color: "text-blue-400" },
  { name: "Video Tutorials", count: 15, icon: FaVideo, color: "text-red-400" },
  { name: "Advanced Strategies", count: 8, icon: FaBook, color: "text-purple-400" },
];

const articles = [
  {
    title: "What is Bitcoin? A Beginner's Guide",
    excerpt: "Everything you need to know about the world's first cryptocurrency.",
    category: "Getting Started",
    readTime: "5 min"
  },
  {
    title: "Understanding Blockchain Technology",
    excerpt: "Learn the fundamentals of how distributed ledgers work.",
    category: "Trading 101",
    readTime: "8 min"
  },
  {
    title: "How to Secure Your Crypto Wallet",
    excerpt: "Best practices for keeping your digital assets safe from hackers.",
    category: "Getting Started",
    readTime: "6 min"
  },
  {
    title: "Introduction to Technical Analysis",
    excerpt: "Learn how to read charts and use indicators for better trading decisions.",
    category: "Advanced Strategies",
    readTime: "12 min"
  },
];

const Learn: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d1421] text-white">
      <Header />
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Learn Cryptocurrency</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
            Master the world of digital assets with our free educational resources, tutorials, and market insights.
          </p>
          <div className="relative max-w-xl mx-auto">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search for articles, guides..."
              className="w-full bg-[#17212d] border border-[#1a2535] rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-[#3861fb] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-[#17212d] border border-[#1a2535] p-6 rounded-3xl hover:border-[#3861fb] cursor-pointer transition-all">
              <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4 text-xl ${cat.color}`}>
                <cat.icon />
              </div>
              <h3 className="font-bold text-lg">{cat.name}</h3>
              <p className="text-gray-500 text-sm">{cat.count} Articles</p>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Featured Articles</h2>
            <button className="text-[#3861fb] font-bold text-sm hover:underline">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {articles.map((art, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-6 bg-[#17212d] border border-[#1a2535] p-6 rounded-[2rem] hover:border-white/20 transition-all cursor-pointer">
                <div className="w-full sm:w-48 h-32 bg-[#1e2d3d] rounded-2xl flex items-center justify-center">
                    <FaBook className="text-3xl text-gray-600" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#3861fb] bg-[#3861fb]/10 px-2 py-1 rounded">
                            {art.category}
                        </span>
                        <span className="text-[10px] text-gray-500">{art.readTime} read</span>
                    </div>
                    <h3 className="font-bold text-lg mb-2 leading-tight">{art.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{art.excerpt}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-white group cursor-pointer">
                        Read More <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#17212d] border border-[#1a2535] rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 shadow-2xl">
            <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6">BlueVult Crypto Glossary</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Confused by crypto slang? Our comprehensive glossary defines over 500 terms, from HODL to FOMO, smart contracts to sharding.
                </p>
                <button className="bg-white text-[#0d1421] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                    Explore Glossary
                </button>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-4">
                {["Blockchain", "DeFi", "NFTs", "Web3", "Staking", "DAO"].map(tag => (
                    <div key={tag} className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center font-bold text-gray-300">
                        {tag}
                    </div>
                ))}
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Learn;
