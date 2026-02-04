// ============= ListWidget.jsx =============
import React from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

const ListWidget = ({ data }) => {
  const getIcon = (iconName, color) => {
    const iconProps = { size: 18, style: { color }, strokeWidth: 2.5 };
    
    switch (iconName) {
      case 'check':
        return <CheckCircle2 {...iconProps} />;
      case 'alert':
        return <AlertCircle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      case 'error':
        return <XCircle {...iconProps} />;
      default:
        return <CheckCircle2 {...iconProps} />;
    }
  };

  const items = data.items || [];

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      {data.title && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-base font-bold text-gray-800">{data.title}</h3>
        </div>
      )}

      {/* List Items */}
      <div className="flex-1 overflow-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className={`px-6 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
              data.showDividers && index < items.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            {data.showIcons && item.icon && (
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(item.icon, item.iconColor || '#6b7280')}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-800">{item.label}</div>
              {item.description && (
                <div className="text-xs text-gray-500 mt-1 font-medium">{item.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListWidget;
