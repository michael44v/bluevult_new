import { useState, useEffect, useRef } from "react";
import GTpayoutLayout from "./GTpayoutLayout";
import TradingChart from "./TradingChart";
import { toast } from "sonner";
import { FaArrowUp, FaArrowDown, FaBars } from "react-icons/fa";

/* ─── Types ────────────────────────────────────────────── */
type OrderSide = "buy" | "sell";
type OrderType = "limit" | "market";
type OrderEntry = { price: number; amount: number; type: "buy" | "sell" };
type Trade = {
  start_time: string;
  trade_id: string;
  asset_symbol: string;
  direction: string;
  amount: string;
  status: string;
  entry_price: string;
};

/* ─── Constants ─────────────────────────────────────────── */
const ASSETS = [
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT",
  "XRP/USDT", "DOGE/USDT", "ADA/USDT", "MATIC/USDT",
];

const ASSET_BASE: Record<string, number> = {
  "BTC/USDT": 65241, "ETH/USDT": 3480, "SOL/USDT": 178,
  "BNB/USDT": 612,   "XRP/USDT": 0.58, "DOGE/USDT": 0.14,
  "ADA/USDT": 0.47,  "MATIC/USDT": 0.88,
};

const PCTS = ["25%", "50%", "75%", "100%"];

/* ─── Helpers ───────────────────────────────────────────── */
function fmt(n: number, dec = 2) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}

function priceDec(asset: string) {
  const base = ASSET_BASE[asset] ?? 1;
  return base < 1 ? 4 : base < 10 ? 3 : 2;
}

/* ─── Sub-components ─────────────────────────────────────── */

/** Single order-book row with depth-bar */
function BookRow({
  price, amount, type, maxAmt, dec,
}: {
  price: number; amount: number; type: "buy" | "sell"; maxAmt: number; dec: number;
}) {
  const pct = maxAmt > 0 ? (amount / maxAmt) * 100 : 0;
  const isSell = type === "sell";
  return (
    <div className="bybit-ob-row" data-side={type}>
      <div
        className="bybit-ob-bar"
        style={{
          width: `${pct}%`,
          background: isSell ? "rgba(239,83,80,0.12)" : "rgba(38,198,128,0.12)",
        }}
      />
      <span className={isSell ? "bybit-col-red" : "bybit-col-green"}>
        {price.toFixed(dec)}
      </span>
      <span className="bybit-ob-amt">{amount.toFixed(4)}</span>
      <span className="bybit-ob-total">{(price * amount).toFixed(2)}</span>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
const ManualTrading = () => {
  const uid = localStorage.getItem("user_id");

  const [asset, setAsset] = useState("BTC/USDT");
  const [side, setSide] = useState<OrderSide>("buy");
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(0);
  const [orderBook, setOrderBook] = useState<OrderEntry[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [activeTab, setActiveTab] = useState<"positions" | "history">("positions");
  const [isClosing, setIsClosing] = useState<string | null>(null);
  const [ticker, setTicker] = useState({
    last: 0, change: 0.024, high: 0, low: 0, vol: "1.24B",
  });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Seed ticker from asset ── */
  useEffect(() => {
    const base = ASSET_BASE[asset] ?? 0;
    setTicker({
      last: base,
      change: (Math.random() * 0.06 - 0.02),
      high: base * 1.032,
      low: base * 0.975,
      vol: "1.24B",
    });
    setPrice(base.toFixed(priceDec(asset)));
  }, [asset]);

  /* ── Ticker live drift ── */
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTicker(t => {
        const drift = t.last * (Math.random() * 0.0006 - 0.0003);
        return { ...t, last: Math.max(0.0001, t.last + drift) };
      });
    }, 1200);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [asset]);

  /* ── Order book ── */
  useEffect(() => {
    const gen = () => {
      const base = ASSET_BASE[asset] ?? 100;
      const entries: OrderEntry[] = [];
      for (let i = 0; i < 20; i++) {
        entries.push({
          price: base + (Math.random() * base * 0.003 - base * 0.0015),
          amount: Math.random() * 3,
          type: i < 10 ? "sell" : "buy",
        });
      }
      setOrderBook(entries.sort((a, b) => b.price - a.price));
    };
    gen();
    const id = setInterval(gen, 2500);
    return () => clearInterval(id);
  }, [asset]);

  /* ── Fetch balance & trades ── */
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await fetch("/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "gtpayout_wallet", uid }),
        });
        const data = await res.json();
        if (data.success) setBalance(parseFloat(data.trading_wallet.balance));
      } catch { /* silent */ }
    };
    const fetchTrades = async () => {
      try {
        const res = await fetch("/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "gtpayout_stats", uid }),
        });
        const data = await res.json();
        if (data.success) setRecentTrades(data.trades || []);
      } catch { /* silent */ }
    };
    fetchBalance();
    fetchTrades();

    const tid = setInterval(fetchTrades, 3000);
    return () => clearInterval(tid);
  }, [uid]);

  const dec = priceDec(asset);
  const sells = orderBook.filter(o => o.type === "sell").slice(0, 9);
  const buys  = orderBook.filter(o => o.type === "buy").slice(0, 9);
  const maxAmt = Math.max(...orderBook.map(o => o.amount), 0.0001);

  const fetchTrades = async () => {
    try {
      const res = await fetch("/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: "gtpayout_stats", uid }),
      });
      const data = await res.json();
      if (data.success) setRecentTrades(data.trades || []);
    } catch { /* silent */ }
  };

  const handleTrade = async (direction: "up" | "down") => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (amt > balance)    { toast.error("Insufficient trading balance"); return; }
    try {
      const res = await fetch("/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: "execute_trade", uid,
          symbol: asset, amount: amt,
          direction, duration: "manual",
          entry_price: ticker.last,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Order placed — ${direction === "up" ? "BUY" : "SELL"} ${amt} USDT`);
        setBalance(prev => prev - amt);
        setAmount("");
        fetchTrades();
      } else {
        toast.error(data.message || "Order failed");
      }
    } catch { toast.error("Connection error"); }
  };

  const handleCloseTrade = async (tid: string) => {
    setIsClosing(tid);
    try {
      const res = await fetch("/api/index.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: "close_trade", uid, tid,
          exit_price: ticker.last,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Trade closed. PnL: ${data.pnl.toFixed(2)} USDT`);
        fetchTrades();
        // Update balance
        const resBal = await fetch("/api/index.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: "gtpayout_wallet", uid }),
        });
        const dataBal = await resBal.json();
        if (dataBal.success) setBalance(parseFloat(dataBal.trading_wallet.balance));
      } else {
        toast.error(data.message || "Close failed");
      }
    } catch { toast.error("Connection error"); }
    finally { setIsClosing(null); }
  };

  const total = (parseFloat(price) || 0) * (parseFloat(amount) || 0);
  const changePositive = ticker.change >= 0;

  return (
    <GTpayoutLayout title="Spot Trading" fullWidth={true} hideTopBar={true}>
      <style>{`
        /* ── Base ── */
        .bybit-root { display:flex; flex-direction:column; height:100%; font-family:'Inter',system-ui,sans-serif; background:#0f172a; color:#eaecef; overflow:hidden; }

        /* ── Topbar ── */
        .bybit-topbar { display:flex; align-items:center; border-bottom:1px solid #1e293b; background:#0f172a; min-height:52px; padding:0 12px; gap:16px; flex-shrink:0; overflow:hidden; }
        .bybit-topbar-left { display:flex; align-items:center; gap:12px; flex-shrink:0; }
        .bybit-asset-sel { background:transparent; border:none; color:#eaecef; font-size:16px; font-weight:700; cursor:pointer; outline:none; padding:0; max-width:120px; }
        .bybit-asset-sel option { background:#1e293b; }
        .bybit-ticker-price { font-size:18px; font-weight:700; line-height:1.2; }
        .bybit-ticker-change { font-size:11px; font-weight:600; padding:2px 6px; border-radius:3px; white-space:nowrap; }
        .bybit-divider-v { width:1px; background:#1e293b; height:28px; flex-shrink:0; }
        /* Stats strip — scrollable on mobile, visible row on desktop */
        .bybit-topbar-stats { display:flex; gap:16px; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; flex:1; min-width:0; padding:4px 0; }
        .bybit-topbar-stats::-webkit-scrollbar { display:none; }
        .bybit-topbar-stat { display:flex; flex-direction:column; gap:1px; flex-shrink:0; }
        .bybit-topbar-stat span:first-child { font-size:10px; color:#848e9c; white-space:nowrap; }
        .bybit-topbar-stat span:last-child  { font-size:12px; font-weight:500; color:#eaecef; white-space:nowrap; }

        /* ── Body grid ── */
        /* Desktop: orderbook | chart+trades | form */
        .bybit-body { display:grid; grid-template-columns:200px 1fr 280px; flex:1; min-height:0; overflow:hidden; border-top:1px solid #1e293b; }

        /* ── Order book ── */
        .bybit-orderbook { display:flex; flex-direction:column; border-right:1px solid #1e293b; overflow:hidden; }
        .bybit-ob-header { padding:10px 12px; border-bottom:1px solid #1e293b; font-size:11px; font-weight:600; color:#848e9c; text-transform:uppercase; letter-spacing:.5px; }
        .bybit-ob-cols { display:grid; grid-template-columns:1fr 1fr 1fr; padding:4px 8px; font-size:10px; color:#848e9c; font-weight:600; }
        .bybit-ob-rows { flex:1; overflow-y:auto; }
        .bybit-ob-row { display:grid; grid-template-columns:1fr 1fr 1fr; padding:2px 8px; position:relative; cursor:pointer; font-size:11px; transition:background .1s; }
        .bybit-ob-row:hover { background:#1e293b; }
        .bybit-ob-bar { position:absolute; top:0; right:0; bottom:0; }
        .bybit-ob-row span { position:relative; z-index:1; font-family:'JetBrains Mono',monospace; }
        .bybit-ob-amt   { color:#eaecef; text-align:right; }
        .bybit-ob-total { color:#848e9c; text-align:right; }
        .bybit-ob-spread { text-align:center; padding:6px 0; font-size:13px; font-weight:700; border-top:1px solid #1e293b; border-bottom:1px solid #1e293b; background:#0f172a; }

        /* ── Chart + trades pane ── */
        .bybit-center { display:flex; flex-direction:column; overflow:hidden; min-width:0; }
        .bybit-chart-wrap { flex:1; min-height:0; overflow:hidden; }
        .bybit-trades-panel { height:190px; border-top:1px solid #1e293b; display:flex; flex-direction:column; overflow:hidden; flex-shrink:0; }
        .bybit-tabs { display:flex; border-bottom:1px solid #1e293b; }
        .bybit-tab { padding:9px 16px; font-size:12px; font-weight:600; cursor:pointer; color:#848e9c; border-bottom:2px solid transparent; transition:all .15s; background:transparent; border-top:none; border-left:none; border-right:none; white-space:nowrap; }
        .bybit-tab.active { color:#f0b90b; border-bottom-color:#f0b90b; }
        .bybit-trades-table { flex:1; overflow-y:auto; overflow-x:auto; }
        .bybit-trades-table table { width:100%; border-collapse:collapse; font-size:11px; min-width:340px; }
        .bybit-trades-table thead th { padding:6px 12px; color:#848e9c; font-weight:600; text-align:left; position:sticky; top:0; background:#0f172a; white-space:nowrap; }
        .bybit-trades-table tbody td { padding:5px 12px; border-bottom:1px solid #1e293b; color:#eaecef; white-space:nowrap; }

        /* ── Order form ── */
        .bybit-form { border-left:1px solid #1e293b; display:flex; flex-direction:column; overflow-y:auto; background:#0f172a; min-width:0; }
        .bybit-form-inner { padding:14px; display:flex; flex-direction:column; gap:12px; }
        .bybit-side-tabs { display:grid; grid-template-columns:1fr 1fr; background:#1e293b; border-radius:4px; padding:3px; }
        .bybit-side-btn { padding:7px 0; text-align:center; font-size:13px; font-weight:700; cursor:pointer; border-radius:3px; border:none; background:transparent; color:#848e9c; transition:all .15s; }
        .bybit-side-btn.buy.active  { background:#26a17b; color:#fff; }
        .bybit-side-btn.sell.active { background:#ef5350; color:#fff; }
        .bybit-type-tabs { display:flex; border-bottom:1px solid #1e293b; margin:0 -14px; }
        .bybit-type-btn { padding:6px 14px; font-size:12px; font-weight:600; cursor:pointer; color:#848e9c; border:none; background:transparent; border-bottom:2px solid transparent; transition:all .15s; }
        .bybit-type-btn.active { color:#f0b90b; border-bottom-color:#f0b90b; }
        .bybit-field-group { display:flex; flex-direction:column; gap:5px; }
        .bybit-field-label { font-size:11px; color:#848e9c; font-weight:500; }
        .bybit-field-row { display:flex; align-items:center; background:#1e293b; border:1px solid #334155; border-radius:4px; height:42px; overflow:hidden; transition:border-color .15s; }
        .bybit-field-row:focus-within { border-color:#f0b90b55; }
        .bybit-field-row input { flex:1; background:transparent; border:none; outline:none; color:#eaecef; font-size:14px; font-weight:500; padding:0 10px; height:100%; font-family:'JetBrains Mono',monospace; min-width:0; }
        .bybit-field-tag { padding:0 10px; font-size:11px; color:#848e9c; font-weight:600; white-space:nowrap; flex-shrink:0; }
        .bybit-pct-row { display:grid; grid-template-columns:repeat(4,1fr); gap:6px; }
        .bybit-pct-btn { background:#1e293b; border:1px solid #334155; color:#848e9c; font-size:11px; font-weight:700; padding:6px 0; border-radius:4px; cursor:pointer; text-align:center; transition:all .15s; }
        .bybit-pct-btn:hover { border-color:#f0b90b; color:#f0b90b; }
        .bybit-total-row { display:flex; justify-content:space-between; font-size:11px; }
        .bybit-total-row span:first-child { color:#848e9c; }
        .bybit-total-row span:last-child  { color:#eaecef; font-family:'JetBrains Mono',monospace; }
        .bybit-submit-btn { width:100%; height:46px; border:none; border-radius:4px; font-size:14px; font-weight:700; cursor:pointer; letter-spacing:.3px; transition:filter .15s; }
        .bybit-submit-btn:hover { filter:brightness(1.12); }
        .bybit-submit-btn.buy  { background:#26a17b; color:#fff; }
        .bybit-submit-btn.sell { background:#ef5350; color:#fff; }
        .bybit-avbl-row { display:flex; justify-content:space-between; }
        .bybit-avbl-row span:first-child { font-size:11px; color:#848e9c; }
        .bybit-avbl-row span:last-child  { font-size:11px; color:#eaecef; font-family:'JetBrains Mono',monospace; }
        .bybit-market-info { border-top:1px solid #1e293b; padding:12px 14px; display:flex; flex-direction:column; gap:9px; }
        .bybit-info-row { display:flex; justify-content:space-between; font-size:11px; }
        .bybit-info-row span:first-child { color:#848e9c; }
        .bybit-info-row span:last-child  { color:#eaecef; font-weight:500; }

        /* ── Color utils ── */
        .bybit-col-green { color:#26a17b; }
        .bybit-col-red   { color:#ef5350; }
        .bybit-col-yellow{ color:#f0b90b; }

        /* ── Scrollbar ── */
        .bybit-root ::-webkit-scrollbar { width:4px; height:4px; }
        .bybit-root ::-webkit-scrollbar-track { background:transparent; }
        .bybit-root ::-webkit-scrollbar-thumb { background:#334155; border-radius:2px; }

        /* ── Tablet: hide order book ── */
        @media (max-width:1100px) {
          .bybit-body { grid-template-columns:1fr 260px; }
          .bybit-orderbook { display:none; }
        }

        /* ── Mobile: single column, chart on top, form below ── */
        @media (max-width:640px) {
          .bybit-root { overflow-y:auto; height:auto; min-height:100%; }
          .bybit-topbar { gap:10px; padding:0 10px; min-height:48px; }
          .bybit-ticker-price { font-size:15px; }
          .bybit-body {
            grid-template-columns:1fr;
            grid-template-rows:auto;
            display:flex;
            flex-direction:column;
            overflow:visible;
            height:auto;
          }
          .bybit-center {
            height:auto;
            overflow:visible;
            flex-shrink:0;
          }
          .bybit-chart-wrap {
            height:300px;
            flex:none;
            overflow:hidden;
          }
          .bybit-trades-panel {
            height:auto;
            max-height:220px;
            flex-shrink:0;
          }
          .bybit-form {
            border-left:none;
            border-top:1px solid #1e293b;
            overflow:visible;
            flex-shrink:0;
          }
          .bybit-form-inner { padding:12px; }
          .bybit-market-info { padding:12px; }
          .bybit-type-tabs { margin:0 -12px; }
        }
      `}</style>

      <div className="bybit-root">

        {/* ── Topbar ── */}
        <div className="bybit-topbar">
          {/* Mobile Menu Trigger */}
          <button
            onClick={() => {
               // We need a way to open the sidebar from here since TopBar is hidden
               // In a real app we'd use a Context or a global state, but for now
               // let's just trigger a click on the hidden sidebar overlay if it were open
               // Actually, the sidebar is handled in GTpayoutLayout.
               // Let's add a simple bars icon for mobile.
               document.dispatchEvent(new CustomEvent('toggle-gt-sidebar'));
            }}
            className="lg:hidden p-2 text-slate-400 hover:text-white"
          >
            <FaBars />
          </button>

          {/* Left: asset selector + live price — always visible, never shrinks */}
          <div className="bybit-topbar-left">
            <select
              className="bybit-asset-sel"
              value={asset}
              onChange={e => setAsset(e.target.value)}
            >
              {ASSETS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            <div className="bybit-divider-v" />

            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <span
                className="bybit-ticker-price"
                style={{ color: changePositive ? "#26a17b" : "#ef5350" }}
              >
                {fmt(ticker.last, dec)}
              </span>
              <span
                className="bybit-ticker-change"
                style={{
                  color: changePositive ? "#26a17b" : "#ef5350",
                  background: changePositive ? "rgba(38,161,123,.12)" : "rgba(239,83,80,.12)",
                  display: "inline-block",
                  width: "fit-content",
                }}
              >
                {changePositive ? "+" : ""}{(ticker.change * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Right: scrollable stats strip */}
          <div className="bybit-topbar-stats">
            {[
              { label: "24h High",   value: fmt(ticker.high, dec) },
              { label: "24h Low",    value: fmt(ticker.low, dec) },
              { label: "24h Volume", value: ticker.vol + " USDT" },
              { label: "Payout",     value: "+85%" },
            ].map(s => (
              <div key={s.label} className="bybit-topbar-stat">
                <span>{s.label}</span>
                <span>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="bybit-body">

          {/* ── Order Book ── */}
          <div className="bybit-orderbook">
            <div className="bybit-ob-header">Order Book</div>
            <div className="bybit-ob-cols">
              <span>Price</span><span style={{ textAlign: "right" }}>Amount</span><span style={{ textAlign: "right" }}>Total</span>
            </div>
            <div className="bybit-ob-rows">
              {sells.map((o, i) => (
                <BookRow key={`s${i}`} {...o} maxAmt={maxAmt} dec={dec} />
              ))}
            </div>
            <div className="bybit-ob-spread">
              <span style={{ color: changePositive ? "#26a17b" : "#ef5350" }}>
                {fmt(ticker.last, dec)}
              </span>
            </div>
            <div className="bybit-ob-rows">
              {buys.map((o, i) => (
                <BookRow key={`b${i}`} {...o} maxAmt={maxAmt} dec={dec} />
              ))}
            </div>
          </div>

          {/* ── Chart + Trades ── */}
          <div className="bybit-center">
            <div className="bybit-chart-wrap">
              <TradingChart
                symbol={asset}
                positions={recentTrades}
                currentPrice={ticker.last}
              />
            </div>

            <div className="bybit-trades-panel">
              <div className="bybit-tabs">
                <button
                  className={`bybit-tab ${activeTab === "positions" ? "active" : ""}`}
                  onClick={() => setActiveTab("positions")}
                >
                  Open Orders
                </button>
                <button
                  className={`bybit-tab ${activeTab === "history" ? "active" : ""}`}
                  onClick={() => setActiveTab("history")}
                >
                  Trade History
                </button>
              </div>
              <div className="bybit-trades-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Pair</th>
                      <th>Side</th>
                      <th>Amount (USDT)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeTab === "positions" ? recentTrades.filter(t => t.status === 'open') : recentTrades.filter(t => t.status !== 'open')).length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "24px 0", color: "#848e9c" }}>
                          No records found
                        </td>
                      </tr>
                    ) : (activeTab === "positions" ? recentTrades.filter(t => t.status === 'open') : recentTrades.filter(t => t.status !== 'open')).map((t, i) => {
                      const entryPrice = parseFloat(t.entry_price);
                      const currentPrice = ticker.last;
                      const amount = parseFloat(t.amount);
                      const pctDiff = (currentPrice - entryPrice) / entryPrice;
                      const pnl = t.direction === 'up' ? pctDiff * amount : -pctDiff * amount;
                      const pnlColor = pnl >= 0 ? "bybit-col-green" : "bybit-col-red";

                      return (
                        <tr key={i}>
                          <td>{new Date(t.start_time).toLocaleTimeString()}</td>
                          <td style={{ fontWeight: 600 }}>{t.asset_symbol}</td>
                          <td className={t.direction === "up" ? "bybit-col-green" : "bybit-col-red"} style={{ fontWeight: 700 }}>
                            {t.direction === "up" ? "BUY" : "SELL"}
                          </td>
                          <td>${amount.toLocaleString()}</td>
                          <td>
                            {activeTab === "positions" ? (
                              <div className="flex items-center gap-3">
                                <span className={pnlColor} style={{ fontWeight: 700 }}>
                                  {pnl >= 0 ? "+" : ""}{pnl.toFixed(2)}
                                </span>
                                <button
                                  onClick={() => handleCloseTrade(t.trade_id)}
                                  disabled={isClosing === t.trade_id}
                                  className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-[9px] font-bold uppercase transition-colors"
                                >
                                  {isClosing === t.trade_id ? "..." : "Close"}
                                </button>
                              </div>
                            ) : (
                              <span style={{
                                display: "inline-block",
                                padding: "2px 8px",
                                borderRadius: 3,
                                fontSize: 10,
                                fontWeight: 700,
                                background: t.status === "won" ? "rgba(38,161,123,.15)" : "rgba(240,185,11,.1)",
                                color: t.status === "won" ? "#26a17b" : "#f0b90b",
                              }}>
                                {t.status.toUpperCase()}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ── Order Form ── */}
          <div className="bybit-form">
            {/* Side toggle */}
            <div className="bybit-form-inner">
              <div className="bybit-side-tabs">
                <button
                  className={`bybit-side-btn buy ${side === "buy" ? "active" : ""}`}
                  onClick={() => setSide("buy")}
                >
                  Buy
                </button>
                <button
                  className={`bybit-side-btn sell ${side === "sell" ? "active" : ""}`}
                  onClick={() => setSide("sell")}
                >
                  Sell
                </button>
              </div>

              {/* Order type */}
              <div className="bybit-type-tabs">
                {(["limit", "market"] as OrderType[]).map(t => (
                  <button
                    key={t}
                    className={`bybit-type-btn ${orderType === t ? "active" : ""}`}
                    onClick={() => setOrderType(t)}
                    style={{ textTransform: "capitalize" }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Available */}
              <div className="bybit-avbl-row">
                <span>Available</span>
                <span>{fmt(balance)} USDT</span>
              </div>

              {/* Price field (limit only) */}
              {orderType === "limit" && (
                <div className="bybit-field-group">
                  <div className="bybit-field-label">Price</div>
                  <div className="bybit-field-row">
                    <input
                      type="number"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0.00"
                    />
                    <span className="bybit-field-tag">USDT</span>
                  </div>
                </div>
              )}

              {orderType === "market" && (
                <div className="bybit-field-group">
                  <div className="bybit-field-label">Price</div>
                  <div className="bybit-field-row" style={{ opacity: 0.5 }}>
                    <input type="text" value="Market Price" readOnly style={{ cursor: "not-allowed" }} />
                  </div>
                </div>
              )}

              {/* Amount */}
              <div className="bybit-field-group">
                <div className="bybit-field-label">Amount</div>
                <div className="bybit-field-row">
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <span className="bybit-field-tag">USDT</span>
                </div>
              </div>

              {/* Pct buttons */}
              <div className="bybit-pct-row">
                {PCTS.map(p => (
                  <button
                    key={p}
                    className="bybit-pct-btn"
                    onClick={() => setAmount((balance * (parseInt(p) / 100)).toFixed(2))}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Total */}
              <div className="bybit-total-row">
                <span>Order value</span>
                <span>{orderType === "market" ? "—" : fmt(total)} USDT</span>
              </div>

              {/* Submit */}
              <button
                className={`bybit-submit-btn ${side}`}
                onClick={() => handleTrade(side === "buy" ? "up" : "down")}
              >
                {side === "buy"
                  ? <><FaArrowUp style={{ display: "inline", marginRight: 6 }} />Buy {asset.split("/")[0]}</>
                  : <><FaArrowDown style={{ display: "inline", marginRight: 6 }} />Sell {asset.split("/")[0]}</>
                }
              </button>
            </div>

            {/* Market info */}
            <div className="bybit-market-info">
              {[
                { label: "Payout",         value: "+85%",    color: "#26a17b" },
                { label: "Min order",       value: "$10.00",  color: "#eaecef" },
                { label: "Market",          value: "Open",    color: "#26a17b" },
                { label: "Maker fee",       value: "0.10%",   color: "#eaecef" },
                { label: "Taker fee",       value: "0.10%",   color: "#eaecef" },
              ].map(r => (
                <div key={r.label} className="bybit-info-row">
                  <span>{r.label}</span>
                  <span style={{ color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </GTpayoutLayout>
  );
};

export default ManualTrading;