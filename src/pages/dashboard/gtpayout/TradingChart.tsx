import React, { useEffect, useRef } from 'react';
import { createChart, IChartApi, CandlestickSeries } from 'lightweight-charts';

interface ChartProps {
  symbol: string;
}

const TradingChart: React.FC<ChartProps> = ({ symbol }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

   const candleSeries = chart.addSeries(CandlestickSeries, {
  upColor: '#10b981',
  downColor: '#ef4444',
  borderVisible: false,
  wickUpColor: '#10b981',
  wickDownColor: '#ef4444',
});

    // Mock data for initial chart
    const data = [];
    let time = Math.floor(Date.now() / 1000) - 3600 * 24 * 7;
    let lastClose = 50000;
    for (let i = 0; i < 500; i++) {
      const open = lastClose;
      const high = open + Math.random() * 100;
      const low = open - Math.random() * 100;
      const close = low + Math.random() * (high - low);
      data.push({ time, open, high, low, close });
      time += 60;
      lastClose = close;
    }
    candleSeries.setData(data as any);

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Simulated real-time updates
    const interval = setInterval(() => {
      const lastData = data[data.length - 1];
      const open = lastData.close;
      const high = open + Math.random() * 50;
      const low = open - Math.random() * 50;
      const close = low + Math.random() * (high - low);
      const newTime = lastData.time + 60;
      const newData = { time: newTime, open, high, low, close };
      candleSeries.update(newData as any);
      data.push(newData);
    }, 5000);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      clearInterval(interval);
    };
  }, [symbol]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};

export default TradingChart;
