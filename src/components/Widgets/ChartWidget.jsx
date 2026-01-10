import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ChartWidget = ({ data }) => {
  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 650 },
    { name: 'Mar', value: 450 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 550 },
    { name: 'Jun', value: 700 },
    { name: 'Jul', value: 600 },
    { name: 'Aug', value: 850 },
  ];

  return (
    <div
      className="h-full border border-gray-200 rounded-lg p-4 shadow-sm overflow-hidden"
      style={{ backgroundColor: data.bgColor }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{data.title}</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartWidget;