import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
}

const cryptoData: CryptoPrice[] = [
  { symbol: "BTC", name: "Bitcoin", price: 67432.18, change: 2.45, icon: "₿" },
  { symbol: "ETH", name: "Ethereum", price: 3892.54, change: -0.82, icon: "Ξ" },
  { symbol: "SOL", name: "Solana", price: 189.23, change: 5.67, icon: "◎" },
  { symbol: "BNB", name: "BNB", price: 612.89, change: 1.23, icon: "⬡" },
  { symbol: "XRP", name: "Ripple", price: 0.5423, change: -1.56, icon: "✕" },
  { symbol: "ADA", name: "Cardano", price: 0.4891, change: 3.21, icon: "₳" },
  { symbol: "AVAX", name: "Avalanche", price: 42.67, change: 4.12, icon: "△" },
  { symbol: "DOT", name: "Polkadot", price: 7.89, change: -0.45, icon: "●" },
  { symbol: "MATIC", name: "Polygon", price: 0.7234, change: 2.89, icon: "⬡" },
  { symbol: "LINK", name: "Chainlink", price: 14.56, change: 1.78, icon: "⬢" },
];

const CryptoTicker = () => {
  // Duplicate the data for seamless infinite scroll
  const duplicatedData = [...cryptoData, ...cryptoData];

  return (
    <div className="w-full overflow-hidden bg-card/50 border-y border-border/50 py-3">
      <div className="animate-ticker-scroll flex gap-8 whitespace-nowrap">
        {duplicatedData.map((crypto, index) => (
          <div
            key={`${crypto.symbol}-${index}`}
            className="flex items-center gap-3 px-4"
          >
            <span className="text-xl font-bold text-primary">{crypto.icon}</span>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">{crypto.symbol}</span>
              <span className="text-sm font-semibold text-foreground">
                ${crypto.price.toLocaleString()}
              </span>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                crypto.change >= 0 ? "text-chart-up" : "text-chart-down"
              }`}
            >
              {crypto.change >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{crypto.change >= 0 ? "+" : ""}{crypto.change}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoTicker;