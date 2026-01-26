// src/components/Widgets/StatusBoardWidget.jsx
import React from 'react';

const StatusBoardWidget = ({ data }) => {
  const items = data.items || [];
  const statusColors = data.statusColors || {
    completed: '#10b981',
    'in-progress': '#3b82f6',
    pending: '#6b7280',
    blocked: '#ef4444',
  };

  const getStatusLabel = (status) => {
    return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div
      className="h-full flex flex-col p-5"
      style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
    >
      {/* Header */}
      {data.title && (
        <div className="mb-4">
          <h3 className="text-base font-semibold text-gray-800">
            {data.title}
          </h3>
        </div>
      )}

      {/* Status Items */}
      <div className="flex-1 overflow-auto space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-gray-50/30 hover:bg-gray-50/60 transition-colors"
            style={{ borderColor: '#e5e7eb' }}
          >
            {/* Item Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 mb-1">
                  {item.name}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: statusColors[item.status] || '#6b7280' }}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                  {item.dueDate && (
                    <span className="text-xs text-gray-500">
                      Due {item.dueDate}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {data.showProgress && typeof item.progress === 'number' && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold">{item.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.progress}%`,
                      backgroundColor: statusColors[item.status] || '#3b82f6',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusBoardWidget;