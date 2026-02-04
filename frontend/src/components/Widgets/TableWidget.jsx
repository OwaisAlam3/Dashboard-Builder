// src/components/Widgets/TableWidget.jsx - ADMIN PANEL DESIGN: Professional data table
import React from 'react';

const TableWidget = ({ data }) => {
  const columns = data.columns || [];
  const tableData = data.data || [];

  const getBadgeClass = (value) => {
    const statusMap = {
      'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'processing': 'bg-blue-100 text-blue-700 border-blue-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'shipped': 'bg-purple-100 text-purple-700 border-purple-200',
    };
    
    const lowerValue = value?.toString().toLowerCase();
    return statusMap[lowerValue] || '';
  };

  const renderCell = (value, column) => {
    // Check if it's a status column
    if (column.type === 'status' || column.key === 'status') {
      const badgeClass = getBadgeClass(value);
      if (badgeClass) {
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeClass}`}>
            {value}
          </span>
        );
      }
    }
    
    // Check if it's a number that should be highlighted
    if (column.type === 'number' && typeof value === 'string' && value.match(/^[\d,.$€£¥]+$/)) {
      return <span className="font-semibold text-gray-900">{value}</span>;
    }
    
    return value;
  };

  return (
    <div
      className="h-full flex flex-col bg-white rounded-lg shadow-md border border-gray-200"
      style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
    >
      {/* Header */}
      {data.title && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h3 className="text-base font-bold text-gray-800">
            {data.title}
          </h3>
          {data.subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">
              {data.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          {data.showHeader && (
            <thead className="sticky top-0 z-10 bg-gray-50 border-b-2 border-gray-200">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="text-left px-6 py-3 font-bold text-gray-700 text-xs uppercase tracking-wider"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-gray-100">
            {tableData.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`hover:bg-gray-50 transition-colors ${
                  data.striped && rowIdx % 2 === 1 ? 'bg-gray-25' : 'bg-white'
                }`}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-6 py-4 text-gray-700 whitespace-nowrap"
                  >
                    {renderCell(row[col.key], col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional footer with pagination or summary */}
      {data.showFooter && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 flex justify-between items-center">
          <div>
            Showing <span className="font-semibold">{tableData.length}</span> {data.footerText || 'entries'}
          </div>
          {data.totalCount && (
            <div>
              Total: <span className="font-semibold">{data.totalCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TableWidget;