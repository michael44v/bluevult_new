import React from "react";
import { Bot, Cpu, Zap, BarChart3, ShieldCheck } from "lucide-react";

const AITradingSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#0d1421] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium animate-pulse">
              <Zap className="w-4 h-4" />
              <span>Next-Gen Trading is Here</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Master the Markets with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                Advanced AI Trading Bots
              </span>
            </h2>

            <p className="text-lg text-gray-400 max-w-xl">
              Experience the power of automated intelligence. Our AI bots analyze millions of data points per second to execute trades with surgical precision, ensuring you never miss a profitable opportunity.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Cpu className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Smart Execution</h3>
                  <p className="text-sm text-gray-500">Ultra-low latency trade execution based on real-time neural analysis.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <BarChart3 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Predictive Insights</h3>
                  <p className="text-sm text-gray-500">Advanced pattern recognition to anticipate market trends before they happen.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <Bot className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">24/7 Automation</h3>
                  <p className="text-sm text-gray-500">Your personal trading assistant never sleeps, monitoring global markets 24/7.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <ShieldCheck className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Risk Management</h3>
                  <p className="text-sm text-gray-500">Automated stop-loss and hedging strategies to protect your capital.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all transform hover:scale-105 shadow-lg shadow-blue-600/20">
                Get Started with AI
              </button>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="relative bg-gradient-to-b from-[#1a2535] to-[#0d1421] rounded-[2rem] border border-white/5 p-8 overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
                alt="AI Trading Bot"
                className="w-full h-auto rounded-xl shadow-inner transform transition-transform hover:scale-105 duration-700"
              />

              {/* Floating UI Elements */}
              <div className="absolute top-12 left-12 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl animate-bounce duration-[3000ms]">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Bot Active</span>
                </div>
              </div>

              <div className="absolute bottom-12 right-12 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Success Rate</p>
                  <p className="text-2xl font-bold text-emerald-400">94.8%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AITradingSection;
