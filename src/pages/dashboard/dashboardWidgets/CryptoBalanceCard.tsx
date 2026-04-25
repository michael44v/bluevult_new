import { useEffect, useState } from "react";
import { CreditCard, DollarSign, ArrowUp, ArrowDown } from "react-feather";

const CryptoBalanceCard = ({ userBalance }) => {
  const [btcPrice, setBtcPrice] = useState(null);
  const [prevUsd, setPrevUsd] = useState(userBalance.usd);
  const [changePercent, setChangePercent] = useState(0);

  // Fetch live BTC price (using Coingecko API for simplicity)
  useEffect(() => {
    const fetchBtcPrice = async () => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        const data = await res.json();
        setBtcPrice(data.bitcoin.usd);
      } catch (err) {
        console.error("Error fetching BTC price:", err);
      }
    };

    fetchBtcPrice();
    const interval = setInterval(fetchBtcPrice, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Calculate % change of user assets
  useEffect(() => {
    const percent = ((userBalance.usd - prevUsd) / prevUsd) * 100;
   // setChangePercent(percent.toFixed(2));
    setPrevUsd(userBalance.usd);
  }, [userBalance.usd]);

  return (
    <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/80 p-6 rounded-2xl shadow-2xl border border-emerald-500/20 relative overflow-hidden">
      {/* Animated background "crypto vibes" */}
      <div className="absolute inset-0 opacity-20 animate-pulse bg-emerald-400/10 mix-blend-overlay pointer-events-none rounded-2xl"></div>

      <h2 className="text-2xl font-bold mb-4 text-emerald-400">Wallet</h2>

      {/* User Balances */}
      <div className="flex flex-col gap-3 mb-4">
        <span className="flex items-center gap-2 text-white">
          <CreditCard className="w-5 h-5 text-emerald-400" /> {userBalance.btc} BTC
        </span>
        <span className="flex items-center gap-2 text-white">
          <DollarSign className="w-5 h-5 text-emerald-400" /> ${userBalance.usd.toLocaleString()}
        </span>
      </div>

      {/* BTC Live Price */}
      {btcPrice && (
        <div className="flex items-center justify-between bg-slate-700/60 p-3 rounded-xl mb-3 border border-emerald-300/20">
          <span className="text-white font-medium">BTC Live Price:</span>
          <span className="text-emerald-400 font-semibold">${btcPrice.toLocaleString()}</span>
        </div>
      )}

      {/* % Change Widget */}
      <div
        className={`flex items-center justify-between p-3 rounded-xl border ${
          changePercent >= 0
            ? "bg-emerald-900/50 border-emerald-400/50"
            : "bg-red-900/50 border-red-400/50"
        }`}
      >
        <span className="font-medium text-white">Asset Change:</span>
        <span className="flex items-center gap-1 font-semibold">
          {changePercent >= 0 ? (
            <ArrowUp className="w-4 h-4 text-emerald-400 animate-pulse" />
          ) : (
            <ArrowDown className="w-4 h-4 text-red-400 animate-pulse" />
          )}
          {Math.abs(changePercent)}%
        </span>
      </div>

      {/* Optional crypto decorations */}
      <div className="absolute -right-8 -top-6 w-32 h-32 bg-emerald-400/20 rounded-full mix-blend-screen animate-spin-slow pointer-events-none"></div>
      <div className="absolute -left-10 bottom-0 w-40 h-40 bg-purple-400/10 rounded-full mix-blend-screen animate-spin-slow-slow pointer-events-none"></div>
    </div>
  );
};

export default CryptoBalanceCard;