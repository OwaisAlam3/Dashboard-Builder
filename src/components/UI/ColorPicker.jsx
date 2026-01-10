import React from 'react';
import { cn } from '../../utils/helpers';

const ColorPicker = ({ label, value, onChange }) => {
  const predefinedColors = [
    '#ffffff', '#f3f4f6', '#e5e7eb', '#d1d5db',
    '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af',
    '#10b981', '#059669', '#047857', '#065f46',
    '#f59e0b', '#d97706', '#b45309', '#92400e',
    '#ef4444', '#dc2626', '#b91c1c', '#991b1b',
    '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6',
  ];

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-16 rounded border border-gray-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="#000000"
        />
      </div>
      <div className="grid grid-cols-8 gap-2 mt-2">
        {predefinedColors.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={cn(
              'w-8 h-8 rounded border-2 transition-all hover:scale-110',
              value === color ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-300'
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
