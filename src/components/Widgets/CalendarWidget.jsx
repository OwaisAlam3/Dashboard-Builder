// src/components/Widgets/CalendarWidget.jsx
import React from 'react';

const CalendarWidget = ({ data }) => {
  // FIX: Use full day names as keys to avoid duplicates
  const daysOfWeek = [
    { short: 'S', full: 'Sunday' },
    { short: 'M', full: 'Monday' },
    { short: 'T', full: 'Tuesday' },
    { short: 'W', full: 'Wednesday' },
    { short: 'T', full: 'Thursday' },
    { short: 'F', full: 'Friday' },
    { short: 'S', full: 'Saturday' }
  ];

  const dates = Array.from({ length: 35 }, (_, i) => i - 5);
  const today = 15;

  return (
    <div
      className="h-full border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      style={{ backgroundColor: data.bgColor }}
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{data.title}</h3>
        <p className="text-sm text-gray-500">January 2026</p>
      </div>
      <div className="p-4">
        {/* FIX: Use full day name as unique key */}
        <div className="grid grid-cols-7 gap-2 text-center mb-3">
          {daysOfWeek.map((day) => (
            <div key={day.full} className="text-xs font-semibold text-gray-400">
              {day.short}
            </div>
          ))}
        </div>
        
        {/* FIX: Use unique composite key for each date cell */}
        <div className="grid grid-cols-7 gap-2">
          {dates.map((d, index) => {
            const isCurrentMonth = d > 0 && d <= 30;
            const isToday = d === today;
            
            return (
              <div
                key={`date-cell-${index}`}
                className={`
                  text-sm p-2 rounded transition-all
                  ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700 hover:bg-blue-50 cursor-pointer'}
                  ${isToday ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                `}
              >
                {isCurrentMonth ? d : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;