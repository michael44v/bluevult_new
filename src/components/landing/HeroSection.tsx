import { ArrowRight, Shield, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import CryptoTicker from "./CryptoTicker";

import { Link } from "react-router-dom";


const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 min-h-[85vh] flex items-center">
        <div className="grid md:grid-cols-2 gap-12 w-full">

          {/* LEFT — TEXT (FIXED POSITION) */}
          <div className="flex flex-col justify-center">
            <span className="inline-block mb-4 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
              Smart Crypto Investment
            </span>
 
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-white">
              <br /> Invest in the <br />
              <span className="text-emerald-400">Future of Crypto</span>
            </h1>

            <p className="mt-6 text-lg text-slate-300 max-w-xl">
              Secure, transparent, and profitable crypto investment solutions
              trusted by thousands worldwide.
            </p>

            <div className="mt-8 flex gap-4">
               <Link
              to="/signUp">
              <button className="bg-blue-500 hover:bg-blue-800 text-slate-900 px-8 py-3 rounded-xl font-semibold">
                Start Investing
              </button></Link>
              <Link
              to="/signIn">
              <button className="border border-slate-600 text-white px-8 py-3 rounded-xl hover:border-slate-400">
                Learn More
              </button></Link>
            </div>
          </div>

          {/* RIGHT — IMAGE WITH GIF INSIDE */}
          <div className="relative flex justify-center items-center">
            {/* GIF / SCREEN */}
            <img
              src="https://cms-www.coinhouse.com/wp-content/uploads/2024/05/Bitcoin-1.png"   // ← your gif here
              alt="Live trading"
              className="absolute left-[18%] top-[18%] w-[300px] md:w-[300px] rounded-xl z-10"
            />

            {/* PHONE / HAND IMAGE */}
            <img
              src="https://binarium.com/assets/img/bps-hand.477.png"
              alt="Crypto phone"
              style={{marginTop:"70px"}}
              className="w-[300px] md:w-[380px] lg:w-[420px] drop-shadow-xl"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroSection;