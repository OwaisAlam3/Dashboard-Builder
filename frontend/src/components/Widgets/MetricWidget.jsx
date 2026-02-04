// src/components/Widgets/MetricWidget.jsx - IMPROVED: Modern, interactive design
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const MetricWidget = ({ data }) => {
  const getTrendIcon = () => {
    switch (data.trendDirection) {
      case 'up':
        return <TrendingUp size={18} className="text-emerald-500" />;
      case 'down':
        return <TrendingDown size={18} className="text-red-500" />;
      default:
        return <Minus size={18} className="text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trendDirection) {
      case 'up':
        return 'text-emerald-600 bg-emerald-50';
      case 'down':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div
      className="h-full flex flex-col justify-between p-6 group hover:shadow-lg transition-all duration-300"
      style={{ 
        backgroundColor: data.backgroundColor || '#ffffff',
        borderLeft: `4px solid ${data.primaryColor || '#3b82f6'}`
      }}
    >
      {/* Label */}
      <div className="flex items-start justify-between mb-3">
        <span 
          className="text-xs font-semibold tracking-wider uppercase"
          style={{ color: data.textColor || '#64748b' }}
        >
          {data.label}
        </span>
        <div className={`p-1.5 rounded-lg transition-transform group-hover:scale-110 ${
          data.trendDirection === 'up' ? 'bg-emerald-50' : 
          data.trendDirection === 'down' ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          {getTrendIcon()}
        </div>
      </div>

      {/* Value */}
      <div className="flex-1 flex flex-col justify-center">
        <div 
          className="text-4xl font-bold tracking-tight mb-2 transition-transform group-hover:scale-105"
          style={{ color: data.textColor || '#1e293b' }}
        >
          {data.value}
        </div>

        {/* Trend and Comparison */}
        <div className="flex items-center gap-2 flex-wrap">
          {data.trend && (
            <span className={`text-sm font-bold px-2 py-1 rounded-md ${getTrendColor()}`}>
              {data.trend}
            </span>
          )}
          {data.comparison && (
            <span className="text-xs text-gray-500 font-medium">
              {data.comparison}
            </span>
          )}
        </div>
      </div>

      {/* Sparkline */}
      {data.showSparkline && data.sparklineData && data.sparklineData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="h-10 flex items-end gap-0.5">
            {data.sparklineData.map((value, idx) => {
              const maxValue = Math.max(...data.sparklineData);
              const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div
                  key={idx}
                  className="flex-1 rounded-t-sm transition-all duration-300 hover:opacity-80 cursor-pointer"
                  style={{
                    height: `${height}%`,
                    backgroundColor: data.primaryColor || '#3b82f6',
                    opacity: 0.7,
                  }}
                  title={value}
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