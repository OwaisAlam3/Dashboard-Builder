// src/components/Widgets/StatGridWidget.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatGridWidget = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'positive') return <TrendingUp size={12} />;
    if (status === 'negative') return <TrendingDown size={12} />;
    return null;
  };

  const gridCols = data.columns || 2;
  const gridClass = gridCols === 1 ? 'grid-cols-1' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div
      className="h-full p-5"
      style={{ 
        backgroundColor: data.backgroundColor || '#ffffff',
        borderColor: data.borderColor || '#e2e8f0'
      }}
    >
      {/* Title */}
      {data.title && (
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          {data.title}
        </h3>
      )}

      {/* Stats Grid */}
      <div className={`grid ${gridClass} gap-4 h-[calc(100%-2rem)]`}>
        {data.stats && data.stats.map((stat, index) => (
          <div
            key={index}
            className="flex flex-col justify-between p-4 rounded-lg border bg-gray-50/50"
            style={{ borderColor: data.borderColor || '#e2e8f0' }}
          >
            <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
              {stat.label}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(stat.status)}`}>
                  {getStatusIcon(stat.status)}
                  <span>{stat.change}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatGridWidget;