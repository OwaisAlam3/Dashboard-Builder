// Simple toast notification for save confirmations
import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: <Check size={18} />,
    error: <X size={18} />,
    warning: <AlertCircle size={18} />
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div className={`fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn z-[9999]`}>
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;