// src/components/Widgets/HeadingWidget.jsx
import React from 'react';

const HeadingWidget = ({ data }) => {
  const HeadingTag = data.level || 'h2';
  
  const getSizeClass = () => {
    switch (data.level) {
      case 'h1':
        return 'text-3xl font-bold';
      case 'h2':
        return 'text-2xl font-bold';
      case 'h3':
        return 'text-xl font-semibold';
      default:
        return 'text-2xl font-bold';
    }
  };

  const getAlignClass = () => {
    switch (data.align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div
      className="h-full flex items-center px-5"
      style={{ backgroundColor: data.backgroundColor || 'transparent' }}
    >
      <HeadingTag
        className={`w-full ${getSizeClass()} ${getAlignClass()} tracking-tight`}
        style={{ color: data.color || '#1e293b' }}
      >
        {data.text || 'Heading'}
      </HeadingTag>
    </div>
  );
};

export default HeadingWidget;