export interface Asset {
  id: string;
  name: string;
  type: "Crypto" | "Stock";
  symbol: string;
  binanceSymbol: string | null;
  coingeckoId: string | null;
  description: string;
}

export const ASSET_DEFS: Asset[] = [
  {
    id: "BTC",
    name: "Bitcoin",
    type: "Crypto",
    symbol: "BTC",
    binanceSymbol: "btcusdt",
    coingeckoId: "bitcoin",
    description: "The world's first decentralized cryptocurrency.",
  },
  {
    id: "ETH",
    name: "Ethereum",
    type: "Crypto",
    symbol: "ETH",
    binanceSymbol: "ethusdt",
    coingeckoId: "ethereum",
    description: "Decentralized platform powering smart contracts.",
  },
  {
    id: "SOL",
    name: "Solana",
    type: "Crypto",
    symbol: "SOL",
    binanceSymbol: "solusdt",
    coingeckoId: "solana",
    description: "High-performance blockchain with fast transactions.",
  },
  {
    id: "AAPL",
    name: "Apple Inc.",
    type: "Stock",
    symbol: "AAPL",
    binanceSymbol: "aapl",
    coingeckoId: null,
    description: "Leading technology company in consumer electronics.",
  },
  {
    id: "TSLA",
    name: "Tesla",
    type: "Stock",
    symbol: "TSLA",
    binanceSymbol: "tsla",
    coingeckoId: null,
    description: "Electric vehicle and clean energy company.",
  },
  {
    id: "NVDA",
    name: "NVIDIA",
    type: "Stock",
    symbol: "NVDA",
    binanceSymbol: "nvda",
    coingeckoId: null,
    description: "Leader in AI computing and graphics processing.",
  },
  {
    id: "MSFT",
    name: "Microsoft",
    type: "Stock",
    symbol: "MSFT",
    binanceSymbol: "msft",
    coingeckoId: null,
    description: "Global leader in software, services, and cloud computing.",
  },
  {
    id: "AMZN",
    name: "Amazon",
    type: "Stock",
    symbol: "AMZN",
    binanceSymbol: "amzn",
    coingeckoId: null,
    description: "E-commerce, cloud computing, and digital streaming giant.",
  },
  {
    id: "GOOGL",
    name: "Alphabet (Google)",
    type: "Stock",
    symbol: "GOOGL",
    binanceSymbol: "googl",
    coingeckoId: null,
    description: "Global leader in search, advertising, and technology.",
  },
  {
    id: "META",
    name: "Meta Platforms",
    type: "Stock",
    symbol: "META",
    binanceSymbol: "meta",
    coingeckoId: null,
    description: "Social technology company behind Facebook and Instagram.",
  },
];
