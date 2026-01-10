import React from 'react';

const CardWidget = ({ data }) => {
  return (
    <div
      className="h-full border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow overflow-auto"
      style={{ backgroundColor: data.bgColor }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{data.title}</h3>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.content}</p>
    </div>
  );
};

export default CardWidget;