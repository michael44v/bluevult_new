import React from "react";

interface OrderBookProps {
  symbol: string;
  price: number;
}

const OrderBook: React.FC<OrderBookProps> = ({ symbol, price }) => {
  // Generate mock order book data based on current price
  const generateOrders = (basePrice: number, count: number, isAsks: boolean) => {
    return Array.from({ length: count }).map((_, i) => {
      const offset = (i + 1) * (basePrice * 0.0001);
      const orderPrice = isAsks ? basePrice + offset : basePrice - offset;
      const amount = Math.random() * 2 + 0.01;
      return {
        price: orderPrice,
        amount: amount,
        total: orderPrice * amount
      };
    });
  };

  const asks = generateOrders(price, 12, true).reverse();
  const bids = generateOrders(price, 12, false);

  return (
    <div className="bg-[#0a1120] rounded-xl border border-white/5 flex flex-col h-full text-[11px]">
      <div className="p-3 border-b border-white/5 flex justify-between text-gray-500 font-bold uppercase tracking-wider">
        <span>Price (USDT)</span>
        <span>Size({symbol})</span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Asks (Sells) */}
        <div className="flex-1 flex flex-col justify-end">
          {asks.map((order, i) => (
            <div key={i} className="relative flex justify-between px-3 py-0.5 hover:bg-white/5 group cursor-pointer">
              <div
                className="absolute right-0 top-0 bottom-0 bg-red-500/10 transition-all duration-300"
                style={{ width: `${Math.min(order.amount * 40, 100)}%` }}
              />
              <span className="text-red-500 relative z-10">{order.price.toFixed(2)}</span>
              <span className="text-gray-300 relative z-10">{order.amount.toFixed(4)}</span>
            </div>
          ))}
        </div>

        {/* Current Price */}
        <div className="py-2 px-3 bg-white/5 flex items-center gap-2">
          <span className={`text-lg font-bold ${Math.random() > 0.5 ? 'text-green-500' : 'text-red-500'}`}>
            {price.toLocaleString()}
          </span>
          <span className="text-gray-500 text-[10px]">≈ ${price.toLocaleString()}</span>
        </div>

        {/* Bids (Buys) */}
        <div className="flex-1">
          {bids.map((order, i) => (
            <div key={i} className="relative flex justify-between px-3 py-0.5 hover:bg-white/5 group cursor-pointer">
              <div
                className="absolute right-0 top-0 bottom-0 bg-green-500/10 transition-all duration-300"
                style={{ width: `${Math.min(order.amount * 40, 100)}%` }}
              />
              <span className="text-green-500 relative z-10">{order.price.toFixed(2)}</span>
              <span className="text-gray-300 relative z-10">{order.amount.toFixed(4)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
