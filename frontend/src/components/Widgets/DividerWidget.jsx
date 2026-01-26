// src/components/Widgets/DividerWidget.jsx
import React from 'react';

const DividerWidget = ({ data }) => {
  const getMarginClass = () => {
    switch (data.margin) {
      case 'sm':
        return 'my-2';
      case 'lg':
        return 'my-6';
      default:
        return 'my-4';
    }
  };

  const getStyleClass = () => {
    switch (data.style) {
      case 'dashed':
        return 'border-dashed';
      case 'dotted':
        return 'border-dotted';
      default:
        return 'border-solid';
    }
  };

  return (
    <div className={`h-full flex items-center px-5 ${getMarginClass()}`}>
      <hr
        className={`w-full ${getStyleClass()}`}
        style={{
          borderWidth: `${data.thickness || 1}px 0 0 0`,
          borderColor: data.color || '#e2e8f0',
        }}
      />
    </div>
  );
};

export default DividerWidget;