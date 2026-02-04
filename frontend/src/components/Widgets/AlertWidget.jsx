// ============= AlertWidget.jsx =============
import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';

const AlertWidget = ({ data }) => {
  const [dismissed, setDismissed] = useState(false);

  const getVariantStyles = () => {
    switch (data.variant) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          icon: CheckCircle2,
          iconColor: 'text-emerald-600',
          titleColor: 'text-emerald-900',
          textColor: 'text-emerald-700',
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-900',
          textColor: 'text-amber-700',
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          textColor: 'text-red-700',
        };
      default: // info
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: Info,
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          textColor: 'text-blue-700',
        };
    }
  };

  if (dismissed) return null;

  const styles = getVariantStyles();
  const Icon = styles.icon;

  return (
    <div className={`h-full flex items-center px-5 py-4 ${styles.bg} border-2 rounded-lg shadow-sm`}>
      <div className="flex items-start gap-3 flex-1">
        {data.icon && (
          <Icon className={`flex-shrink-0 ${styles.iconColor}`} size={22} strokeWidth={2.5} />
        )}
        <div className="flex-1 min-w-0">
          {data.title && (
            <div className={`text-sm font-bold ${styles.titleColor} mb-1`}>{data.title}</div>
          )}
          {data.message && (
            <div className={`text-sm ${styles.textColor} font-medium`}>{data.message}</div>
          )}
        </div>
        {data.dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className={`flex-shrink-0 ${styles.iconColor} hover:opacity-70 transition-opacity`}
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertWidget;
