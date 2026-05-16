import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Send, MoreVertical, Paperclip, Smile, ShieldCheck } from "lucide-react";

interface Message {
  id: number;
  user: ChatUser;
  text: string;
  timestamp: string;
  isBot?: boolean;
  isTyping?: boolean;
}

interface ChatUser {
  name: string;
  role: "trader" | "analyst" | "quant";
  initials: string;
  color: string;
}

const tradingDiscussions = [
  { q: "What's the best indicator for identifying trend reversals?", a: "RSI divergence combined with a volume spike is one of the most reliable signals. When price makes a new high but RSI doesn't follow, that's a classic bearish divergence." },
  { q: "How do you determine your position size?", a: "The standard rule is risking no more than 1–2% of total capital per trade. Use the ATR to set your stop, then back-calculate into position size." },
  { q: "Is the 200-day moving average still relevant?", a: "Absolutely. Institutions watch it closely. Price consistently above = bullish structure, below = distribution phase. It's a self-fulfilling signal at this point." },
  { q: "What's the difference between support and resistance levels?", a: "Support is a price floor where demand tends to absorb selling. Resistance is a ceiling where supply overwhelms buying. They often flip roles after a breakout." },
  { q: "How do I read candlestick wicks?", a: "Long lower wicks indicate strong rejection of lower prices — buyers stepped in hard. Long upper wicks show sellers defending a level. Context matters a lot." },
  { q: "Should I trade the 1H or 4H chart?", a: "4H gives cleaner structure and less noise. Use it to identify trend and key zones, then drop to 1H for precise entries. Top-down analysis is key." },
  { q: "What is VWAP and how do traders use it?", a: "VWAP is the average price weighted by volume. Intraday traders use it as a fair-value anchor — price above VWAP is bullish bias, below is bearish." },
  { q: "What does 'confluence' mean in trading?", a: "Multiple independent signals pointing to the same trade setup. E.g. a key support level + oversold RSI + high-volume candle — that's high-confluence and increases probability." },
  { q: "How do you manage a losing trade?", a: "Stick to your pre-defined stop loss. Emotional holds are how small losses turn into catastrophic ones. Cut it, review the setup, and move on." },
  { q: "What is order flow and why does it matter?", a: "Order flow reveals who's actually buying and selling at each price level. Reading the tape and DOM gives you insight into institutional intent before price moves." },
  { q: "What's the difference between a limit and a stop order?", a: "A limit order executes at your price or better — ideal for entries at key levels. A stop order triggers at market once your price is hit, used for breakouts or stop losses." },
  { q: "What is a head and shoulders pattern?", a: "A reversal pattern with three peaks — a higher middle peak (head) flanked by two lower peaks (shoulders). A break below the neckline confirms the reversal." },
  { q: "How reliable are chart patterns?", a: "Patterns have edge only with volume confirmation and market context. A head & shoulders in a raging bull market is less meaningful than one forming after an exhausted trend." },
  { q: "What is the Wyckoff Method?", a: "A framework for reading market cycles through accumulation, markup, distribution, and markdown phases. It explains how smart money absorbs supply before big moves." },
  { q: "What is a liquidity sweep?", a: "When price briefly breaks a key level to trigger stop-losses and limit orders, then reverses sharply. Smart money hunts liquidity before making the real move." },
  { q: "How do funding rates affect crypto price?", a: "Very high positive funding means longs are paying shorts — the market is overheated. This often precedes a flush. Negative funding can signal a trend reversal to the upside." },
  { q: "What is open interest and how do you read it?", a: "Open interest is the total number of outstanding contracts. Rising OI with rising price confirms the trend. Rising OI with falling price signals bearish pressure building." },
  { q: "What is a death cross?", a: "When the 50-day MA crosses below the 200-day MA. It's a lagging bearish signal, but institutional algorithms react to it, making it a meaningful event." },
  { q: "What is a golden cross?", a: "The bullish counterpart — the 50-day MA crosses above the 200-day MA. Historically a medium-term bullish signal, especially when confirmed by rising volume." },
  { q: "What does 'price discovery' mean?", a: "When an asset breaks into uncharted territory above its ATH, there are no historical reference points. Price discovery can be fast and volatile as markets establish new value." },
  { q: "How do macro factors affect crypto?", a: "Fed rate decisions, CPI prints, and DXY strength heavily influence risk asset sentiment. Crypto often trades like high-beta tech in macro-driven environments." },
  { q: "What is a falling wedge pattern?", a: "A bullish continuation or reversal pattern where price makes lower highs and lower lows within converging trendlines. A breakout above the upper trendline is the entry signal." },
  { q: "What is the significance of volume in technical analysis?", a: "Volume validates price moves. A breakout on low volume is suspect. A reversal candle on massive volume has far more credibility." },
  { q: "What is delta in options trading?", a: "Delta measures how much an option's price moves per $1 move in the underlying. A delta of 0.7 means the option gains $0.70 for every $1 increase in the underlying." },
  { q: "What are the Greeks in options trading?", a: "Delta, gamma, theta, vega, and rho. They measure sensitivity to price, rate of change, time decay, volatility, and interest rates respectively." },
  { q: "What is implied volatility (IV)?", a: "IV is the market's expectation of future volatility, derived from options pricing. High IV = expensive options. Selling options in high IV environments can be profitable." },
  { q: "What is a gamma squeeze?", a: "When a stock rises and market makers must buy the underlying to hedge sold calls, pushing prices higher and forcing more buying — a reflexive feedback loop." },
  { q: "What is the risk-reward ratio?", a: "The ratio of potential profit to potential loss on a trade. Most professionals aim for at least 2:1 or 3:1 — meaning potential gain is 2–3x the amount risked." },
  { q: "What is the Fibonacci retracement tool used for?", a: "Identifying potential support/resistance levels at 23.6%, 38.2%, 50%, 61.8%, and 78.6% of a prior move. The 61.8% (golden ratio) is particularly respected." },
  { q: "What is market microstructure?", a: "The study of bid-ask spreads, order book depth, and trade execution mechanics. Understanding it helps traders minimize slippage and identify where liquidity sits." },
  { q: "What is a breakout trade?", a: "A trade entered when price clears a well-established resistance level with strong volume, anticipating continuation. False breakouts (fakeouts) are the main risk." },
  { q: "What is the ADX indicator?", a: "Average Directional Index measures trend strength, not direction. Above 25 indicates a strong trend. Below 20 = ranging market. Best used to filter your strategy." },
  { q: "How do I identify market phases?", a: "Look for accumulation (tight range, low volume), markup (trending up), distribution (range at highs, high volume), and markdown (downtrend). Wyckoff's framework is useful here." },
  { q: "What is a stop hunt?", a: "Intentional price manipulation by large players to trigger retail stop-losses below obvious support levels before pushing price in the intended direction." },
  { q: "What is the significance of round numbers?", a: "Round numbers like $50k, $100k act as psychological support/resistance. Large orders cluster here, and options market makers hedge near these levels too." },
  { q: "What is a carry trade?", a: "Borrowing in a low-interest-rate currency to invest in a higher-yielding one. In crypto, it involves borrowing on one chain and deploying into higher-yield protocols." },
  { q: "What is mean reversion?", a: "The tendency for prices to return to their historical average. Useful in ranging markets — overbought RSI in a channel often reverts to the mean." },
  { q: "What is the difference between swing and day trading?", a: "Day traders hold positions for hours and close EOD. Swing traders hold for days to weeks, capturing larger moves with less screen time." },
  { q: "What is the Sharpe ratio?", a: "Measures risk-adjusted return — returns per unit of volatility. A Sharpe above 1.0 is acceptable, above 2.0 is excellent for a trading strategy." },
  { q: "What is a double bottom pattern?", a: "A reversal pattern with two roughly equal lows at support. A breakout above the neckline between them confirms the pattern — textbook entry point." },
  { q: "What is tape reading?", a: "Analyzing the live stream of time-and-sales data to gauge momentum and identify large institutional prints. A skill that separates experienced traders from beginners." },
  { q: "How does correlation affect portfolio risk?", a: "Highly correlated assets move together, negating diversification. In crypto, BTC dominance drives most altcoins — a true diversification requires uncorrelated assets." },
  { q: "What is the difference between trending and ranging markets?", a: "Trending markets have directional momentum — momentum strategies work best. Ranging markets oscillate between levels — mean-reversion strategies work better." },
  { q: "What are key economic indicators to watch?", a: "CPI, PCE, NFP, FOMC rate decisions, and the DXY index are the most market-moving macro data points. They set risk-on/risk-off sentiment globally." },
  { q: "What is the significance of the weekly close?", a: "The weekly candle close gives the cleanest picture of market sentiment. Institutions often use weekly support/resistance to plan their trade executions." },
  { q: "What is 'smart money' in trading?", a: "Refers to institutional players — hedge funds, banks, market makers — who move markets. Retail traders try to identify their footprints in the volume and order flow." },
  { q: "What is a triple top pattern?", a: "Three consecutive peaks at similar price levels. A failure to break resistance three times signals strong distribution. Break below the neckline is the entry signal." },
  { q: "What is the put/call ratio?", a: "The ratio of put options to call options. A high P/C ratio indicates bearish sentiment and can be a contrarian bullish signal when extreme." },
  { q: "What is divergence in technical analysis?", a: "When price and a momentum indicator (RSI, MACD) move in opposite directions. Bullish divergence: price makes lower lows but indicator makes higher lows." },
  { q: "What is a pennant pattern?", a: "A short consolidation after a sharp move, forming converging trendlines. It's a continuation pattern — the move after the breakout often mirrors the move before it." },
  { q: "What is dollar-cost averaging (DCA)?", a: "Investing a fixed amount at regular intervals regardless of price. Reduces the impact of volatility and eliminates the need to time market entries perfectly." },
  { q: "What is 'the trend is your friend'?", a: "A core trading principle: trading in the direction of the dominant trend has higher probability of success than fighting it. Against-trend trades need tighter risk management." },
  { q: "What is relative strength?", a: "Comparing an asset's performance to a benchmark. An asset showing strength while the market sells off is a rotation signal — institutions are accumulating it." },
  { q: "What is backtesting?", a: "Testing a trading strategy on historical data to evaluate its performance before risking real capital. It reveals win rate, drawdown, and expected value of the system." },
  { q: "What is a long squeeze?", a: "When long positions are forced to close as prices drop, creating a cascading sell-off. Often triggered by a break below key support, amplifying the downside move." },
  { q: "What is slippage in trading?", a: "The difference between the expected and actual execution price. High slippage occurs in illiquid markets or during fast-moving volatile conditions." },
  { q: "What is a high-time-frame (HTF) bias?", a: "Your directional conviction based on a higher timeframe (daily/weekly) chart. Aligning lower timeframe entries with the HTF bias dramatically improves win rate." },
  { q: "What is the difference between realized and unrealized PnL?", a: "Unrealized PnL is paper profit/loss on an open position. Realized PnL is locked in when you close. A profitable unrealized position can become a loss if not managed." },
  { q: "What is a bear flag pattern?", a: "A brief consolidation period in a downtrend, forming a small upward channel. The continuation break lower is the entry. Measured move targets the prior pole length." },
  { q: "What is the Elliott Wave Theory?", a: "A framework proposing that markets move in 5-wave impulse sequences followed by 3-wave corrections. Highly subjective but widely used by institutional analysts." },
  { q: "How do on-chain metrics influence price?", a: "Metrics like whale wallet accumulation, exchange inflows/outflows, and SOPR can give early signals of distribution or accumulation phases before they appear on charts." },
  { q: "What is a flash crash?", a: "A sudden, extreme price drop caused by automated trading, thin liquidity, or large market orders. They are usually short-lived and often create strong buying opportunities." },
  { q: "What is the difference between margin and leverage?", a: "Margin is the collateral you put up. Leverage multiplies your exposure beyond that margin. 10x leverage means a 10% adverse move wipes your margin entirely." },
  { q: "What is the Ichimoku Cloud?", a: "A comprehensive indicator showing support/resistance, trend direction, and momentum simultaneously. Price above the cloud = bullish, below = bearish. Used extensively in Asian markets." },
  { q: "What is an ascending triangle pattern?", a: "Flat resistance with rising lows — buyers are increasingly aggressive. A breakout above the flat resistance is a high-probability continuation trade." },
  { q: "What is market sentiment analysis?", a: "Gauging the overall mood of market participants through Fear & Greed Index, social volume, funding rates, and options skew. Extreme fear is often a contrarian buy signal." },
  { q: "What is a descending channel?", a: "Lower highs and lower lows forming parallel trendlines. In an uptrend, it's often a corrective pattern — a breakout above the upper channel is a re-entry signal." },
  { q: "What is CVD (Cumulative Volume Delta)?", a: "Tracks the net difference between buying and selling volume over time. Rising price with declining CVD suggests the rally is weak and may not sustain." },
  { q: "What is a wash trade?", a: "Simultaneously buying and selling an asset to create the illusion of volume. It's market manipulation and often signals a pump before a dump." },
  { q: "What is the significance of higher highs and higher lows?", a: "The basic definition of an uptrend — each swing high and swing low is higher than the last. A break of the most recent higher low is an early warning of trend reversal." },
  { q: "What is the best time of day to trade crypto?", a: "Volatility peaks during US market open (9:30–11:30 ET) and the London-NY session overlap. Liquidity is thinnest on weekends, increasing slippage risk." },
  { q: "What is a consolidation zone?", a: "A price range where an asset trades sideways with no clear directional trend. It represents a balance between buyers and sellers — a breakout resolves the balance." },
  { q: "What is the relationship between BTC dominance and altcoins?", a: "When BTC dominance rises, capital flows into BTC and alts bleed. When dominance falls, capital rotates into altcoins — the beginning of an 'alt season'." },
  { q: "What is a parabolic move?", a: "Exponential price acceleration driven by retail FOMO. Parabolic moves are unsustainable and typically retrace at least 80%+ of the move when they break." },
  { q: "What is market cap dominance?", a: "The percentage of total crypto market cap held by a single asset. BTC dominance is a key macro indicator for capital rotation across the crypto ecosystem." },
  { q: "What is a spinning top candlestick?", a: "A candle with a small body and long wicks in both directions. It signals indecision and uncertainty about the next move — context determines its significance." },
  { q: "What is 'chasing price' and why is it risky?", a: "Entering a trade after a big move has already happened, buying the top or selling the bottom. It dramatically worsens your risk-reward and is a common beginner mistake." },
  { q: "What is the best way to journal trades?", a: "Record the setup, entry, stop, target, position size, outcome, and your emotional state. Reviewing patterns in your mistakes is the fastest way to improve as a trader." },
  { q: "What is the significance of the daily close?", a: "Daily closes above or below key levels carry significant weight. Institutions reassess positions at EOD — a strong daily close above resistance confirms a breakout." },
  { q: "What is a market maker?", a: "An entity that provides liquidity by continuously quoting bid and ask prices. They profit from the spread and strategically manage their inventory to avoid directional risk." },
  { q: "What is 'price action trading'?", a: "Trading based purely on reading raw price movement — candlestick patterns, support/resistance, and structure — without relying on lagging indicators." },
  { q: "What is a symmetrical triangle?", a: "Converging trendlines with no defined bias. It's a neutral pattern until the breakout direction is confirmed. Volume should expand on the breakout candle." },
  { q: "What is the significance of the 50% retracement level?", a: "Not a Fibonacci number technically, but Gann and many traders treat the midpoint of a move as a key battleground. It's often where the most heated buying/selling occurs." },
  { q: "What is sector rotation in crypto?", a: "Capital moves through sectors — BTC leads, then ETH, then large caps, then mid caps, then small caps. Identifying the rotation stage helps time altcoin exposure." },
  { q: "What is a range trade?", a: "Buying at established support and selling at established resistance within a defined price channel. It works until a breakout occurs, so stop placement is critical." },
  { q: "What does 'distribution' look like on a chart?", a: "High volume, volatile price action at highs, repeated failures to make new highs. Large players are selling into retail demand. Often followed by a sudden price drop." },
  { q: "What is 'accumulation' in Wyckoff terms?", a: "A phase where large players quietly buy an asset while keeping price suppressed. Characterized by low-volume, tight-range trading before a markup phase begins." },
  { q: "What is the importance of liquidity in a trade?", a: "More liquidity means tighter spreads, lower slippage, and easier position management. Illiquid assets can be difficult to exit — especially in large size." },
  { q: "What is the VIX and does it relate to crypto?", a: "VIX measures S&P 500 implied volatility — the 'fear gauge'. High VIX often correlates with crypto selloffs as risk-off sentiment dominates across all markets." },
  { q: "What is a bear trap?", a: "A false breakdown below support that triggers short-sellers, then reverses sharply upward — trapping short positions. Strong upside volume confirms the trap." },
  { q: "What is a bull trap?", a: "The inverse — a false breakout above resistance lures buyers in, then collapses below. Common at ATHs or key resistance. Volume divergence often warns of it." },
  { q: "What is trade expectancy?", a: "The average amount you can expect to win or lose per trade: (Win Rate × Avg Win) – (Loss Rate × Avg Loss). A system can be profitable even with a low win rate if the R:R is high." },
  { q: "What is 'scaling in and out' of positions?", a: "Adding to a position in tranches as it moves in your favor, and taking partial profits at key levels. It improves average entry price and secures gains while staying exposed." },
  { q: "What is an inverted head and shoulders?", a: "A bullish reversal pattern — three troughs with the middle one lower. A breakout above the neckline is a high-conviction entry with a measured upside target." },
  { q: "What is the significance of news trading?", a: "High-impact news creates volatility spikes that can stop out positions before moving in the intended direction. Many pros avoid holding through scheduled announcements." },
  { q: "What is 'cutting losers and letting winners run'?", a: "A core principle: close losing trades quickly at predefined stops, and resist the urge to take profits too early. Asymmetry between losses and wins drives long-term profitability." },
  { q: "What is the difference between alpha and beta?", a: "Beta measures market correlation — high beta assets are more volatile relative to the market. Alpha is excess return above a benchmark, attributed to skill rather than market movement." },
  { q: "What is a measured move?", a: "Projecting the expected target of a breakout by measuring the height of the prior consolidation and adding it to the breakout point. Simple, widely-used price target technique." },
];

const chatUsers: ChatUser[] = [
  { name: "AlexTrades", role: "trader", initials: "AT", color: "#16a34a" },
  { name: "QuantRex", role: "quant", initials: "QR", color: "#d97706" },
  { name: "MarketOwl", role: "analyst", initials: "MO", color: "#2563eb" },
  { name: "SigmaAlpha", role: "trader", initials: "SA", color: "#16a34a" },
  { name: "VixWatcher", role: "analyst", initials: "VW", color: "#2563eb" },
  { name: "DeltaFlow", role: "quant", initials: "DF", color: "#d97706" },
  { name: "NexusPrime", role: "trader", initials: "NP", color: "#16a34a" },
  { name: "ChainLogic", role: "analyst", initials: "CL", color: "#2563eb" },
  { name: "TapeReader99", role: "trader", initials: "TR", color: "#16a34a" },
  { name: "MomDispatch", role: "quant", initials: "MD", color: "#d97706" },
  { name: "StructureGuru", role: "analyst", initials: "SG", color: "#2563eb" },
  { name: "OrderFlowX", role: "trader", initials: "OF", color: "#16a34a" },
];

const roleBadgeStyles: Record<string, string> = {
  analyst: "bg-blue-100 text-blue-800",
  quant: "bg-yellow-100 text-yellow-800",
  trader: "bg-green-100 text-green-800",
};

const tickers = [
  { sym: "BTC", price: "$67,420", change: "+1.3%", up: true },
  { sym: "ETH", price: "$3,541", change: "+0.8%", up: true },
  { sym: "SOL", price: "$148.2", change: "-0.5%", up: false },
  { sym: "BNB", price: "$592", change: "+2.1%", up: true },
  { sym: "AVAX", price: "$37.8", change: "-1.2%", up: false },
  { sym: "LINK", price: "$18.4", change: "+3.4%", up: true },
];

const Community: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef([...tradingDiscussions]);
  let idCounter = useRef(0);

  const getNextQA = () => {
    if (!poolRef.current.length) poolRef.current = [...tradingDiscussions];
    const idx = Math.floor(Math.random() * poolRef.current.length);
    return poolRef.current.splice(idx, 1)[0];
  };

  const getRandomUser = (): ChatUser =>
    chatUsers[Math.floor(Math.random() * chatUsers.length)];

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  useEffect(() => {
    const postPair = () => {
      const qa = getNextQA();
      let asker = getRandomUser();
      let answerer = getRandomUser();
      while (answerer.name === asker.name) answerer = getRandomUser();

      const qId = ++idCounter.current;
      const typingId = ++idCounter.current;
      const aId = ++idCounter.current;

      // Post question
      setMessages((prev) => {
        const next = [
          ...prev,
          { id: qId, user: asker, text: qa.q, timestamp: getTime() },
        ];
        return next.length > 60 ? next.slice(4) : next;
      });

      // Show typing indicator after a delay
      const typingDelay = 1800 + Math.random() * 1200;
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: typingId, user: answerer, text: "", timestamp: "", isTyping: true },
        ]);
      }, typingDelay);

      // Replace typing with answer
      const answerDelay = typingDelay + 1600 + Math.random() * 1000;
      setTimeout(() => {
        setMessages((prev) =>
          prev
            .filter((m) => m.id !== typingId)
            .concat({ id: aId, user: answerer, text: qa.a, timestamp: getTime() })
        );
      }, answerDelay);
    };

    const timeout = setTimeout(postPair, 800);
    const interval = setInterval(postPair, 6500);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#0d1421] text-white flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col items-center pt-32 pb-10 px-4">
        <div className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[70vh]">

          {/* Chat Header */}
          <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-200 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-medium tracking-wide flex-shrink-0">
              BV
            </div>
            <div className="flex-1">
              <h2 className="font-medium text-sm text-gray-900 flex items-center gap-1.5">
                Markets &amp; Trading
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1 align-middle" />
                3,812 members · 247 online
              </p>
            </div>
            <MoreVertical className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-700" />
          </div>

          {/* Ticker Bar */}
          <div className="px-5 py-2 border-b border-gray-100 bg-white flex gap-5 overflow-hidden">
            {tickers.map((t) => (
              <div key={t.sym} className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-xs font-medium text-gray-800">{t.sym}</span>
                <span className="text-xs text-gray-500">{t.price}</span>
                <span className={`text-xs font-medium ${t.up ? "text-green-600" : "text-red-500"}`}>
                  {t.change}
                </span>
              </div>
            ))}
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-white scrollbar-thin scrollbar-thumb-gray-200"
          >
            <div className="flex justify-center">
              <span className="text-xs text-gray-400 bg-gray-100 px-4 py-1 rounded-full">
                BlueVult Markets · Live Discussion
              </span>
            </div>

            {messages.map((msg) =>
              msg.isTyping ? (
                <div key={msg.id} className="flex gap-2.5 items-end">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 border border-gray-100"
                    style={{ background: `${msg.user.color}22`, color: msg.user.color }}
                  >
                    {msg.user.initials}
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block animate-bounce"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex gap-2.5 items-start">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 border border-gray-100"
                    style={{ background: `${msg.user.color}22`, color: msg.user.color }}
                  >
                    {msg.user.initials}
                  </div>
                  <div className="max-w-[82%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-900">{msg.user.name}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${roleBadgeStyles[msg.user.role]}`}>
                        {msg.user.role.charAt(0).toUpperCase() + msg.user.role.slice(1)}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-auto">{msg.timestamp}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5">
                      <p className="text-sm text-gray-700 leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Input Bar */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center gap-3">
            <Paperclip className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            <div className="flex-1 bg-white border border-gray-200 rounded-lg px-3.5 py-2 flex items-center gap-2">
              <input
                type="text"
                placeholder="Share your market view..."
                className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                readOnly
              />
              <Smile className="w-4 h-4 text-gray-400" />
            </div>
            <button className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center cursor-not-allowed">
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;