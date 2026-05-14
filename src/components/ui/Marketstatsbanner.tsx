import { useState, useEffect, useRef } from "react";
import { ChevronRight, X, Bell, Flame, TrendingUp, Zap } from "lucide-react";

/* ─── Types ─── */
interface MarketData {
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
  market_cap_percentage: Record<string, number>;
}

interface SparkPoint {
  price: number;
}

interface NewsItem {
  id: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  text: string;
  icon?: React.ReactNode;
  closable?: boolean;
}

/* ─── Constants ─── */
const SLATE = "#0d1421";
const SLATE2 = "#17212d";
const BORDER = "#1e2d3d";
const TEXT = "#eaecef";
const MUTED = "#8a919e";
const UP = "#16c784";
const DOWN = "#ea3943";

/* ─── Helpers ─── */
const fmtCap = (v: number | undefined): string => {
  if (!v) return "—";
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  return "$" + (v / 1e6).toFixed(2) + "M";
};

const fmtPct = (c: number | undefined): string => {
  if (c == null) return "";
  return (c >= 0 ? "▲ " : "▼ ") + Math.abs(c).toFixed(2) + "%";
};

/* ─── Mini Sparkline SVG ─── */
interface MiniSparkProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}

function MiniSpark({ data, color, width = 120, height = 40 }: MiniSparkProps): JSX.Element {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const d = "M" + pts.join(" L");
  const fillPts = [...pts, `${width},${height}`, `0,${height}`];
  const fillD = "M" + fillPts.join(" L") + " Z";
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={fillD} fill={color} opacity={0.12} />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Fear & Greed Gauge ─── */
interface GaugeProps {
  value: number;
}

function FearGreedGauge({ value }: GaugeProps): JSX.Element {
  const clamp = Math.max(0, Math.min(100, value));
  // gauge arc: 180deg semicircle
  const radius = 36;
  const cx = 50;
  const cy = 46;
  const startAngle = Math.PI;
  const endAngle = 0;
  const range = startAngle - endAngle; // = PI
  const angle = startAngle - (clamp / 100) * range;
  const needleX = cx + radius * Math.cos(angle);
  const needleY = cy - radius * Math.sin(angle) + cy - (cy - radius * Math.sin(angle));

  // fixed: needle tip coords
  const nx = cx + (radius - 2) * Math.cos(angle);
  const ny = cy + (radius - 2) * Math.sin(Math.PI - angle);

  const getLabel = (v: number): string => {
    if (v <= 20) return "Extreme Fear";
    if (v <= 40) return "Fear";
    if (v <= 60) return "Neutral";
    if (v <= 80) return "Greed";
    return "Extreme Greed";
  };

  const getColor = (v: number): string => {
    if (v <= 20) return "#ea3943";
    if (v <= 40) return "#f7931a";
    if (v <= 60) return "#f0b90b";
    if (v <= 80) return "#16c784";
    return "#00d395";
  };

  const arcColor = getColor(clamp);

  // Build gradient arc as path segments
  const segments = [
    { from: 0, to: 20, color: "#ea3943" },
    { from: 20, to: 40, color: "#f7931a" },
    { from: 40, to: 60, color: "#f0b90b" },
    { from: 60, to: 80, color: "#16c784" },
    { from: 80, to: 100, color: "#00d395" },
  ];

  const arcPath = (from: number, to: number): string => {
    const a1 = Math.PI - (from / 100) * Math.PI;
    const a2 = Math.PI - (to / 100) * Math.PI;
    const x1 = cx + radius * Math.cos(a1);
    const y1 = cy + radius * Math.sin(a1);
    const x2 = cx + radius * Math.cos(a2);
    const y2 = cy + radius * Math.sin(a2);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  };

  // needle
  const needleAngle = Math.PI - (clamp / 100) * Math.PI;
  const ntx = cx + (radius - 4) * Math.cos(needleAngle);
  const nty = cy + (radius - 4) * Math.sin(needleAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="56" viewBox="0 0 100 56">
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#1e2d3d"
          strokeWidth="6"
          strokeLinecap="round"
        />
        {/* Colored segments */}
        {segments.map((seg) => (
          <path
            key={seg.from}
            d={arcPath(seg.from, seg.to)}
            fill="none"
            stroke={seg.color}
            strokeWidth="6"
            strokeLinecap="butt"
            opacity={clamp >= seg.from ? 1 : 0.2}
          />
        ))}
        {/* Needle */}
        <line
          x1={cx.toString()}
          y1={cy.toString()}
          x2={ntx.toFixed(2)}
          y2={nty.toFixed(2)}
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r="3" fill="#fff" />
      </svg>
      <div className="text-2xl font-bold -mt-1" style={{ color: arcColor }}>
        {clamp}
      </div>
      <div className="text-xs mt-0.5" style={{ color: MUTED }}>
        {getLabel(clamp)}
      </div>
    </div>
  );
}

/* ─── Altcoin Season Bar ─── */
interface AltcoinBarProps {
  value: number;
}

function AltcoinBar({ value }: AltcoinBarProps): JSX.Element {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5" style={{ color: MUTED }}>
        <span>Bitcoin</span>
        <span>Altcoin</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "#1e2d3d" }}>
        {/* Gradient bar */}
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: "100%",
            background: "linear-gradient(to right, #f7931a, #f0b90b, #16c784, #3861fb)",
          }}
        />
        {/* Indicator dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
          style={{ left: `calc(${pct}% - 6px)`, background: "#fff", zIndex: 2 }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1.5">
        <span style={{ color: MUTED }}>Season</span>
        <span className="font-bold" style={{ color: TEXT }}>
          {value} / 100
        </span>
      </div>
    </div>
  );
}

/* ─── RSI Bar ─── */
interface RSIBarProps {
  value: number;
}

function RSIBar({ value }: RSIBarProps): JSX.Element {
  const pct = Math.max(0, Math.min(100, value));
  const getColor = (v: number): string => {
    if (v < 30) return "#ea3943";
    if (v > 70) return "#16c784";
    return "#f0b90b";
  };
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5" style={{ color: MUTED }}>
        <span>Oversold</span>
        <span>Overbought</span>
      </div>
      <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "#1e2d3d" }}>
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: "100%",
            background: "linear-gradient(to right, #ea3943, #f0b90b, #16c784)",
          }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
          style={{ left: `calc(${pct}% - 6px)`, background: getColor(value), zIndex: 2 }}
        />
      </div>
    </div>
  );
}

/* ─── Stat Card ─── */
interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  sparkData?: number[];
  extra?: React.ReactNode;
}

function StatCard({ label, value, change, sparkData, extra }: StatCardProps): JSX.Element {
  const isUp = (change ?? 0) >= 0;
  return (
    <div
      className="rounded-xl p-3 flex flex-col justify-between min-w-0 cursor-pointer transition-colors"
      style={{ background: "#17212d", border: `1px solid ${BORDER}`, minWidth: 160 }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "#2a3a54")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = BORDER)}
    >
      <div className="flex items-center gap-1 mb-1">
        <span className="text-xs font-medium" style={{ color: TEXT }}>
          {label}
        </span>
        <ChevronRight className="w-3 h-3" style={{ color: MUTED }} />
      </div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-lg font-bold leading-none" style={{ color: TEXT }}>
            {value}
          </div>
          {change != null && (
            <div
              className="text-xs font-semibold mt-1"
              style={{ color: isUp ? UP : DOWN }}
            >
              {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
            </div>
          )}
          {extra && <div className="mt-1">{extra}</div>}
        </div>
        {sparkData && sparkData.length > 1 && (
          <div className="shrink-0">
            <MiniSpark data={sparkData} color={isUp ? UP : DOWN} width={100} height={38} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
export default function MarketStatsBanner(): JSX.Element {
  const [globalData, setGlobalData] = useState<MarketData | null>(null);
  const [fearGreed, setFearGreed] = useState<number>(51);
  const [altcoinSeason, setAltcoinSeason] = useState<number>(43);
  const [cryptoRsi, setCryptoRsi] = useState<number>(53.55);
  const [btcSpark, setBtcSpark] = useState<number[]>([]);
  const [cmc20Spark, setCmc20Spark] = useState<number[]>([]);
  const [dismissedNews, setDismissedNews] = useState<Set<string>>(new Set());
  const tickerRef = useRef<HTMLDivElement>(null);

  const newsItems: NewsItem[] = [
    {
      id: "1",
      tag: "Topic",
      tagColor: "#f7931a",
      tagBg: "rgba(247,147,26,0.1)",
      text: "3.8% CPI puts crypto rally in check ⚠️",
      closable: true,
    },
    {
      id: "2",
      tag: "New",
      tagColor: "#16c784",
      tagBg: "rgba(22,199,132,0.1)",
      text: "Top News",
      icon: <Flame className="w-3 h-3" />,
    },
    {
      id: "3",
      tag: "Add AI alert",
      tagColor: "#a78bfa",
      tagBg: "rgba(167,139,250,0.1)",
      text: "",
      icon: <Bell className="w-3 h-3" />,
      closable: true,
    },
    {
      id: "4",
      tag: "",
      tagColor: "#3861fb",
      tagBg: "rgba(56,97,251,0.1)",
      text: "🔥 US senators flood crypto bill with amendments",
      icon: <Flame className="w-3 h-3" />,
    },
    {
      id: "5",
      tag: "",
      tagColor: "#16c784",
      tagBg: "rgba(22,199,132,0.08)",
      text: "↗ Are altcoins outperforming Bitcoin?",
      icon: <TrendingUp className="w-3 h-3" />,
    },
  ];

  /* Fetch global market data */
  useEffect(() => {
    const fetchGlobal = async (): Promise<void> => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/global");
        const data = await res.json();
        if (data?.data) setGlobalData(data.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchGlobal();
    const iv = setInterval(fetchGlobal, 60000);
    return () => clearInterval(iv);
  }, []);

  /* Fetch BTC 7d spark */
  useEffect(() => {
    const fetchSpark = async (): Promise<void> => {
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily"
        );
        const data = await res.json();
        if (data?.prices) {
          setBtcSpark(data.prices.map((p: [number, number]) => p[1]));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSpark();
  }, []);

  /* Fetch Fear & Greed */
  useEffect(() => {
    const fetchFG = async (): Promise<void> => {
      try {
        const res = await fetch("https://api.alternative.me/fng/?limit=1");
        const data = await res.json();
        if (data?.data?.[0]?.value) {
          setFearGreed(parseInt(data.data[0].value, 10));
        }
      } catch (e) {
        // fallback to default
      }
    };
    fetchFG();
  }, []);

  const marketCapChange = globalData?.market_cap_change_percentage_24h_usd ?? 0;
  const marketCapValue = fmtCap(globalData?.total_market_cap?.usd);

  const visibleNews = newsItems.filter((n) => !dismissedNews.has(n.id));

  return (
    <div style={{ background: SLATE, fontFamily: "'Inter', sans-serif" }}>

      {/* ── STATS CARDS ROW ── */}
      <div
        className="border-b"
        style={{ background: SLATE2, borderColor: BORDER }}
      >
        <div className="max-w-screen-xl mx-auto px-4 py-3">
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">

            {/* Market Cap */}
            <StatCard
              label="Market Cap"
              value={marketCapValue}
              change={marketCapChange}
              sparkData={btcSpark}
            />

            {/* CMC20 — simulated */}
            <StatCard
              label="CMC20"
              value="$164.51"
              change={-0.53}
              sparkData={[160, 163, 161, 165, 162, 164, 163, 164.51]}
            />

            {/* Fear & Greed */}
            <div
              className="rounded-xl p-3 flex flex-col min-w-0 cursor-pointer"
              style={{
                background: "#17212d",
                border: `1px solid ${BORDER}`,
                minWidth: 160,
              }}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-medium" style={{ color: TEXT }}>
                  Fear &amp; Greed
                </span>
                <ChevronRight className="w-3 h-3" style={{ color: MUTED }} />
              </div>
              <FearGreedGauge value={fearGreed} />
            </div>

            {/* Altcoin Season */}
            <div
              className="rounded-xl p-3 flex flex-col min-w-0 cursor-pointer"
              style={{
                background: "#17212d",
                border: `1px solid ${BORDER}`,
                minWidth: 200,
              }}
            >
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs font-medium" style={{ color: TEXT }}>
                  Altcoin Season
                </span>
                <ChevronRight className="w-3 h-3" style={{ color: MUTED }} />
              </div>
              <div className="text-2xl font-bold mb-3" style={{ color: TEXT }}>
                {altcoinSeason}{" "}
                <span className="text-sm font-normal" style={{ color: MUTED }}>
                  /100
                </span>
              </div>
              <AltcoinBar value={altcoinSeason} />
            </div>

            {/* Average Crypto RSI */}
            <div
              className="rounded-xl p-3 flex flex-col min-w-0 cursor-pointer"
              style={{
                background: "#17212d",
                border: `1px solid ${BORDER}`,
                minWidth: 200,
              }}
            >
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs font-medium" style={{ color: TEXT }}>
                  Average Crypto RSI
                </span>
                <ChevronRight className="w-3 h-3" style={{ color: MUTED }} />
              </div>
              <div className="text-2xl font-bold mb-3" style={{ color: TEXT }}>
                {cryptoRsi.toFixed(2)}
              </div>
              <RSIBar value={cryptoRsi} />
            </div>

            {/* Community feed card */}
            <div
              className="rounded-xl p-3 flex flex-col min-w-0"
              style={{
                background: "#17212d",
                border: `1px solid ${BORDER}`,
                minWidth: 200,
                maxWidth: 240,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: "#3861fb", color: "#fff" }}
                >
                  F
                </div>
                <span className="text-xs font-semibold" style={{ color: TEXT }}>
                  Freda
                </span>
                <span className="text-xs" style={{ color: "#16c784" }}>✓</span>
                <span className="text-xs ml-auto" style={{ color: MUTED }}>5h</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
                🇧🇹 Bhutan has moved another 100.44 BTC
                <span style={{ color: "#f7931a" }}>🪙</span>
                <span style={{ color: "#3861fb" }}> $BTC</span> 8.2M pushing total 2026 BTC-relate...
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEWS TICKER ── */}
      <div
        className="border-b"
        style={{ background: "#0d1421", borderColor: BORDER }}
      >
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex items-center gap-3 py-2 overflow-x-auto scrollbar-hide">
            {visibleNews.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 shrink-0 rounded-full px-3 py-1 cursor-pointer transition-all"
                style={{
                  background: item.tagBg || "rgba(255,255,255,0.04)",
                  border: `1px solid ${item.tagColor}30`,
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = item.tagColor + "60")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.borderColor = item.tagColor + "30")
                }
              >
                {item.icon && (
                  <span style={{ color: item.tagColor }}>{item.icon}</span>
                )}
                {item.tag && (
                  <span
                    className="text-xs font-semibold"
                    style={{ color: item.tagColor }}
                  >
                    {item.tag}
                  </span>
                )}
                {item.text && (
                  <span className="text-xs" style={{ color: TEXT }}>
                    {item.text}
                  </span>
                )}
                {item.closable && (
                  <button
                    className="ml-1 opacity-50 hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDismissedNews((prev) => new Set([...prev, item.id]));
                    }}
                  >
                    <X className="w-3 h-3" style={{ color: TEXT }} />
                  </button>
                )}
              </div>
            ))}

            {/* Arrow */}
            <button
              className="shrink-0 ml-auto w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#1e2d3d", color: TEXT }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}