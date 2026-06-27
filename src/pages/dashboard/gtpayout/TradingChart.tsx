import React, { useEffect, useRef } from 'react';

interface ChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingChart: React.FC<ChartProps> = ({ symbol, theme = 'dark' }) => {
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
    <div className="w-full h-full min-h-[400px] bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
      <div id={`tradingview_${symbol.replace('/', '_')}`} ref={containerRef} className="w-full h-full" />
    </div>
  );
};

export default TradingChart;
