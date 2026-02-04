// src/components/Widgets/PieChartWidget.jsx - ADMIN PANEL DESIGN: Donut/Pie chart with legend
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const PieChartWidget = ({ data }) => {
  const chartData = data.data || [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const percent = ((payload[0].value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
      return (
        <div className="bg-white px-4 py-2 rounded-md shadow-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-1">{payload[0].name}</p>
          <p className="text-base font-bold text-gray-800">
            {payload[0].value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{percent}%</p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="13"
        fontWeight="700"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div
      className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200"
      style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
    >
      {/* Header */}
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
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={data.showLabels ? renderCustomizedLabel : false}
              outerRadius="75%"
              innerRadius={data.donut ? "50%" : "0%"}
              fill="#8884d8"
              dataKey="value"
              stroke="#fff"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 45}, 70%, 50%)`} />
              ))}
            </Pie>
            {data.showLegend && (
              <Legend 
                verticalAlign="bottom" 
                height={40}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', fontWeight: 600 }}
              />
            )}
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PieChartWidget;