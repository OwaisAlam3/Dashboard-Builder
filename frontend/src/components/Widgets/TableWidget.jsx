// src/components/Widgets/TableWidget.jsx
import React from 'react';

const TableWidget = ({ data }) => {
  const columns = data.columns || [];
  const tableData = data.data || [];

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: data.backgroundColor || '#ffffff' }}
    >
      {/* Header */}
      {data.title && (
        <div className="px-5 pt-5 pb-3">
          <h3 className="text-base font-semibold text-gray-800">
            {data.title}
          </h3>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto px-5 pb-5">
        <table className="w-full text-sm">
          {data.showHeader && (
            <thead className="sticky top-0" style={{ backgroundColor: data.headerColor || '#f8fafc' }}>
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="text-left px-4 py-3 font-semibold text-gray-700 text-xs uppercase tracking-wider"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {tableData.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className={`${
                  data.striped && rowIdx % 2 === 1 ? 'bg-gray-50/50' : ''
                } border-b last:border-b-0 hover:bg-gray-50/70 transition-colors`}
                style={{ borderColor: data.borderColor || '#e5e7eb' }}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className="px-4 py-3 text-gray-700"
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableWidget;