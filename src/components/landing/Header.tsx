import { useState, useEffect, useRef } from "react";
import { Menu, X, TrendingUp, Search, Bell, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

/* ─── Types ─── */
interface CoinTicker {
  id: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

interface GlobalData {
  active_cryptocurrencies: number;
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
  market_cap_percentage: Record<string, number>;
}

interface GlobalApiResponse {
  data: GlobalData;
}

interface NavLink {
  name: string;
  href: string;
  hasDropdown?: boolean;
}

/* ─── Constants ─── */
const COINS: string[] = [
  "bitcoin","ethereum","tether","binancecoin","solana",
  "ripple","usd-coin","cardano","avalanche-2","dogecoin",
];

/* ─── Helpers ─── */
const formatPrice = (p: number | null | undefined): string => {
  if (p == null) return "—";
  if (p >= 1000) return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return "$" + p.toFixed(2);
  return "$" + p.toFixed(4);
};

const formatChange = (c: number | null | undefined): string => {
  if (c == null) return "—";
  return (c >= 0 ? "+" : "") + c.toFixed(2) + "%";
};

const formatMarketCap = (v: number | null | undefined): string => {
  if (!v) return "—";
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  return "$" + (v / 1e6).toFixed(2) + "M";
};

/* ─── Component ─── */
export default function Header(): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [tickerData, setTickerData] = useState<CoinTicker[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalData | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  const navLinks: NavLink[] = [
    { name: "Cryptocurrencies", href: "/cryptocurrencies", hasDropdown: true },
    { name: "Exchanges", href: "/exchanges", hasDropdown: true },
    { name: "Community", href: "/community" },
    { name: "Products", href: "/products", hasDropdown: true },
    { name: "Learn", href: "/learn", hasDropdown: true },
  ];

  /* Fetch ticker coins */
  useEffect(() => {
    const fetchTicker = async (): Promise<void> => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COINS.join(",")}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`
        );
        const data: CoinTicker[] = await res.json();
        if (Array.isArray(data)) setTickerData(data);
      } catch (e) { console.error("Ticker fetch error:", e); }
    };
    fetchTicker();
    const interval = setInterval(fetchTicker, 30000);
    return () => clearInterval(interval);
  }, []);

  /* Fetch global stats */
  useEffect(() => {
    const fetchGlobal = async (): Promise<void> => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/global");
        const data: GlobalApiResponse = await res.json();
        if (data?.data) setGlobalStats(data.data);
      } catch (e) { console.error("Global fetch error:", e); }
    };
    fetchGlobal();
    const interval = setInterval(fetchGlobal, 60000);
    return () => clearInterval(interval);
  }, []);

  const doubledTicker: CoinTicker[] = [...tickerData, ...tickerData];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── GLOBAL STATS BAR — hidden on mobile, visible md+ ── */}
      <div className="hidden md:block border-b" style={{ background: "#0d1421", borderColor: "#1a2535" }}>
        <div className="max-w-screen-xl mx-auto px-4 h-9 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs overflow-hidden">
            {globalStats ? (
              <>
                <span style={{ color: "#8a919e" }}>
                  Cryptos:{" "}
                  <span style={{ color: "#eaecef" }} className="font-medium">
                    {globalStats.active_cryptocurrencies?.toLocaleString()}
                  </span>
                </span>
                <span className="hidden lg:inline" style={{ color: "#8a919e" }}>
                  Market Cap:{" "}
                  <span style={{ color: "#eaecef" }} className="font-medium">
                    {formatMarketCap(globalStats.total_market_cap?.usd)}
                  </span>
                  <span
                    className="ml-1 font-medium"
                    style={{ color: globalStats.market_cap_change_percentage_24h_usd >= 0 ? "#16c784" : "#ea3943" }}
                  >
                    {formatChange(globalStats.market_cap_change_percentage_24h_usd)}
                  </span>
                </span>
                <span className="hidden lg:inline" style={{ color: "#8a919e" }}>
                  24h Vol:{" "}
                  <span style={{ color: "#eaecef" }} className="font-medium">
                    {formatMarketCap(globalStats.total_volume?.usd)}
                  </span>
                </span>
                <span style={{ color: "#8a919e" }}>
                  BTC{" "}
                  <span style={{ color: "#eaecef" }} className="font-medium">
                    {globalStats.market_cap_percentage?.btc?.toFixed(1)}%
                  </span>
                  <span className="mx-1" style={{ color: "#3a4a5c" }}>·</span>
                  ETH{" "}
                  <span style={{ color: "#eaecef" }} className="font-medium">
                    {globalStats.market_cap_percentage?.eth?.toFixed(1)}%
                  </span>
                </span>
              </>
            ) : (
              <span style={{ color: "#8a919e" }} className="text-xs animate-pulse">Loading market data…</span>
            )}
          </div>
          <span className="text-xs font-semibold cursor-pointer" style={{ color: "#3861fb" }}>API</span>
        </div>
      </div>

      {/* ── MAIN NAVBAR ── */}
      <div className="border-b" style={{ background: "#17212d", borderColor: "#1a2535" }}>
        <div className="max-w-screen-xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3861fb, #3861fb)" }}
            >
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <span className="text-base md:text-lg font-bold" style={{ color: "#eaecef" }}>
              Blue<span style={{ color: "#3861fb" }}>Vult</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ color: "#8a919e" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#eaecef"; e.currentTarget.style.background = "#1e2d3d"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "#8a919e"; e.currentTarget.style.background = "transparent"; }}
              >
                {link.name}
                {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Search — always visible */}
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "#8a919e" }}
              onClick={() => setSearchOpen(!searchOpen)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1e2d3d"; (e.currentTarget as HTMLButtonElement).style.color = "#eaecef"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#8a919e"; }}
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Bell — hidden on mobile */}
            <button
              className="hidden md:flex w-8 h-8 rounded-lg items-center justify-center transition-colors"
              style={{ color: "#8a919e" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1e2d3d"; (e.currentTarget as HTMLButtonElement).style.color = "#eaecef"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#8a919e"; }}
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* Auth buttons — hidden on mobile */}
            <div className="hidden md:flex items-center gap-1.5">
              <div className="w-px h-5 mx-0.5" style={{ background: "#1e2d3d" }} />
              <Link to="/signIn">
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors"
                  style={{ color: "#8a919e", borderColor: "#2a3a4f", background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#eaecef"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#3861fb"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#8a919e"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#2a3a4f"; }}
                >
                  Log In
                </button>
              </Link>
              <Link to="/signUp">
                <button
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={{ background: "#3861fb", color: "#fff" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#2a50d8")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#3861fb")}
                >
                  Sign Up
                </button>
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg ml-1"
              style={{ color: "#8a919e" }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="border-t px-4 py-3" style={{ background: "#17212d", borderColor: "#1a2535" }}>
            <div
              className="max-w-screen-xl mx-auto flex items-center gap-3 rounded-xl px-4 py-2"
              style={{ background: "#0d1421", border: "1px solid #1e2d3d" }}
            >
              <Search className="w-4 h-4 shrink-0" style={{ color: "#8a919e" }} />
              <input
                autoFocus
                type="text"
                placeholder='Search "Bitcoin"'
                className="flex-1 bg-transparent text-sm outline-none"
                style={{ color: "#eaecef" }}
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="w-4 h-4" style={{ color: "#8a919e" }} />
              </button>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t" style={{ background: "#17212d", borderColor: "#1a2535" }}>
            {/* Mobile stats strip */}
            {globalStats && (
              <div
                className="flex items-center gap-3 px-4 py-2 text-xs overflow-x-auto"
                style={{ borderBottom: "1px solid #1a2535", background: "#0d1421" }}
              >
                <span style={{ color: "#8a919e" }} className="shrink-0">
                  Mkt Cap: <span style={{ color: "#eaecef" }} className="font-medium">{formatMarketCap(globalStats.total_market_cap?.usd)}</span>
                  <span className="ml-1 font-medium" style={{ color: globalStats.market_cap_change_percentage_24h_usd >= 0 ? "#16c784" : "#ea3943" }}>
                    {formatChange(globalStats.market_cap_change_percentage_24h_usd)}
                  </span>
                </span>
                <span className="shrink-0" style={{ color: "#3a4a5c" }}>·</span>
                <span style={{ color: "#8a919e" }} className="shrink-0">
                  BTC <span style={{ color: "#eaecef" }} className="font-medium">{globalStats.market_cap_percentage?.btc?.toFixed(1)}%</span>
                </span>
                <span className="shrink-0" style={{ color: "#3a4a5c" }}>·</span>
                <span style={{ color: "#8a919e" }} className="shrink-0">
                  ETH <span style={{ color: "#eaecef" }} className="font-medium">{globalStats.market_cap_percentage?.eth?.toFixed(1)}%</span>
                </span>
              </div>
            )}

            <nav className="flex flex-col px-4 py-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium"
                  style={{ color: "#8a919e" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown className="w-3 h-3" />}
                </Link>
              ))}
            </nav>

            <div className="flex gap-3 px-4 pb-4 pt-2 border-t" style={{ borderColor: "#1a2535" }}>
              <Link to="/signIn" className="flex-1">
                <button
                  className="w-full py-2.5 rounded-lg text-sm font-semibold border"
                  style={{ color: "#8a919e", borderColor: "#2a3a4f", background: "transparent" }}
                >
                  Log In
                </button>
              </Link>
              <Link to="/signUp" className="flex-1">
                <button
                  className="w-full py-2.5 rounded-lg text-sm font-semibold"
                  style={{ background: "#3861fb", color: "#fff" }}
                >
                  Sign Up
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── LIVE TICKER — hidden on mobile ── */}
      <div className="hidden sm:block border-b overflow-hidden" style={{ background: "#0d1421", borderColor: "#1a2535" }}>
        <div
          ref={tickerRef}
          className="flex items-center py-1.5"
          style={{ width: "max-content", animation: "tickerSlide 50s linear infinite" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "paused")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.animationPlayState = "running")}
        >
          {doubledTicker.map((coin, i) => {
            const change = coin.price_change_percentage_24h;
            const isUp = change >= 0;
            return (
              <div
                key={`${coin.id}-${i}`}
                className="flex items-center gap-1.5 px-4 cursor-pointer shrink-0"
                style={{ borderRight: "1px solid #1a2535" }}
              >
                <img
                  src={coin.image}
                  alt={coin.symbol}
                  className="w-3.5 h-3.5 rounded-full"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
                <span className="text-xs font-semibold uppercase" style={{ color: "#eaecef" }}>
                  {coin.symbol}
                </span>
                <span className="text-xs" style={{ color: "#eaecef" }}>
                  {formatPrice(coin.current_price)}
                </span>
                <span className="text-xs font-semibold" style={{ color: isUp ? "#16c784" : "#ea3943" }}>
                  {formatChange(change)}
                </span>
              </div>
            );
          })}
        </div>
        <style>{`
          @keyframes tickerSlide {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </header>
  );
}