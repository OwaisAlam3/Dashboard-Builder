// src/components/Widgets/BarChartWidget.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChartWidget = ({ data }) => {
  const chartData = data.data || [];
  const xKey = data.xAxisKey || 'category';
  const yKey = data.yAxisKey || 'value';
  const isHorizontal = data.horizontal || false;

  const ChartComponent = BarChart;

  return (
    <div
      className="h-full flex flex-col p-5"
      style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-800">
          {data.title || 'Chart'}
        </h3>
        {data.subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent 
            data={chartData} 
            layout={isHorizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 5, right: 5, left: isHorizontal ? 0 : -20, bottom: 5 }}
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
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  type="category"
                  dataKey={xKey}
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                  width={80}
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey={xKey} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickLine={false}
                />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '13px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            <Bar
              dataKey={yKey}
              fill={data.barColor || '#3b82f6'}
              radius={[6, 6, 0, 0]}
            />
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartWidget;