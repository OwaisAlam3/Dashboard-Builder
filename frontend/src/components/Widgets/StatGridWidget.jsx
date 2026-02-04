// src/components/Widgets/StatGridWidget.jsx - IMPROVED: Modern card-based design
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatGridWidget = ({ data }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'positive':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    if (status === 'positive') return <TrendingUp size={14} className="animate-pulse" />;
    if (status === 'negative') return <TrendingDown size={14} className="animate-pulse" />;
    return null;
  };

  const gridCols = data.columns || 2;
  const gridClass = gridCols === 1 ? 'grid-cols-1' : gridCols === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <div
      className="h-full p-6"
      style={{ 
        backgroundColor: data.backgroundColor || '#ffffff',
      }}
    >
      {/* Title */}
      {data.title && (
        <h3 className="text-lg font-bold text-gray-800 mb-5 tracking-tight">
          {data.title}
        </h3>
      )}

      {/* Stats Grid */}
      <div className={`grid ${gridClass} gap-4 h-[calc(100%-3rem)]`}>
        {data.stats && data.stats.map((stat, index) => (
          <div
            key={index}
            className="group flex flex-col justify-between p-5 rounded-xl border-2 bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer"
            style={{ borderColor: data.borderColor || '#e2e8f0' }}
          >
            <div className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
              {stat.label}
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                {stat.value}
              </div>
              {stat.change && (
                <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border-2 ${getStatusColor(stat.status)} transition-all`}>
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