// src/components/Widgets/MetricWidget.jsx
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricWidget = ({ data }) => {
  const getTrendIcon = () => {
    switch (data.trendDirection) {
      case 'up':
        return <TrendingUp size={16} className="text-emerald-500" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-500" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trendDirection) {
      case 'up':
        return 'text-emerald-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div
      className="h-full flex flex-col justify-between p-5"
      style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
    >
      {/* Label */}
      <div className="flex items-start justify-between mb-2">
        <span 
          className="text-sm font-medium tracking-tight"
          style={{ color: data.textColor || '#64748b' }}
        >
          {data.label}
        </span>
        {getTrendIcon()}
      </div>

      {/* Value */}
      <div className="flex-1 flex flex-col justify-center">
        <div 
          className="text-3xl font-bold tracking-tight mb-1"
          style={{ color: data.textColor || '#1e293b' }}
        >
          {data.value}
        </div>

        {/* Trend and Comparison */}
        <div className="flex items-center gap-2 flex-wrap">
          {data.trend && (
            <span className={`text-sm font-semibold ${getTrendColor()}`}>
              {data.trend}
            </span>
          )}
          {data.comparison && (
            <span className="text-xs text-gray-500">
              {data.comparison}
            </span>
          )}
        </div>
      </div>

      {/* Optional Sparkline Placeholder */}
      {data.showSparkline && data.sparklineData && data.sparklineData.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="h-8 flex items-end gap-0.5">
            {data.sparklineData.map((value, idx) => {
              const maxValue = Math.max(...data.sparklineData);
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-sm transition-all"
                  style={{
                    height: `${height}%`,
                    backgroundColor: data.primaryColor || '#3b82f6',
                    opacity: 0.6,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricWidget;