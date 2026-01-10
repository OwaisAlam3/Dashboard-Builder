/**
 * Generate a unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Class name utility
 */
export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Validate URL
 */
export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

/**
 * Export dashboard configuration (updated for new format)
 */
export const exportDashboard = (widgets) => {
  const config = {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    widgets,
  };

  const dataStr = JSON.stringify(config, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = `dashboard-${Date.now()}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

/**
 * Import dashboard configuration (updated for new format)
 */
export const importDashboard = (file, callback) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result);
      if (config.widgets) {
        // Normalize widgets to ensure they have position and size
        const normalizedWidgets = config.widgets.map(w => ({
          ...w,
          position: w.position || { x: 20, y: 20 },
          size: w.size || { width: 400, height: 300 }
        }));
        callback({ widgets: normalizedWidgets });
      } else if (config.layouts && config.widgets) {
        // Handle old format - convert to new format
        const normalizedWidgets = config.widgets.map((w, index) => {
          const layout = config.layouts.lg?.[index];
          return {
            ...w,
            position: layout ? { 
              x: layout.x * 100, 
              y: layout.y * 60 
            } : { x: 20 + index * 30, y: 20 + index * 30 },
            size: layout ? { 
              width: layout.w * 100, 
              height: layout.h * 60 
            } : { width: 400, height: 300 }
          };
        });
        callback({ widgets: normalizedWidgets });
      } else {
        throw new Error('Invalid dashboard configuration');
      }
    } catch (error) {
      console.error('Error importing dashboard:', error);
      alert('Failed to import dashboard. Please check the file format.');
    }
  };

  reader.readAsText(file);
};

/**
 * Constrain position within bounds
 */
export const constrainPosition = (position, size, containerSize) => {
  return {
    x: Math.max(0, Math.min(position.x, containerSize.width - size.width)),
    y: Math.max(0, Math.min(position.y, containerSize.height - size.height))
  };
};

/**
 * Check if two rectangles overlap
 */
export const checkOverlap = (rect1, rect2) => {
  return !(
    rect1.x + rect1.width < rect2.x ||
    rect2.x + rect2.width < rect1.x ||
    rect1.y + rect1.height < rect2.y ||
    rect2.y + rect2.height < rect1.y
  );
};

/**
 * Snap to grid (optional helper for future enhancement)
 */
export const snapToGrid = (value, gridSize = 10) => {
  return Math.round(value / gridSize) * gridSize;
};