import TopBar from '@/components/dashboard/TopBar';
import { useState, useEffect, useRef, useCallback } from "react";
import { FaBars, FaChartLine, FaCircle } from "react-icons/fa";
import { SiBitcoin, SiEthereum, SiSolana } from "react-icons/si";
import Sidebar from "./dashboardWidgets/Sidebar";
import Footer from "@/components/landing/Footer";
import { Link } from "react-router-dom";
import { ASSET_DEFS as ASSET_BASE_DEFS } from "@/constants/assets";

// ------------------------
// Types
// ------------------------
interface Asset {
  id: string;
  name: string;
  type: "Crypto" | "Stock";
  symbol: string;
  binanceSymbol: string | null; // null = no WS feed (stocks)
  coingeckoId: string | null;
  price: string;
  rawPrice: number;
  change: string;
  changeRaw: number;
  description: string;
  icon: string | null; // CoinGecko image URL
  flash: "up" | "down" | null;
  marketCap?: string;
  volume24h?: string;
  high24h?: string;
  low24h?: string;
}

const COINGECKO_IDS = "bitcoin,ethereum,solana";

// ------------------------
// Binance Multi-stream WebSocket hook
// ------------------------
function useBinanceLivePrices(
  symbols: string[],
  onTick: (symbol: string, price: number) => void
) {
  const wsRef = useRef<WebSocket | null>(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (symbols.length === 0) return;
    const streams = symbols.map(s => `${s}@trade`).join("/");
    const url = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    const connect = () => {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) connect();
        }, 3000);
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.data?.s && msg.data?.p) {
            const symbol = msg.data.s.toLowerCase();
            const price = parseFloat(msg.data.p);
            onTickRef.current(symbol, price);
          }
        } catch {}
      };
    };

    connect();
    return () => wsRef.current?.close();
  }, [symbols.join(",")]);

  return connected;
}

// ------------------------
// Price formatter
// ------------------------
function fmtPrice(price: number, symbol: string): string {
  if (price === 0) return "—";
  if (["xrp", "ada", "doge", "sol"].includes(symbol.toLowerCase()) && price < 500) {
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtLarge(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

// Asset icon component
function AssetIcon({ asset }: { asset: Asset }) {
  if (asset.icon) {
    return <img src={asset.icon} alt={asset.name} className="w-9 h-9 rounded-full" />;
  }
  if (asset.symbol === "BTC") return <SiBitcoin className="text-[#F7931A] text-3xl" />;
  if (asset.symbol === "ETH") return <SiEthereum className="text-[#627EEA] text-3xl" />;
  if (asset.symbol === "SOL") return <SiSolana className="text-[#00FFA3] text-3xl" />;
  return <FaChartLine className="text-yellow-500 text-3xl" />;
}

// ------------------------
// Main MarketsPage Component
// ------------------------
const MarketsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"All" | "Crypto" | "Stock">("All");
  const flashTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const t = setTimeout(() => setShowDisclaimer(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // ------------------------
  // Seed from CoinGecko
  // ------------------------
  useEffect(() => {
    const seed = ASSET_BASE_DEFS.map(def => ({
      ...def,
      price: "Loading...",
      rawPrice: 0,
      change: "—",
      changeRaw: 0,
      icon: null,
      flash: null,
    })) as Asset[];
    setAssets(seed);

    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINGECKO_IDS}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
    )
      .then(r => r.json())
      .then((data: any[]) => {
        setAssets(prev =>
          prev.map(asset => {
            const coin = data.find(c => c.id === asset.coingeckoId);
            if (!coin) return asset;
            return {
              ...asset,
              rawPrice: coin.current_price,
              price: fmtPrice(coin.current_price, asset.symbol),
              changeRaw: coin.price_change_percentage_24h ?? 0,
              change: `${coin.price_change_percentage_24h >= 0 ? "+" : ""}${coin.price_change_percentage_24h?.toFixed(2)}%`,
              icon: coin.image,
              marketCap: fmtLarge(coin.market_cap),
              volume24h: fmtLarge(coin.total_volume),
              high24h: `$${fmtPrice(coin.high_24h, asset.symbol)}`,
              low24h: `$${fmtPrice(coin.low_24h, asset.symbol)}`,
            };
          })
        );
      })
      .catch(console.error);

    // Seed stocks with static prices
    setAssets(prev =>
      prev.map(asset => {
        if (asset.type !== "Stock") return asset;
        const staticPrices: Record<string, { price: number; change: number }> = {
          AAPL: { price: 189.3, change: 0.72 },
          TSLA: { price: 177.8, change: -1.15 },
          NVDA: { price: 875.2, change: 1.25 },
          MSFT: { price: 415.5, change: 0.45 },
          AMZN: { price: 178.2, change: -0.32 },
          GOOGL: { price: 154.1, change: 0.88 },
          META: { price: 505.1, change: 1.12 },
        };
        const s = staticPrices[asset.symbol];
        if (!s) return asset;
        return {
          ...asset,
          rawPrice: s.price,
          price: fmtPrice(s.price, asset.symbol),
          changeRaw: s.change,
          change: `${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%`,
        };
      })
    );
  }, []);

  // ------------------------
  // Live tick handler
  // ------------------------
  const handleTick = useCallback((binanceSymbol: string, price: number) => {
    setLastUpdated(new Date());
    const assetSymbol = binanceSymbol.replace("usdt", "").toUpperCase();

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
  }, []);

  const binanceSymbols = ASSET_BASE_DEFS.filter(a => a.type === "Crypto" && a.binanceSymbol).map(a => a.binanceSymbol!);
  const wsConnected = useBinanceLivePrices(binanceSymbols, handleTick);

  const displayed = filter === "All" ? assets : assets.filter(a => a.type === filter);

  return (
    <div className={`${dark ? "dark" : ""} flex flex-col min-h-screen bg-gray-100 dark:bg-[#0f111b]`}>
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#020617] shadow-lg z-50 transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 max-w-full">
          <TopBar title="Markets" onSidebarToggle={() => setSidebarOpen(true)} />

          {/* Disclaimer */}
          {showDisclaimer && (
            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-[#0a1120] p-6 rounded-2xl shadow-lg max-w-sm text-center border border-white/10">
                <h2 className="font-bold text-lg text-gray-900 dark:text-white mb-2">⚠️ Disclaimer</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                  Trading involves risk. Please invest responsibly and only with funds you can afford to lose. Past performance is not indicative of future results.
                </p>
                <button
                  onClick={() => setShowDisclaimer(false)}
                  className="px-5 py-2 bg-[#00C4B4] text-white rounded-lg hover:bg-teal-500 transition font-semibold"
                >
                  Got it
                </button>
              </div>
            </div>
          )}

          <div className="p-6 space-y-6 mt-16">

            {/* Header row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FaCircle className={`text-[10px] ${wsConnected ? "text-green-400 animate-pulse" : "text-yellow-400"}`} />
                  <span className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
                    {wsConnected ? "Live Prices" : "Connecting..."}
                  </span>
                </div>
                {lastUpdated && (
                  <span className="text-xs text-gray-500">
                    · Updated {lastUpdated.toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Filter tabs */}
              <div className="flex gap-2">
                {(["All", "Crypto", "Stock"] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      filter === f
                        ? "bg-[#00C4B4] text-white"
                        : "bg-white dark:bg-[#0a1120] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10 hover:border-[#00C4B4]"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayed.map((asset) => (
                <div
                  key={asset.id}
                  className={`bg-white dark:bg-[#0a1120] p-5 rounded-2xl shadow-lg flex flex-col gap-3 border transition-all duration-300 ${
                    asset.flash === "up"
                      ? "border-green-400/50 ring-1 ring-green-400/30 bg-green-50 dark:bg-green-400/5"
                      : asset.flash === "down"
                      ? "border-red-400/50 ring-1 ring-red-400/30 bg-red-50 dark:bg-red-400/5"
                      : "border-gray-100 dark:border-white/5"
                  }`}
                >
                  {/* Card header */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <AssetIcon asset={asset} />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-base leading-tight">{asset.name}</p>
                        <p className="text-xs text-gray-400">{asset.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold text-lg transition-colors duration-200 ${
                        asset.flash === "up" ? "text-green-400"
                        : asset.flash === "down" ? "text-red-400"
                        : "text-gray-900 dark:text-white"
                      }`}>
                        ${asset.price}
                      </p>
                      <span className={`text-sm font-semibold flex items-center justify-end gap-1 ${asset.changeRaw >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {asset.changeRaw >= 0 ? "▲" : "▼"} {asset.change}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{asset.description}</p>

                  {/* Stats row (crypto only) */}
                  {asset.type === "Crypto" && (
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Market Cap", value: asset.marketCap },
                        { label: "Volume 24h", value: asset.volume24h },
                        { label: "24h High", value: asset.high24h },
                        { label: "24h Low", value: asset.low24h },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 dark:bg-[#1a1d2a] rounded-xl px-3 py-2">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
                          <p className="text-xs font-semibold text-gray-900 dark:text-white">{value ?? "—"}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-gray-100 dark:bg-[#1a1d2a] px-2 py-1 rounded-lg text-[10px] font-medium text-gray-500 dark:text-gray-400">
                      {asset.type}
                    </span>
                    {asset.type === "Crypto" && (
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${wsConnected ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"}`}>
                        {wsConnected ? "● Live" : "● Connecting"}
                      </span>
                    )}
                    {asset.type === "Stock" && (
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-lg text-[10px] font-medium">Delayed</span>
                    )}
                  </div>

                  <Link to={`/trade?asset=${asset.symbol}`}>
                    <button className="w-full mt-1 px-4 py-2.5 bg-[#00C4B4] text-white rounded-xl hover:bg-teal-500 active:scale-95 transition font-semibold text-sm">
                      Trade Now
                    </button>
                  </Link>
                </div>
              ))}
            </div>

            {/* Full Table */}
            <div className="overflow-x-auto mt-6">
              <table className="min-w-full bg-white dark:bg-[#0a1120] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-white/5">
                <thead className="bg-gray-50 dark:bg-[#1a1d2a]">
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">24h Change</th>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Market Cap</th>
                    <th className="text-left p-3 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((asset, idx) => (
                    <tr
                      key={asset.id}
                      className={`border-b border-gray-100 dark:border-gray-800 transition-all duration-300 ${
                        asset.flash === "up"
                          ? "bg-green-50 dark:bg-green-400/5"
                          : asset.flash === "down"
                          ? "bg-red-50 dark:bg-red-400/5"
                          : "hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <td className="p-3 text-gray-400 text-sm">{idx + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                            <AssetIcon asset={asset} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{asset.name}</p>
                            <p className="text-[10px] text-gray-400">{asset.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          asset.type === "Crypto"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-yellow-500/10 text-yellow-400"
                        }`}>
                          {asset.type}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-mono font-bold text-sm transition-colors duration-200 ${
                          asset.flash === "up" ? "text-green-400"
                          : asset.flash === "down" ? "text-red-400"
                          : "text-gray-900 dark:text-white"
                        }`}>
                          ${asset.price}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold text-sm flex items-center gap-1 ${asset.changeRaw >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {asset.changeRaw >= 0 ? "▲" : "▼"} {asset.change}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 dark:text-gray-400 text-sm hidden md:table-cell">
                        {asset.marketCap ?? "—"}
                      </td>
                      <td className="p-3">
                        <Link to={`/trade?asset=${asset.symbol}`}>
                          <button className="px-3 py-1.5 bg-[#00C4B4] text-white rounded-lg hover:bg-teal-500 transition text-xs font-semibold active:scale-95">
                            Trade
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-[#0a1120] rounded-2xl border border-gray-200 dark:border-white/5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">📌 Notes:</h3>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-xs space-y-1">
                <li>Crypto prices update in real-time via Binance WebSocket streams.</li>
                <li>Stock prices are delayed and updated periodically.</li>
                <li>Invest responsibly — only risk what you can afford to lose.</li>
                <li>Past performance is not indicative of future results.</li>
              </ul>
            </div>

            <div className="p-6 space-y-6">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketsPage;