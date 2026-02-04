// ============= StatusBoardWidget.jsx =============
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
    <div className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      {data.title && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-base font-bold text-gray-800">{data.title}</h3>
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-bold text-gray-800">{item.name}</div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-1 rounded-md text-xs font-bold text-white"
                  style={{ backgroundColor: statusColors[item.status] }}
                >
                  {getStatusLabel(item.status)}
                </span>
                {item.dueDate && (
                  <span className="text-xs text-gray-500 font-semibold">{item.dueDate}</span>
                )}
              </div>
            </div>

            {data.showProgress && typeof item.progress === 'number' && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span className="font-semibold">Progress</span>
                  <span className="font-bold">{item.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${item.progress}%`,
                      backgroundColor: statusColors[item.status],
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
