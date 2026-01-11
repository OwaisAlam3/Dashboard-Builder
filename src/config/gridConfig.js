// src/config/gridConfig.js
export const GRID_CONFIG = {
  columns: 12,
  rowHeight: 80,
  gap: 16,
  containerPadding: 24,
  minWidgetWidth: 2, // minimum columns
  minWidgetHeight: 1, // minimum rows
  maxWidgetWidth: 12,
  maxWidgetHeight: 8,
  
  breakpoints: {
    lg: { minWidth: 1200, columns: 12 },
    md: { minWidth: 996, columns: 12 },
    sm: { minWidth: 768, columns: 6 },
    xs: { minWidth: 0, columns: 4 }
  },
  
  // Calculate pixel dimensions from grid units
  getPixelWidth: (columns, containerWidth, currentColumns = 12) => {
    const availableWidth = containerWidth - (GRID_CONFIG.containerPadding * 2);
    const totalGaps = (currentColumns - 1) * GRID_CONFIG.gap;
    const columnWidth = (availableWidth - totalGaps) / currentColumns;
    return (columnWidth * columns) + (GRID_CONFIG.gap * (columns - 1));
  },
  
  getPixelHeight: (rows) => {
    return (GRID_CONFIG.rowHeight * rows) + (GRID_CONFIG.gap * (rows - 1));
  },
  
  // Convert pixels to grid units
  getGridWidth: (pixels, containerWidth, currentColumns = 12) => {
    const availableWidth = containerWidth - (GRID_CONFIG.containerPadding * 2);
    const totalGaps = (currentColumns - 1) * GRID_CONFIG.gap;
    const columnWidth = (availableWidth - totalGaps) / currentColumns;
    return Math.max(1, Math.round(pixels / (columnWidth + GRID_CONFIG.gap)));
  },
  
  getGridHeight: (pixels) => {
    return Math.max(1, Math.round(pixels / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap)));
  }
};

export default GRID_CONFIG;