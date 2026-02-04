// src/components/Widgets/BarChartWidget.jsx - ADMIN PANEL DESIGN: Professional bar chart
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const BarChartWidget = ({ data }) => {
  const chartData = data.data || [];
  const xKey = data.xAxisKey || 'category';
  const yKey = data.yAxisKey || 'value';
  const isHorizontal = data.horizontal || false;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-4 py-2 rounded-md shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">{payload[0].payload[xKey]}</p>
          <p className="text-base font-bold text-gray-800">
            {payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200"
      style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
    >
      {/* Header with card style */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-base font-bold text-gray-800">
          {data.title || 'Chart'}
        </h3>
        {data.subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 p-5">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 30, left: isHorizontal ? 0 : 0, bottom: 5 }}
          >
            {data.showGrid && (
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#e5e7eb" 
                horizontal={!isHorizontal}
                vertical={isHorizontal}
              />
            )}
            {isHorizontal ? (
              <>
                <XAxis 
                  type="number"
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey={xKey}
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                  width={120}
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey={xKey} 
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#d1d5db' }}
                  tickLine={false}
                  dx={-10}
                />
              </>
            )}
            <Tooltip content={<CustomTooltip />} />
            {data.showLegend && <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />}
            <Bar
              dataKey={yKey}
              fill={data.barColor || '#3b82f6'}
              radius={isHorizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartWidget;