import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsWidget = ({ data }) => {
  const isPositive = data.change?.startsWith('+');
  const changeValue = data.change?.replace(/[+-]/, '');

  return (
    <div
      className="h-full rounded-lg p-4 text-white shadow-lg transition-all hover:shadow-xl"
      style={{
        background: `linear-gradient(135deg, ${data.bgColor} 0%, ${adjustColorBrightness(data.bgColor, -20)} 100%)`,
      }}
    >
      <p className="text-sm opacity-90 mb-1">{data.title}</p>
      <p className="text-3xl font-bold mb-2">{data.value}</p>
      <div className="flex items-center text-sm">
        {isPositive ? (
          <TrendingUp size={16} className="mr-1" />
        ) : (
          <TrendingDown size={16} className="mr-1" />
        )}
        <span className="font-medium">{changeValue}</span>
        <span className="ml-1 opacity-75">from last month</span>
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColorBrightness(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}

export default StatsWidget;