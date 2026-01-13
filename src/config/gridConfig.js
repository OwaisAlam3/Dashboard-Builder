// src/config/gridConfig.js - FIXED for 1920x1080 Canvas
export const GRID_CONFIG = {
  columns: 24, // Increased for more precision on Full HD canvas
  rowHeight: 60, // Optimized for 1080px height
  gap: 12,
  containerPadding: 24,
  minWidgetWidth: 1,
  minWidgetHeight: 1,
  maxWidgetWidth: 24,
  maxWidgetHeight: 24,
  
  // Fixed Full HD Canvas (16:9)
  canvasWidth: 1366,
  canvasHeight: 768,
  aspectRatio: 16 / 9,
  
  breakpoints: {
    // Since canvas is always 1920px, we default to 'lg' with 24 columns
    lg: { minWidth: 1200, columns: 24 },
    md: { minWidth: 996, columns: 24 },
    sm: { minWidth: 768, columns: 16 },
    xs: { minWidth: 0, columns: 12 }
  },
  
  // Calculate max rows based on fixed canvas height
  getMaxRows: (canvasHeight = 768) => {
    const availableHeight = canvasHeight - (GRID_CONFIG.containerPadding * 2);
    return Math.floor((availableHeight + GRID_CONFIG.gap) / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap));
  },
  
  // Get pixel width for grid columns (using fixed canvas width)
  getPixelWidth: (columns, canvasWidth = 1366, currentColumns = 24) => {
    const availableWidth = canvasWidth - (GRID_CONFIG.containerPadding * 2);
    const totalGaps = (currentColumns - 1) * GRID_CONFIG.gap;
    const columnWidth = (availableWidth - totalGaps) / currentColumns;
    return Math.round((columnWidth * columns) + (GRID_CONFIG.gap * (columns - 1)));
  },
  
  // Get pixel height for grid rows
  getPixelHeight: (rows) => {
    return (GRID_CONFIG.rowHeight * rows) + (GRID_CONFIG.gap * (rows - 1));
  },
  
  // Convert pixels to grid columns
  getGridWidth: (pixels, canvasWidth = 1366, currentColumns = 24) => {
    const availableWidth = canvasWidth - (GRID_CONFIG.containerPadding * 2);
    const totalGaps = (currentColumns - 1) * GRID_CONFIG.gap;
    const columnWidth = (availableWidth - totalGaps) / currentColumns;
    return Math.max(1, Math.round(pixels / (columnWidth + GRID_CONFIG.gap)));
  },
  
  // Convert pixels to grid rows
  getGridHeight: (pixels) => {
    return Math.max(1, Math.round(pixels / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap)));
  },
  
  // Get actual column width in pixels
  getColumnWidth: (currentColumns = 24) => {
    const availableWidth = GRID_CONFIG.canvasWidth - (GRID_CONFIG.containerPadding * 2);
    const totalGaps = (currentColumns - 1) * GRID_CONFIG.gap;
    return Math.round((availableWidth - totalGaps) / currentColumns);
  },
  
  // Snap to grid helpers
  snapToGrid: (value, gridSize) => {
    return Math.round(value / gridSize) * gridSize;
  },
  
  // Calculate total grid dimensions
  getTotalGridWidth: (currentColumns = 24) => {
    return GRID_CONFIG.canvasWidth - (GRID_CONFIG.containerPadding * 2);
  },
  
  getTotalGridHeight: () => {
    const maxRows = GRID_CONFIG.getMaxRows();
    return (maxRows * GRID_CONFIG.rowHeight) + ((maxRows - 1) * GRID_CONFIG.gap);
  }
};

export default GRID_CONFIG;