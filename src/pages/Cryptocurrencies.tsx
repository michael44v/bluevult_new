import React, { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { SiBitcoin, SiEthereum, SiSolana, SiBinance, SiXrp, SiCardano, SiDogecoin, SiPolkadot } from "react-icons/si";
import { FaCircle, FaChartLine } from "react-icons/fa";
import { Link } from "react-router-dom";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  binanceSymbol: string;
  coingeckoId: string;
  price: string;
  rawPrice: number;
  change: string;
  changeRaw: number;
  icon: string | null;
  flash: "up" | "down" | null;
  marketCap?: string;
  volume24h?: string;
}

const ASSET_DEFS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", binanceSymbol: "btcusdt", coingeckoId: "bitcoin" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", binanceSymbol: "ethusdt", coingeckoId: "ethereum" },
  { id: "solana", name: "Solana", symbol: "SOL", binanceSymbol: "solusdt", coingeckoId: "solana" },
  { id: "ripple", name: "XRP", symbol: "XRP", binanceSymbol: "xrpusdt", coingeckoId: "ripple" },
  { id: "cardano", name: "Cardano", symbol: "ADA", binanceSymbol: "adausdt", coingeckoId: "cardano" },
  { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", binanceSymbol: "dogeusdt", coingeckoId: "dogecoin" },
  { id: "polkadot", name: "Polkadot", symbol: "DOT", binanceSymbol: "dotusdt", coingeckoId: "polkadot" },
  { id: "binancecoin", name: "BNB", symbol: "BNB", binanceSymbol: "bnbusdt", coingeckoId: "binancecoin" },
];

const COINGECKO_IDS = ASSET_DEFS.map(a => a.coingeckoId).join(",");

function fmtPrice(price: number, symbol: string): string {
  if (price === 0) return "—";
  if (price < 1) return price.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtLarge(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

const Cryptocurrencies: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    // Initial fetch
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINGECKO_IDS}&order=market_cap_desc&per_page=20&page=1&sparkline=false`)
      .then(r => r.json())
      .then((data: any[]) => {
        const mapped = ASSET_DEFS.map(def => {
          const coin = data.find(c => c.id === def.coingeckoId);
          return {
            ...def,
            rawPrice: coin?.current_price ?? 0,
            price: fmtPrice(coin?.current_price ?? 0, def.symbol),
            changeRaw: coin?.price_change_percentage_24h ?? 0,
            change: `${coin?.price_change_percentage_24h >= 0 ? "+" : ""}${coin?.price_change_percentage_24h?.toFixed(2)}%`,
            icon: coin?.image ?? null,
            marketCap: fmtLarge(coin?.market_cap ?? 0),
            volume24h: fmtLarge(coin?.total_volume ?? 0),
            flash: null
          } as Asset;
        });
        setAssets(mapped);
      })
      .catch(console.error);

    // WebSocket
    const streams = ASSET_DEFS.map(s => `${s.binanceSymbol}@trade`).join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connect, 3000);
      };
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.data?.s && msg.data?.p) {
          const symbol = msg.data.s.toLowerCase();
          const price = parseFloat(msg.data.p);
          const assetSymbol = symbol.replace("usdt", "").toUpperCase();

          setAssets(prev => {
            const idx = prev.findIndex(a => a.symbol === assetSymbol);
            if (idx === -1) return prev;
            const asset = prev[idx];
            const direction = price > asset.rawPrice ? "up" : price < asset.rawPrice ? "down" : null;
            const updated = [...prev];
            updated[idx] = {
              ...asset,
              rawPrice: price,
              price: fmtPrice(price, asset.symbol),
              flash: direction,
            };

            if (direction) {
              clearTimeout(flashTimers.current[assetSymbol]);
              flashTimers.current[assetSymbol] = setTimeout(() => {
                setAssets(d => {
                  const i = d.findIndex(a => a.symbol === assetSymbol);
                  if (i === -1) return d;
                  const c = [...d];
                  c[i] = { ...c[i], flash: null };
                  return c;
                });
              }, 700);
            }
            return updated;
          });
        }
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#0d1421] text-white">
      <Header />
      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">Cryptocurrency Prices</h1>
            <p className="text-gray-400">Real-time market data for the top digital assets.</p>
          </div>
          <div className="flex items-center gap-2 bg-[#17212d] px-4 py-2 rounded-full border border-[#1a2535]">
            <FaCircle className={`text-xs ${wsConnected ? "text-green-400 animate-pulse" : "text-yellow-400"}`} />
            <span className="text-sm font-medium">{wsConnected ? "Live Connection" : "Connecting..."}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {assets.slice(0, 4).map(asset => (
                <div key={asset.id} className="bg-[#17212d] border border-[#1a2535] p-6 rounded-3xl hover:border-[#3861fb] transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <img src={asset.icon!} alt="" className="w-8 h-8 rounded-full" />
                            <span className="font-bold">{asset.symbol}</span>
                        </div>
                        <span className={`text-sm font-bold ${asset.changeRaw >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {asset.change}
                        </span>
                    </div>
                    <div className={`text-2xl font-mono font-bold mb-2 transition-colors duration-200 ${asset.flash === 'up' ? 'text-green-400' : asset.flash === 'down' ? 'text-red-400' : 'text-white'}`}>
                        ${asset.price}
                    </div>
                    <div className="text-xs text-gray-500">Cap: {asset.marketCap}</div>
                </div>
            ))}
        </div>

        <div className="bg-[#17212d] border border-[#1a2535] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#1e2d3d] border-b border-[#1a2535]">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Asset</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">24h Change</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Market Cap</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Volume (24h)</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2535]">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-[#1e2d3d] transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={asset.icon!} alt="" className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="font-bold">{asset.name}</p>
                          <p className="text-xs text-gray-500">{asset.symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`font-mono font-bold transition-colors duration-200 ${asset.flash === 'up' ? 'text-green-400' : asset.flash === 'down' ? 'text-red-400' : 'text-white'}`}>
                        ${asset.price}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`font-bold ${asset.changeRaw >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {asset.change}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                      {asset.marketCap}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-400">
                      {asset.volume24h}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      <Link to="/signUp">
                        <button className="px-4 py-2 bg-[#3861fb] text-white text-xs font-bold rounded-xl hover:bg-[#2a50d8] transition-colors">
                          Trade
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cryptocurrencies;
