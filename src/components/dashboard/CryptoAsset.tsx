import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface CryptoAssetProps {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isUp: boolean;
  icon: string;
  data: { value: number }[];
  color: string;
}

const CryptoAsset: React.FC<CryptoAssetProps> = ({ name, symbol, price, change, isUp, icon, data, color }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-[#161a26] rounded-2xl hover:bg-gray-50 dark:hover:bg-[#1e2332] transition-all cursor-pointer group border border-gray-100 dark:border-gray-800/50">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2">
          <img src={icon} alt={name} className="w-full h-full object-contain" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">{name}</h3>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{symbol}</p>
        </div>
      </div>

      <div className="hidden sm:block w-24 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${symbol})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-right">
        <p className="font-bold text-gray-900 dark:text-white">${price}</p>
        <span className={`text-xs font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {isUp ? '+' : ''}{change}%
        </span>
      </div>
    </div>
  );
};

export default CryptoAsset;
