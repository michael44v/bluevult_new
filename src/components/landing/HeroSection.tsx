import { useState, useEffect, useRef, useCallback, JSX } from "react";
import { ArrowRight, Star, Search, ChevronUp, ChevronDown, X } from "lucide-react";
import { Link } from "react-router-dom";
import MarketStatsBanner from "../ui/Marketstatsbanner";
import { useSystemSettings } from "@/hooks/useAdminData";

/* ─── Types ─── */
interface Coin {
  id: string; symbol: string; name: string; image: string;
  current_price: number; market_cap: number; market_cap_rank: number;
  total_volume: number; high_24h: number; low_24h: number;
  price_change_percentage_24h: number;
  price_change_percentage_1h_in_currency: number;
  price_change_percentage_7d_in_currency: number;
  sparkline_in_7d?: { price: number[] };
  [key: string]: unknown;
}
interface GlobalData {
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
  market_cap_percentage: Record<string, number>;
}
interface GlobalApiResponse { data: GlobalData; }
type SortDir = "asc" | "desc";

/* ─── Constants ─── */
const UP     = "#16c784";
const DOWN   = "#ea3943";
const SLATE  = "#0d1421";
const SLATE2 = "#17212d";
const BORDER = "#1a2535";
const TEXT   = "#eaecef";
const MUTED  = "#8a919e";
const BLUE   = "#3861fb";

const TOP_COINS = [
  "bitcoin","ethereum","tether","binancecoin","solana",
  "ripple","usd-coin","cardano","avalanche-2","dogecoin",
  "polkadot","chainlink","litecoin","shiba-inu","tron","SoValueEth"
];

/* ─── TradingView symbol map ─── */
const TV_SYMBOL: Record<string, string> = {
  bitcoin:      "BINANCE:BTCUSDT",
  ethereum:     "BINANCE:ETHUSDT",
  tether:       "BINANCE:USDTUSD",
  binancecoin:  "BINANCE:BNBUSDT",
  solana:       "BINANCE:SOLUSDT",
  ripple:       "BINANCE:XRPUSDT",
  "usd-coin":   "BINANCE:USDCUSD",
  cardano:      "BINANCE:ADAUSDT",
  "avalanche-2":"BINANCE:AVAXUSDT",
  dogecoin:     "BINANCE:DOGEUSDT",
  polkadot:     "BINANCE:DOTUSDT",
  chainlink:    "BINANCE:LINKUSDT",
  litecoin:     "BINANCE:LTCUSDT",
  "shiba-inu":  "BINANCE:SHIBUSDT",
  tron:         "BINANCE:TRXUSDT",
  "SoValueEth":     "BINANCE:ETHUSDT",
};

/* ─── Helpers ─── */
const fmt = (p: number | null | undefined): string => {
  if (p == null) return "—";
  if (p >= 1000) return "$" + p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1)    return "$" + p.toFixed(4);
  return "$" + p.toFixed(6);
};
const fmtCap = (v: number | null | undefined): string => {
  if (!v) return "—";
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9)  return "$" + (v / 1e9).toFixed(2)  + "B";
  return "$" + (v / 1e6).toFixed(2) + "M";
};
const fmtPct = (c: number | null | undefined): string => {
  if (c == null) return "—";
  return (c >= 0 ? "▲ " : "▼ ") + Math.abs(c).toFixed(2) + "%";
};
const pctColor = (v: number) => (v >= 0 ? UP : DOWN);

/* ─── Sparkline ─── */
function Sparkline({ data, color }: { data: number[]; color: string }): JSX.Element {
  if (!data || data.length < 2) return <div style={{ width: 80, height: 32 }} />;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <path d={"M" + pts.join(" L")} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── TradingView Mini Chart ─── */
function LiveChart({ coin }: { coin: Coin }): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const symbol = TV_SYMBOL[coin.id] ?? `BINANCE:${coin.symbol.toUpperCase()}USDT`;

  useEffect(() => {
    if (!containerRef.current) return;
    // Clear previous widget
    containerRef.current.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container";
    wrapper.style.cssText = "width:100%;height:100%";

    const inner = document.createElement("div");
    inner.className = "tradingview-widget-container__widget";
    inner.style.cssText = "width:100%;height:100%";
    wrapper.appendChild(inner);

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width:         "100%",
      height:        "100%",
      locale:        "en",
      dateRange:     "7D",
      colorTheme:    "dark",
      isTransparent: true,
      autosize:      true,
      noTimeScale:   false,
    });

    wrapper.appendChild(script);
    containerRef.current.appendChild(wrapper);
  }, [symbol]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", minHeight: 160 }}
    />
  );
}

/* ─── SortIcon ─── */
function SortIcon({ col, sortBy, sortDir }: { col: string; sortBy: string; sortDir: SortDir }): JSX.Element {
  if (sortBy !== col) return <span style={{ color: "#3a4a5c" }}>↕</span>;
  return sortDir === "desc"
    ? <ChevronDown className="w-3 h-3 inline" style={{ color: BLUE }} />
    : <ChevronUp   className="w-3 h-3 inline" style={{ color: BLUE }} />;
}

/* ─── Mobile Coin Card ─── */
function MobileCoinCard({ coin, isSelected, onClick }: { coin: Coin; isSelected: boolean; onClick: () => void }) {
  const d24      = coin.price_change_percentage_24h ?? 0;
  const d7       = coin.price_change_percentage_7d_in_currency ?? 0;
  const sparkData = (coin.sparkline_in_7d?.price ?? []).filter((_, i) => i % 8 === 0);
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? "rgba(56,97,251,0.06)" : "transparent" }}
    >
      <div className="w-6 text-center text-xs shrink-0" style={{ color: MUTED }}>{coin.market_cap_rank}</div>
      <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full shrink-0"
        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate" style={{ color: TEXT }}>{coin.name}</div>
        <div className="text-xs uppercase" style={{ color: MUTED }}>{coin.symbol}</div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold" style={{ color: TEXT }}>{fmt(coin.current_price)}</div>
        <div className="text-xs font-semibold" style={{ color: pctColor(d24) }}>
          {d24 >= 0 ? "▲" : "▼"} {Math.abs(d24).toFixed(2)}%
        </div>
      </div>
      <div className="shrink-0 hidden xs:block">
        <Sparkline data={sparkData} color={pctColor(d7)} />
      </div>
    </div>
  );
}

/* ─── Mobile Coin Detail Drawer ─── */
function CoinDetailDrawer({ coin, onClose }: { coin: Coin | null; onClose: () => void }) {
  if (!coin) return null;
  const d24 = coin.price_change_percentage_24h ?? 0;
  const d7  = coin.price_change_percentage_7d_in_currency ?? 0;
  const h1  = coin.price_change_percentage_1h_in_currency ?? 0;
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl p-6"
        style={{ background: SLATE2, border: `1px solid ${BORDER}` }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: BORDER }} />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={coin.image} alt={coin.name} className="w-10 h-10 rounded-full" />
            <div>
              <div className="font-bold" style={{ color: TEXT }}>{coin.name}</div>
              <div className="text-xs uppercase" style={{ color: MUTED }}>{coin.symbol}/USD</div>
            </div>
          </div>
          <button onClick={onClose}><X className="w-5 h-5" style={{ color: MUTED }} /></button>
        </div>
        <div className="text-2xl font-extrabold mb-1" style={{ color: TEXT }}>{fmt(coin.current_price)}</div>
        <div className="text-sm font-bold mb-5" style={{ color: pctColor(d24) }}>{fmtPct(d24)} (24h)</div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { l: "1h Change", v: fmtPct(h1),              c: pctColor(h1) },
            { l: "7d Change", v: fmtPct(d7),              c: pctColor(d7) },
            { l: "Market Cap",v: fmtCap(coin.market_cap), c: TEXT },
            { l: "24h Volume",v: fmtCap(coin.total_volume),c: TEXT },
            { l: "24h High",  v: fmt(coin.high_24h),      c: UP },
            { l: "24h Low",   v: fmt(coin.low_24h),       c: DOWN },
          ].map((s) => (
            <div key={s.l} className="rounded-xl p-3" style={{ background: "#1e2d3d" }}>
              <div className="text-xs mb-1" style={{ color: MUTED }}>{s.l}</div>
              <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function HeroSection(): JSX.Element {
  const { data: settings = [] } = useSystemSettings();
  const platformName = (Array.isArray(settings) && settings.find(s => s.setting_key === "platform_name")?.setting_value) || "BlueVult";

  const [coins, setCoins]               = useState<Coin[]>([]);
  const [globalStats, setGlobalStats]   = useState<GlobalData | null>(null);
  const [featuredCoin, setFeaturedCoin] = useState<Coin | null>(null);
  const [activeTab, setActiveTab]       = useState("all");
  const [sortBy, setSortBy]             = useState("market_cap");
  const [sortDir, setSortDir]           = useState<SortDir>("desc");
  const [loading, setLoading]           = useState(true);
  const [lastUpdated, setLastUpdated]   = useState<Date | null>(null);
  const [searchQuery, setSearchQuery]   = useState("");
  const [mobileDrawerCoin, setMobileDrawerCoin] = useState<Coin | null>(null);
  const [isMobile, setIsMobile]         = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const fetchCoins = useCallback(async () => {
    try {
      const res  = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${TOP_COINS.join(",")}&order=market_cap_desc&per_page=15&page=1&sparkline=true&price_change_percentage=1h,24h,7d`
      );
      const data: Coin[] = await res.json();
      if (Array.isArray(data)) {
        setCoins(data);
        setLastUpdated(new Date());
        setFeaturedCoin((prev) => (!prev ? data[0] : data.find((c) => c.id === prev.id) ?? prev));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  const fetchGlobal = useCallback(async () => {
    try {
      const res  = await fetch("https://api.coingecko.com/api/v3/global");
      const data: GlobalApiResponse = await res.json();
      if (data?.data) setGlobalStats(data.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    fetchCoins(); fetchGlobal();
    const i1 = setInterval(fetchCoins,  30_000);
    const i2 = setInterval(fetchGlobal, 60_000);
    return () => { clearInterval(i1); clearInterval(i2); };
  }, [fetchCoins, fetchGlobal]);

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir((p) => (p === "desc" ? "asc" : "desc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const filtered = coins.filter((c) =>
    !searchQuery ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortBy] as number) ?? 0;
    const bv = (b[sortBy] as number) ?? 0;
    return sortDir === "desc" ? bv - av : av - bv;
  });

  const tabs = [
    { key: "all",       label: "All Cryptos" },
    { key: "defi",      label: "DeFi"        },
    { key: "nfts",      label: "NFTs"        },
    { key: "metaverse", label: "Metaverse"   },
    { key: "layer1",    label: "Layer 1"     },
  ];

  const tableColumns = [
    { key: "current_price",                          label: "Price"   },
    { key: "price_change_percentage_1h_in_currency", label: "1h%"    },
    { key: "price_change_percentage_24h",            label: "24h%"   },
    { key: "price_change_percentage_7d_in_currency", label: "7d%"    },
    { key: "market_cap",                             label: "Mkt Cap" },
  ];

  return (
    <main style={{ background: SLATE, minHeight: "100vh", paddingTop: 134, fontFamily: "'Inter', sans-serif" }}>

      {/* ══ HERO BANNER ══ */}
      <section style={{ background: SLATE2, borderBottom: `1px solid ${BORDER}` }}>
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <MarketStatsBanner />

          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold mb-1" style={{ color: TEXT }}>
              Today's Cryptocurrency Prices by Market Cap
            </h1>
            {globalStats && (
              <p className="text-sm" style={{ color: MUTED }}>
                Global crypto market cap:{" "}
                <span style={{ color: TEXT, fontWeight: 600 }}>{fmtCap(globalStats.total_market_cap?.usd)}</span>,{" "}
                <span style={{ color: pctColor(globalStats.market_cap_change_percentage_24h_usd ?? 0), fontWeight: 600 }}>
                  {Math.abs(globalStats.market_cap_change_percentage_24h_usd ?? 0).toFixed(2)}%
                </span>{" "}in 24h.
              </p>
            )}
          </div>

          {/* Two-column hero */}
          <div className="grid md:grid-cols-2 gap-6 items-start">

            {/* LEFT */}
            <div>
              {globalStats && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {[
                    { label: "Market Cap", value: fmtCap(globalStats.total_market_cap?.usd), change: globalStats.market_cap_change_percentage_24h_usd },
                    { label: "24h Volume", value: fmtCap(globalStats.total_volume?.usd) },
                    { label: "BTC Dom.",   value: `${(globalStats.market_cap_percentage?.btc ?? 0).toFixed(1)}%` },
                    { label: "ETH Dom.",   value: `${(globalStats.market_cap_percentage?.eth ?? 0).toFixed(1)}%` },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl px-4 py-3" style={{ background: "#1e2d3d", minWidth: 100 }}>
                      <div className="text-xs font-medium mb-1" style={{ color: MUTED }}>{s.label}</div>
                      <div className="text-base font-bold" style={{ color: TEXT }}>{s.value}</div>
                      {s.change != null && (
                        <div className="text-xs font-semibold mt-0.5" style={{ color: pctColor(s.change) }}>
                          {fmtPct(s.change)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <h2 className="text-3xl md:text-4xl font-extrabold mb-3 leading-tight" style={{ color: TEXT }}>
                Invest in the <span style={{ color: "#10b981" }}>Future of Crypto</span>
              </h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: MUTED, maxWidth: 440 }}>
                Secure, transparent, and profitable crypto investment solutions trusted by thousands worldwide.
              </p>

              <div className="flex gap-3 flex-wrap">
                <Link to="/signUp">
                  <button
                    className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
                    style={{ background: BLUE, color: "#fff" }}
                  >
                    Start Investing <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/signIn">
                  <button
                    className="px-6 py-3 rounded-xl text-sm font-bold border transition-all"
                    style={{ color: TEXT, borderColor: "#2a3a4f", background: "transparent" }}
                  >
                    Learn More
                  </button>
                </Link>
              </div>

              <div className="flex items-center gap-2 mt-5">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: UP }} />
                <span className="text-xs" style={{ color: MUTED }}>
                  Live data · Updates every 30s{lastUpdated && ` · Last: ${lastUpdated.toLocaleTimeString()}`}
                </span>
              </div>
            </div>

            {/* RIGHT: TradingView Featured Chart */}
            <div>
              {featuredCoin ? (
                <div className="rounded-2xl p-5" style={{ background: "#1e2d3d", border: `1px solid ${BORDER}` }}>
                  {/* Coin selector tabs */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {coins.slice(0, 5).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setFeaturedCoin(c)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: featuredCoin.id === c.id ? BLUE : "#17212d",
                          color:      featuredCoin.id === c.id ? "#fff" : MUTED,
                          border:     `1px solid ${featuredCoin.id === c.id ? BLUE : BORDER}`,
                        }}
                      >
                        <img src={c.image} alt={c.symbol} className="w-3.5 h-3.5 rounded-full"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                        {c.symbol.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Coin header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img src={featuredCoin.image} alt={featuredCoin.name} className="w-8 h-8 rounded-full" />
                      <div>
                        <div className="font-bold text-sm" style={{ color: TEXT }}>{featuredCoin.name}</div>
                        <div className="text-xs uppercase" style={{ color: MUTED }}>{featuredCoin.symbol}/USD</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold" style={{ color: TEXT }}>{fmt(featuredCoin.current_price)}</div>
                      <div className="text-xs font-bold" style={{ color: pctColor(featuredCoin.price_change_percentage_24h ?? 0) }}>
                        {fmtPct(featuredCoin.price_change_percentage_24h)}
                        <span className="ml-1 font-normal" style={{ color: MUTED }}>24h</span>
                      </div>
                    </div>
                  </div>

                  {/* TradingView chart */}
                  <div style={{ height: 160, marginTop: 12 }}>
                    <LiveChart coin={featuredCoin} />
                  </div>

                  {/* Stats footer */}
                  <div className="flex justify-between mt-3 pt-3 text-xs" style={{ borderTop: `1px solid ${BORDER}` }}>
                    {[
                      { l: "24h High", v: fmt(featuredCoin.high_24h) },
                      { l: "24h Low",  v: fmt(featuredCoin.low_24h)  },
                      { l: "Mkt Cap",  v: fmtCap(featuredCoin.market_cap) },
                      { l: "Volume",   v: fmtCap(featuredCoin.total_volume) },
                    ].map((s) => (
                      <div key={s.l} className="text-center">
                        <div style={{ color: MUTED }}>{s.l}</div>
                        <div className="font-semibold mt-0.5" style={{ color: TEXT }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl animate-pulse" style={{ background: "#1e2d3d", height: 300 }} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MARKET TABLE ══ */}
      <section className="max-w-screen-xl mx-auto px-4 py-6">

        {/* Filter tabs + search */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <div className="flex gap-1 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: activeTab === tab.key ? BLUE : "#1e2d3d",
                  color:      activeTab === tab.key ? "#fff" : MUTED,
                  border:     `1px solid ${activeTab === tab.key ? BLUE : BORDER}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: "#1e2d3d", border: `1px solid ${BORDER}` }}
          >
            <Search className="w-3.5 h-3.5" style={{ color: MUTED }} />
            <input
              type="text"
              placeholder="Search coins…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs bg-transparent outline-none"
              style={{ color: TEXT, width: 100 }}
            />
          </div>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div
          className="rounded-2xl overflow-hidden hidden md:block"
          style={{ background: SLATE2, border: `1px solid ${BORDER}` }}
        >
          <div
            className="grid text-xs font-semibold uppercase px-4 py-3"
            style={{
              gridTemplateColumns: "32px 2fr 1fr 90px 90px 90px 110px 90px",
              color: MUTED,
              borderBottom: `1px solid ${BORDER}`,
              letterSpacing: "0.05em",
            }}
          >
            <div>#</div>
            <div>Name</div>
            {tableColumns.map((col) => (
              <div key={col.key} className="text-right cursor-pointer select-none" onClick={() => handleSort(col.key)}>
                {col.label} <SortIcon col={col.key} sortBy={sortBy} sortDir={sortDir} />
              </div>
            ))}
            <div className="text-right">7d Chart</div>
          </div>

          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="grid px-4 py-3 animate-pulse"
                style={{ gridTemplateColumns: "32px 2fr 1fr 90px 90px 90px 110px 90px", borderBottom: `1px solid ${BORDER}`, alignItems: "center" }}>
                <div className="w-5 h-4 rounded" style={{ background: "#1e2d3d" }} />
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full" style={{ background: "#1e2d3d" }} />
                  <div className="w-20 h-4 rounded" style={{ background: "#1e2d3d" }} />
                </div>
                <div className="w-24 h-4 rounded ml-auto" style={{ background: "#1e2d3d" }} />
              </div>
            ))
          ) : (
            sorted.map((coin) => {
              const h1        = coin.price_change_percentage_1h_in_currency ?? 0;
              const d24       = coin.price_change_percentage_24h ?? 0;
              const d7        = coin.price_change_percentage_7d_in_currency ?? 0;
              const sparkData = (coin.sparkline_in_7d?.price ?? []).filter((_, i) => i % 8 === 0);
              const isSelected = featuredCoin?.id === coin.id;
              return (
                <div
                  key={coin.id}
                  className="grid px-4 py-3 cursor-pointer transition-colors"
                  style={{
                    gridTemplateColumns: "32px 2fr 1fr 90px 90px 90px 110px 90px",
                    borderBottom: `1px solid ${BORDER}`,
                    background:   isSelected ? "rgba(56,97,251,0.06)" : "transparent",
                    alignItems:   "center",
                  }}
                  onClick={() => setFeaturedCoin(coin)}
                  onMouseEnter={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "#1e2d3d"; }}
                  onMouseLeave={(e) => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                >
                  <div className="text-xs" style={{ color: MUTED }}>{coin.market_cap_rank}</div>
                  <div className="flex items-center gap-3">
                    <Star className="w-3 h-3 shrink-0" style={{ color: "#2a3a4f" }} />
                    <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full shrink-0"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                    <div>
                      <div className="text-sm font-semibold" style={{ color: TEXT }}>{coin.name}</div>
                      <div className="text-xs uppercase" style={{ color: MUTED }}>{coin.symbol}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm font-semibold" style={{ color: TEXT }}>{fmt(coin.current_price)}</div>
                  <div className="text-right text-xs font-semibold" style={{ color: pctColor(h1) }}>
                    {h1 >= 0 ? "▲" : "▼"} {Math.abs(h1).toFixed(2)}%
                  </div>
                  <div className="text-right text-xs font-semibold" style={{ color: pctColor(d24) }}>
                    {d24 >= 0 ? "▲" : "▼"} {Math.abs(d24).toFixed(2)}%
                  </div>
                  <div className="text-right text-xs font-semibold" style={{ color: pctColor(d7) }}>
                    {d7 >= 0 ? "▲" : "▼"} {Math.abs(d7).toFixed(2)}%
                  </div>
                  <div className="text-right text-xs" style={{ color: TEXT }}>{fmtCap(coin.market_cap)}</div>
                  <div className="flex justify-end">
                    <Sparkline data={sparkData} color={pctColor(d7)} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── MOBILE LIST ── */}
        <div
          className="rounded-2xl overflow-hidden md:hidden"
          style={{ background: SLATE2, border: `1px solid ${BORDER}` }}
        >
          <div
            className="flex items-center gap-2 px-4 py-2 overflow-x-auto"
            style={{ borderBottom: `1px solid ${BORDER}` }}
          >
            <span className="text-xs shrink-0" style={{ color: MUTED }}>Sort:</span>
            {[
              { key: "market_cap",                  label: "Mkt Cap" },
              { key: "current_price",               label: "Price"   },
              { key: "price_change_percentage_24h", label: "24h%"    },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => handleSort(s.key)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs shrink-0 transition-all"
                style={{
                  background: sortBy === s.key ? BLUE : "#1e2d3d",
                  color:      sortBy === s.key ? "#fff" : MUTED,
                  border:     `1px solid ${sortBy === s.key ? BLUE : BORDER}`,
                }}
              >
                {s.label}
                {sortBy === s.key && (
                  sortDir === "desc"
                    ? <ChevronDown className="w-3 h-3" />
                    : <ChevronUp   className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse" style={{ borderBottom: `1px solid ${BORDER}` }}>
                <div className="w-8 h-8 rounded-full shrink-0" style={{ background: "#1e2d3d" }} />
                <div className="flex-1">
                  <div className="w-24 h-3 rounded mb-1" style={{ background: "#1e2d3d" }} />
                  <div className="w-16 h-3 rounded"       style={{ background: "#1e2d3d" }} />
                </div>
                <div className="w-20 h-3 rounded" style={{ background: "#1e2d3d" }} />
              </div>
            ))
          ) : (
            sorted.map((coin) => (
              <MobileCoinCard
                key={coin.id}
                coin={coin}
                isSelected={featuredCoin?.id === coin.id}
                onClick={() => { setFeaturedCoin(coin); setMobileDrawerCoin(coin); }}
              />
            ))
          )}
        </div>

        <p className="text-xs text-center mt-4" style={{ color: MUTED }}>
          Data by BlueVult · Updates every 30s{isMobile && " · Tap a row for details"}
        </p>
      </section>

      {/* ── Mobile Detail Drawer ── */}
      <CoinDetailDrawer coin={mobileDrawerCoin} onClose={() => setMobileDrawerCoin(null)} />
    </main>
  );
}