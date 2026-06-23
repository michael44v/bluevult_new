import React from "react";

interface RecentTradesProps {
  price: number;
}

const RecentTrades: React.FC<RecentTradesProps> = ({ price }) => {
  const generateTrades = (basePrice: number, count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const isUp = Math.random() > 0.5;
      const offset = (Math.random() - 0.5) * (basePrice * 0.001);
      const tradePrice = basePrice + offset;
      const amount = Math.random() * 1.5 + 0.001;
      const time = new Date(Date.now() - i * 1000).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return {
        price: tradePrice,
        amount: amount,
        time: time,
        isUp: isUp
      };
    });
  };

  const trades = generateTrades(price, 25);

  return (
    <div className="bg-[#0a1120] rounded-xl border border-white/5 flex flex-col h-full text-[11px]">
      <div className="p-3 border-b border-white/5 text-gray-500 font-bold uppercase tracking-wider">
        Recent Trades
      </div>
      <div className="p-3 flex justify-between text-gray-500 font-bold uppercase tracking-wider">
        <span>Price (USDT)</span>
        <span>Size</span>
        <span>Time</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {trades.map((trade, i) => (
          <div key={i} className="flex justify-between px-3 py-1 hover:bg-white/5 transition-colors">
            <span className={trade.isUp ? "text-green-500" : "text-red-500"}>{trade.price.toFixed(2)}</span>
            <span className="text-gray-300">{trade.amount.toFixed(4)}</span>
            <span className="text-gray-500">{trade.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTrades;
