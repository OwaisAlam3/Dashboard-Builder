// src/components/Widgets/TextBlockWidget.jsx
import React from 'react';

const TextBlockWidget = ({ data }) => {
  const getPaddingClass = () => {
    switch (data.padding) {
      case 'sm':
        return 'p-3';
      case 'lg':
        return 'p-7';
      default:
        return 'p-5';
    }
  };

  const getTitleSizeClass = () => {
    switch (data.titleSize) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const getTextSizeClass = () => {
    switch (data.textSize) {
      case 'xs':
        return 'text-xs';
      case 'md':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <div
      className={`h-full overflow-auto ${getPaddingClass()}`}
      style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
    >
      {data.title && (
        <h4
          className={`${getTitleSizeClass()} font-semibold mb-2`}
          style={{ color: data.titleColor || '#1e293b' }}
        >
          {data.title}
        </h4>
      )}
      {data.content && (
        <p
          className={`${getTextSizeClass()} leading-relaxed whitespace-pre-wrap`}
          style={{ color: data.textColor || '#64748b' }}
        >
          {data.content}
        </p>
      )}
    </div>
  );
};

export default TextBlockWidget;