import { useEffect, useRef } from "react";

const CryptoTicker = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = `
      <div class="tradingview-widget-container__widget"></div>
    `;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "BINANCE:BTCUSDT",  title: "Bitcoin"   },
        { proName: "BINANCE:ETHUSDT",  title: "Ethereum"  },
        { proName: "BINANCE:SOLUSDT",  title: "Solana"    },
        { proName: "BINANCE:BNBUSDT",  title: "BNB"       },
        { proName: "BINANCE:XRPUSDT",  title: "Ripple"    },
        { proName: "BINANCE:ADAUSDT",  title: "Cardano"   },
        { proName: "BINANCE:AVAXUSDT", title: "Avalanche" },
        { proName: "BINANCE:DOTUSDT",  title: "Polkadot"  },
        { proName: "BINANCE:MATICUSDT",title: "Polygon"   },
        { proName: "BINANCE:LINKUSDT", title: "Chainlink" },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: "adaptive",
      colorTheme: "dark",
      locale: "en",
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container w-full border-y border-border/50"
      style={{ height: 46 }}
    />
  );
};

export default CryptoTicker;