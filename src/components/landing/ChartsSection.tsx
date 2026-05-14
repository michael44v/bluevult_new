import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Bitcoin,
  CircleDollarSign,
  Coins,
  Star,
  Plus,
  Search,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface WatchlistCoin {
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  sparkline: number[];
  icon: string;
  iconBg: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateInitialCandles(
  basePrice: number,
  count: number = 40
): Candle[] {
  const candles: Candle[] = [];
  let price = basePrice;
  const now = Date.now();

  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.015;
    const close = open + change;
    const wick = Math.random() * price * 0.008;
    const high = Math.max(open, close) + wick;
    const low = Math.min(open, close) - wick;
    const t = new Date(now - i * 60000);
    candles.push({
      time: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
    });
    price = close;
  }
  return candles;
}

function nextCandle(prev: Candle, basePrice: number): Candle {
  const open = prev.close;
  const change = (Math.random() - 0.48) * basePrice * 0.012;
  const close = open + change;
  const wick = Math.random() * basePrice * 0.006;
  const high = Math.max(open, close) + wick;
  const low = Math.min(open, close) - wick;
  const now = new Date();
  return {
    time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    open: +open.toFixed(2),
    high: +high.toFixed(2),
    low: +low.toFixed(2),
    close: +close.toFixed(2),
  };
}

function generateSparkline(baseChange: number): number[] {
  const pts: number[] = [100];
  for (let i = 1; i < 20; i++) {
    const delta = (Math.random() - 0.5) * 4;
    pts.push(pts[i - 1] + delta);
  }
  // nudge last point to reflect real change direction
  if (baseChange < 0) pts[pts.length - 1] = pts[0] - Math.abs(baseChange) * 3;
  else pts[pts.length - 1] = pts[0] + baseChange * 3;
  return pts;
}

// ─── Candlestick SVG renderer ─────────────────────────────────────────────────

const CandlestickChart = ({
  candles,
  width,
  height,
}: {
  candles: Candle[];
  width: number;
  height: number;
}) => {
  if (!candles.length) return null;

  const padding = { top: 10, right: 10, bottom: 30, left: 60 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allPrices = candles.flatMap((c) => [c.high, c.low]);
  const minP = Math.min(...allPrices);
  const maxP = Math.max(...allPrices);
  const priceRange = maxP - minP || 1;

  const visible = candles.slice(-40);
  const candleW = Math.max(2, chartW / visible.length - 2);
  const gap = chartW / visible.length;

  const toY = (p: number) =>
    chartH - ((p - minP) / priceRange) * chartH + padding.top;
  const toX = (i: number) => padding.left + i * gap + gap / 2;

  // Y-axis labels
  const steps = 5;
  const yLabels = Array.from({ length: steps + 1 }, (_, i) => {
    const val = minP + (i / steps) * priceRange;
    return { val, y: toY(val) };
  });

  // X-axis labels (every ~8 candles)
  const xLabels = visible
    .map((c, i) => ({ label: c.time, x: toX(i) }))
    .filter((_, i) => i % 8 === 0);

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: "visible" }}
      className="select-none"
    >
      {/* Grid lines */}
      {yLabels.map((l, i) => (
        <g key={i}>
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={l.y}
            y2={l.y}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 4"
          />
          <text
            x={padding.left - 6}
            y={l.y + 4}
            textAnchor="end"
            fontSize={10}
            fill="rgba(255,255,255,0.35)"
          >
            {l.val >= 1000
              ? `$${(l.val / 1000).toFixed(1)}K`
              : `$${l.val.toFixed(2)}`}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {xLabels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={height - 6}
          textAnchor="middle"
          fontSize={9}
          fill="rgba(255,255,255,0.3)"
        >
          {l.label}
        </text>
      ))}

      {/* Candles */}
      {visible.map((c, i) => {
        const x = toX(i);
        const isUp = c.close >= c.open;
        const color = isUp ? "#22c55e" : "#ef4444";
        const bodyTop = toY(Math.max(c.open, c.close));
        const bodyBot = toY(Math.min(c.open, c.close));
        const bodyH = Math.max(1, bodyBot - bodyTop);

        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={x}
              x2={x}
              y1={toY(c.high)}
              y2={toY(c.low)}
              stroke={color}
              strokeWidth={1}
              opacity={0.8}
            />
            {/* Body */}
            <rect
              x={x - candleW / 2}
              y={bodyTop}
              width={candleW}
              height={bodyH}
              fill={isUp ? color : color}
              opacity={isUp ? 0.85 : 0.75}
              rx={1}
            />
          </g>
        );
      })}

      {/* Last price line */}
      {(() => {
        const last = visible[visible.length - 1];
        const y = toY(last.close);
        const isUp = last.close >= last.open;
        const color = isUp ? "#22c55e" : "#ef4444";
        return (
          <g>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke={color}
              strokeDasharray="3 3"
              strokeWidth={1}
              opacity={0.5}
            />
            <rect
              x={width - padding.right + 2}
              y={y - 9}
              width={46}
              height={18}
              fill={color}
              rx={3}
            />
            <text
              x={width - padding.right + 25}
              y={y + 4}
              textAnchor="middle"
              fontSize={9}
              fill="white"
              fontWeight="bold"
            >
              {last.close >= 1000
                ? `$${(last.close / 1000).toFixed(2)}K`
                : `$${last.close.toFixed(2)}`}
            </text>
          </g>
        );
      })()}
    </svg>
  );
};

// ─── Sparkline ────────────────────────────────────────────────────────────────

const Sparkline = ({
  data,
  isUp,
}: {
  data: number[];
  isUp: boolean;
}) => {
  const w = 120;
  const h = 50;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const toX = (i: number) => (i / (data.length - 1)) * w;
  const toY = (v: number) => h - ((v - min) / range) * (h * 0.8) - h * 0.1;

  const path = data
    .map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`)
    .join(" ");

  const fillPath =
    path + ` L${w},${h} L0,${h} Z`;

  const color = isUp ? "#22c55e" : "#ef4444";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <linearGradient id={`sg-${isUp}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#sg-${isUp})`} />
      <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
};

// ─── Static data ──────────────────────────────────────────────────────────────

const volumeData = [
  { day: "Mon", volume: 2.4 },
  { day: "Tue", volume: 3.1 },
  { day: "Wed", volume: 2.8 },
  { day: "Thu", volume: 4.2 },
  { day: "Fri", volume: 3.9 },
  { day: "Sat", volume: 2.1 },
  { day: "Sun", volume: 1.8 },
];

const portfolioData = [
  { name: "BTC", value: 45, color: "hsl(43, 74%, 49%)" },
  { name: "ETH", value: 30, color: "hsl(210, 14%, 70%)" },
  { name: "SOL", value: 15, color: "hsl(168, 72%, 48%)" },
  { name: "Others", value: 10, color: "hsl(210, 10%, 50%)" },
];

const marketData = [
  { rank: 1, name: "Bitcoin",  symbol: "BTC", price: 67432.18, change24h: 2.45,  marketCap: 1324.5, volume: 42.8 },
  { rank: 2, name: "Ethereum", symbol: "ETH", price: 3892.54,  change24h: -0.82, marketCap: 468.2,  volume: 18.4 },
  { rank: 3, name: "Solana",   symbol: "SOL", price: 189.23,   change24h: 5.67,  marketCap: 84.6,   volume: 4.2  },
  { rank: 4, name: "BNB",      symbol: "BNB", price: 612.89,   change24h: 1.23,  marketCap: 93.4,   volume: 2.1  },
  { rank: 5, name: "Cardano",  symbol: "ADA", price: 0.4891,   change24h: 3.21,  marketCap: 17.2,   volume: 0.8  },
];

const BASE_PRICES: Record<string, number> = {
  btc: 79684.30,
  eth: 3450.00,
  sol: 91.05,
};

const WATCHLIST_COINS: WatchlistCoin[] = [
  { name: "Bitcoin",   symbol: "BTC",  price: 79684.30, change24h: -1.67, sparkline: generateSparkline(-1.67), icon: "₿",  iconBg: "#f7931a" },
  { name: "Solana",    symbol: "SOL",  price: 91.05,    change24h: -4.48, sparkline: generateSparkline(-4.48), icon: "◎",  iconBg: "#9945ff" },
  { name: "TRON",      symbol: "TRX",  price: 0.3505,   change24h: 0.36,  sparkline: generateSparkline(0.36),  icon: "⟁",  iconBg: "#ff0013" },
  { name: "Cardano",   symbol: "ADA",  price: 0.2656,   change24h: -2.92, sparkline: generateSparkline(-2.92), icon: "₳",  iconBg: "#0033ad" },
  { name: "Avalanche", symbol: "AVAX", price: 9.76,     change24h: -2.34, sparkline: generateSparkline(-2.34), icon: "A",  iconBg: "#e84142" },
  { name: "Pepe",      symbol: "PEPE", price: 0.0000054067, change24h: -2.88, sparkline: generateSparkline(-2.88), icon: "🐸", iconBg: "#00b300" },
];

// ─── Watchlist Section ────────────────────────────────────────────────────────

const WatchlistSection = () => {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const toggle = (symbol: string) =>
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );

  const formatPrice = (p: number) => {
    if (p < 0.001) return `$0.0₅${(p * 1e6).toFixed(4)}`;
    if (p < 1) return `$${p.toFixed(4)}`;
    if (p >= 1000) return `$${p.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${p.toFixed(2)}`;
  };

  return (
    <div className="mt-10 rounded-2xl p-8" style={{ background: "#0d1421" }}>
      {/* Header */}
      <div className="flex flex-col items-center mb-8 gap-3">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "radial-gradient(circle at 40% 40%, #c8a94a, #7a5f1a)" }}
        >
          <Star className="w-7 h-7 fill-yellow-300 text-yellow-300" />
        </div>
        <h3 className="text-xl font-bold text-white tracking-wide">
          Add Coins to Your Watchlist
        </h3>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {WATCHLIST_COINS.map((coin) => {
          const isUp = coin.change24h >= 0;
          const added = watchlist.includes(coin.symbol);
          return (
            <div
              key={coin.symbol}
              className="relative rounded-xl p-4 flex flex-col gap-3 transition-all hover:scale-[1.02]"
              style={{
                background: "#1b2332",
                border: "1px solid #253047",
              }}
            >
              {/* Top row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: coin.iconBg }}
                  >
                    {coin.icon}
                  </div>
                  <span className="text-sm font-semibold text-white">{coin.name}</span>
                </div>
                <button
                  onClick={() => toggle(coin.symbol)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: added ? "rgba(99,102,241,0.3)" : "rgba(255,255,255,0.08)",
                    border: added ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {added ? (
                    <Star className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-white/50" />
                  )}
                </button>
              </div>

              {/* Price + change */}
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white font-mono">
                  {formatPrice(coin.price)}
                </span>
                <span
                  className="text-sm font-medium flex items-center gap-0.5"
                  style={{ color: isUp ? "#22c55e" : "#ef4444" }}
                >
                  {isUp ? "▲" : "▼"}
                  {Math.abs(coin.change24h).toFixed(2)}%
                </span>
              </div>

              {/* Sparkline */}
              <div className="opacity-90">
                <Sparkline data={coin.sparkline} isUp={isUp} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search more */}
      <div className="flex justify-center">
        <button
          className="flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: "#818cf8" }}
        >
          <Search className="w-4 h-4" />
          Search for More Coins
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

type CryptoKey = "btc" | "eth" | "sol";

const ChartsSection = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoKey>("btc");
  const [candleMap, setCandleMap] = useState<Record<CryptoKey, Candle[]>>({
    btc: generateInitialCandles(BASE_PRICES.btc),
    eth: generateInitialCandles(BASE_PRICES.eth),
    sol: generateInitialCandles(BASE_PRICES.sol),
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [chartSize, setChartSize] = useState({ w: 600, h: 320 });

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        setChartSize({ w: e.contentRect.width, h: 320 });
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Live candle ticker — appends a new candle every 2 s
  useEffect(() => {
    const id = setInterval(() => {
      setCandleMap((prev) => {
        const updated = { ...prev };
        (["btc", "eth", "sol"] as CryptoKey[]).forEach((key) => {
          const arr = prev[key];
          const last = arr[arr.length - 1];
          const nc = nextCandle(last, BASE_PRICES[key]);
          updated[key] = [...arr.slice(-79), nc]; // keep last 80
        });
        return updated;
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const candles = candleMap[selectedCrypto];
  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const priceUp = lastCandle.close >= prevCandle?.close;

  const cryptoLabels: Record<CryptoKey, string> = { btc: "BTC/USD", eth: "ETH/USD", sol: "SOL/USD" };

  return (
    <section id="stats" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Live Market Data</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Real-Time <span className="text-gradient">Market Analytics</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Track market movements, analyze trends, and make informed investment decisions
            with our comprehensive dashboard.
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Candlestick Chart */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg font-semibold">
                  {cryptoLabels[selectedCrypto]}
                </CardTitle>
                {/* Live badge */}
                <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  LIVE
                </span>
              </div>

              {/* Crypto selector */}
              <div className="flex gap-2">
                {(["btc", "eth", "sol"] as CryptoKey[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCrypto(c)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedCrypto === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {/* Price summary bar */}
              <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground font-mono">
                <span
                  className="text-base font-bold"
                  style={{ color: priceUp ? "#22c55e" : "#ef4444" }}
                >
                  {lastCandle.close >= 1000
                    ? `$${lastCandle.close.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : `$${lastCandle.close.toFixed(4)}`}
                </span>
                <span>O: ${lastCandle.open.toFixed(2)}</span>
                <span>H: <span className="text-green-400">${lastCandle.high.toFixed(2)}</span></span>
                <span>L: <span className="text-red-400">${lastCandle.low.toFixed(2)}</span></span>
                <span>C: ${lastCandle.close.toFixed(2)}</span>
              </div>

              {/* Candlestick SVG */}
              <div ref={containerRef} className="w-full" style={{ height: 320 }}>
                <CandlestickChart
                  candles={candles}
                  width={chartSize.w}
                  height={chartSize.h}
                />
              </div>
            </CardContent>
          </Card>

          {/* Volume & Portfolio */}
          <div className="space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  24h Trading Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData}>
                      <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-2xl font-bold">$20.3B</p>
                  <p className="text-xs text-muted-foreground">Total Volume Today</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sample Portfolio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {portfolioData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm flex-1">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market Rankings */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              Market Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">24h %</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Market Cap</TableHead>
                  <TableHead className="text-right hidden lg:table-cell">Volume (24h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marketData.map((coin) => (
                  <TableRow key={coin.symbol} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{coin.rank}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {coin.symbol === "BTC" && <Bitcoin className="w-4 h-4 text-yellow-500" />}
                          {coin.symbol === "ETH" && <CircleDollarSign className="w-4 h-4 text-slate-400" />}
                          {!["BTC", "ETH"].includes(coin.symbol) && <Coins className="w-4 h-4 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium">{coin.name}</p>
                          <p className="text-xs text-muted-foreground">{coin.symbol}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${coin.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center gap-1 ${coin.change24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {coin.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {coin.change24h >= 0 ? "+" : ""}{coin.change24h}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">${coin.marketCap}B</TableCell>
                    <TableCell className="text-right hidden lg:table-cell">${coin.volume}B</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur p-4">
            <p className="text-xs text-muted-foreground mb-1">BTC Dominance</p>
            <p className="text-xl font-bold">52.4%</p>
            <p className="text-xs text-green-400">+0.8%</p>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Market Cap</p>
            <p className="text-xl font-bold">$2.54T</p>
            <p className="text-xs text-green-400">+2.1%</p>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur p-4">
            <p className="text-xs text-muted-foreground mb-1">Fear & Greed</p>
            <p className="text-xl font-bold">72</p>
            <p className="text-xs text-primary">Greed</p>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur p-4">
            <p className="text-xs text-muted-foreground mb-1">Active Cryptos</p>
            <p className="text-xl font-bold">2,847</p>
            <p className="text-xs text-muted-foreground">+23 today</p>
          </Card>
        </div>

        {/* ── Watchlist ── */}
        <WatchlistSection />
      </div>
    </section>
  );
};

export default ChartsSection;