import React, { useEffect, useRef } from 'react';

interface Position {
  trade_id: string;
  entry_price: string;
  direction: string;
  amount: string;
  status: string;
}

interface ChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
  positions?: Position[];
  currentPrice?: number;
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingChart: React.FC<ChartProps> = ({ symbol, theme = 'dark', positions = [], currentPrice = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (containerRef.current && window.TradingView) {
        // Map symbol to TradingView format if necessary
        let tvSymbol = symbol;
        if (symbol === 'BTC/USD') tvSymbol = 'BINANCE:BTCUSDT';
        else if (symbol === 'ETH/USD') tvSymbol = 'BINANCE:ETHUSDT';
        else if (symbol === 'SOL/USD') tvSymbol = 'BINANCE:SOLUSDT';
        else if (symbol === 'BNB/USD') tvSymbol = 'BINANCE:BNBUSDT';
        else if (symbol === 'XAU/USD') tvSymbol = 'OANDA:XAUUSD';
        else if (symbol === 'EUR/USD') tvSymbol = 'FX:EURUSD';
        else if (symbol === 'GBP/USD') tvSymbol = 'FX:GBPUSD';
        else if (symbol === 'USD/JPY') tvSymbol = 'FX:USDJPY';
        else tvSymbol = symbol.replace('/', '');

        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: '1',
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerRef.current.id,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          gridColor: 'rgba(30, 41, 59, 0.5)',
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, theme]);

  return (
    <div className="w-full h-full min-h-[400px] bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800 relative">
      <div id={`tradingview_${symbol.replace('/', '_')}`} ref={containerRef} className="w-full h-full" />

      {/* Position Overlays (Simplified implementation as standard TV widget doesn't easily expose coordinate mapping) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {positions.filter(p => p.status === 'open').map((pos, idx) => {
          // We don't have exact Y-coordinate from iframe, but we can show them in a sidebar inside the chart
          // or attempt a very rough estimation if we knew the visible range.
          // For now, let's show them as floating labels on the right side if the price is close.
          return (
            <div
              key={pos.trade_id}
              className="absolute right-0 flex items-center gap-2 pr-12 transition-all duration-500"
              style={{
                top: `${50 + (idx * 40)}px`, // Staggered display
              }}
            >
              <div className={`px-2 py-1 rounded-l shadow-lg border-l-4 flex items-center gap-2 backdrop-blur-sm ${pos.direction === 'up' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400'}`}>
                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                  <span className="text-[10px]">👤</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase">{pos.direction === 'up' ? 'Buy' : 'Sell'} ${parseFloat(pos.amount).toFixed(0)}</span>
                  <span className="text-[9px] font-mono opacity-80">@{parseFloat(pos.entry_price).toFixed(2)}</span>
                </div>
              </div>
              <div className="w-full h-[1px] bg-white/10 absolute right-0 -z-10" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TradingChart;
