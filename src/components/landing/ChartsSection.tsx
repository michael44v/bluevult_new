import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Bitcoin, CircleDollarSign, Coins } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock price data for charts
const priceData = [
  { date: "Jan", btc: 42000, eth: 2800, sol: 98 },
  { date: "Feb", btc: 44500, eth: 3100, sol: 110 },
  { date: "Mar", btc: 48000, eth: 3400, sol: 145 },
  { date: "Apr", btc: 52000, eth: 3200, sol: 128 },
  { date: "May", btc: 58000, eth: 3600, sol: 165 },
  { date: "Jun", btc: 61000, eth: 3800, sol: 178 },
  { date: "Jul", btc: 67432, eth: 3892, sol: 189 },
];

const volumeData = [
  { day: "Mon", volume: 2.4 },
  { day: "Tue", volume: 3.1 },
  { day: "Wed", volume: 2.8 },
  { day: "Thu", volume: 4.2 },
  { day: "Fri", volume: 3.9 },
  { day: "Sat", volume: 2.1 },
  { day: "Sun", volume: 1.8 },
];

const marketData = [
  {
    rank: 1,
    name: "Bitcoin",
    symbol: "BTC",
    price: 67432.18,
    change24h: 2.45,
    marketCap: 1324.5,
    volume: 42.8,
  },
  {
    rank: 2,
    name: "Ethereum",
    symbol: "ETH",
    price: 3892.54,
    change24h: -0.82,
    marketCap: 468.2,
    volume: 18.4,
  },
  {
    rank: 3,
    name: "Solana",
    symbol: "SOL",
    price: 189.23,
    change24h: 5.67,
    marketCap: 84.6,
    volume: 4.2,
  },
  {
    rank: 4,
    name: "BNB",
    symbol: "BNB",
    price: 612.89,
    change24h: 1.23,
    marketCap: 93.4,
    volume: 2.1,
  },
  {
    rank: 5,
    name: "Cardano",
    symbol: "ADA",
    price: 0.4891,
    change24h: 3.21,
    marketCap: 17.2,
    volume: 0.8,
  },
];

const portfolioData = [
  { name: "BTC", value: 45, color: "hsl(43, 74%, 49%)" },
  { name: "ETH", value: 30, color: "hsl(210, 14%, 70%)" },
  { name: "SOL", value: 15, color: "hsl(168, 72%, 48%)" },
  { name: "Others", value: 10, color: "hsl(210, 10%, 50%)" },
];

const ChartsSection = () => {
  const [selectedCrypto, setSelectedCrypto] = useState<"btc" | "eth" | "sol">("btc");

  const cryptoColors = {
    btc: "hsl(43, 74%, 49%)",
    eth: "hsl(210, 14%, 70%)",
    sol: "hsl(168, 72%, 48%)",
  };

  return (
    <section id="stats" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
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
          {/* Main Price Chart */}
          <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-semibold">Price Chart</CardTitle>
              <div className="flex gap-2">
                {(["btc", "eth", "sol"] as const).map((crypto) => (
                  <button
                    key={crypto}
                    onClick={() => setSelectedCrypto(crypto)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedCrypto === crypto
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {crypto.toUpperCase()}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={cryptoColors[selectedCrypto]}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={cryptoColors[selectedCrypto]}
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickFormatter={(value) =>
                        value >= 1000 ? `$${(value / 1000).toFixed(0)}K` : `$${value}`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, selectedCrypto.toUpperCase()]}
                    />
                    <Area
                      type="monotone"
                      dataKey={selectedCrypto}
                      stroke={cryptoColors[selectedCrypto]}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Volume & Portfolio Cards */}
          <div className="space-y-6">
            {/* 24h Volume */}
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
                      <Bar
                        dataKey="volume"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-2xl font-bold">$20.3B</p>
                  <p className="text-xs text-muted-foreground">Total Volume Today</p>
                </div>
              </CardContent>
            </Card>

            {/* Portfolio Distribution */}
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
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm flex-1">{item.name}</span>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Market Rankings Table */}
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
                          {coin.symbol === "BTC" && <Bitcoin className="w-4 h-4 text-gold" />}
                          {coin.symbol === "ETH" && <CircleDollarSign className="w-4 h-4 text-silver" />}
                          {!["BTC", "ETH"].includes(coin.symbol) && (
                            <Coins className="w-4 h-4 text-primary" />
                          )}
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
                      <span
                        className={`inline-flex items-center gap-1 ${
                          coin.change24h >= 0 ? "text-chart-up" : "text-chart-down"
                        }`}
                      >
                        {coin.change24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {coin.change24h >= 0 ? "+" : ""}
                        {coin.change24h}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      ${coin.marketCap}B
                    </TableCell>
                    <TableCell className="text-right hidden lg:table-cell">
                      ${coin.volume}B
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card className="border-border/50 bg-card/50 backdrop-blur p-4">
            <p className="text-xs text-muted-foreground mb-1">BTC Dominance</p>
            <p className="text-xl font-bold">52.4%</p>
            <p className="text-xs text-chart-up">+0.8%</p>
          </Card>
          <Card className="border-border/50 bg-card/50 backdrop-blur p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Market Cap</p>
            <p className="text-xl font-bold">$2.54T</p>
            <p className="text-xs text-chart-up">+2.1%</p>
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
      </div>
    </section>
  );
};

export default ChartsSection;