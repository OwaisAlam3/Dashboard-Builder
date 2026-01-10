import React from 'react';
import { Box } from 'lucide-react';

const ContainerWidget = ({ data }) => {
  return (
    <div
      className="h-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center transition-all"
      style={{
        backgroundColor: data.bgColor,
        borderColor: data.borderColor,
      }}
    >
      <div className="text-center">
        <Box className="mx-auto mb-2 opacity-50" size={32} />
        <p className="text-sm font-medium text-gray-600">{data.title}</p>
        <p className="text-xs text-gray-400 mt-1">Empty Container</p>
      </div>
    </div>
  );
};

export default ContainerWidget;