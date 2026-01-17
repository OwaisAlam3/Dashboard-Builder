// src/store/dashboardStore.js - Complete with API Template Fetching
import { create } from 'zustand';
import GRID_CONFIG from '../config/gridConfig';

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 280;
const PROPERTY_PANEL_MIN_WIDTH = 240;
const PROPERTY_PANEL_MAX_WIDTH = 500;
const PROPERTY_PANEL_DEFAULT_WIDTH = 320;
const DEFAULT_CANVAS_ZOOM = 0.7;

// Calculate max rows for fixed 1366x768 canvas
const FIXED_MAX_ROWS = GRID_CONFIG.getMaxRows(768);

const checkStorageQuota = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.error('Storage unavailable:', e);
    return false;
  }
};

const batchedUpdates = (() => {
  let pending = null;
  let timeout = null;

  return (fn) => {
    if (timeout) clearTimeout(timeout);
    pending = fn;
    timeout = setTimeout(() => {
      if (pending) {
        pending();
        pending = null;
      }
    }, 16);
  };
})();

const useDashboardStore = create((set, get) => ({
  // UI State
  sidebarOpen: true,
  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
  propertyPanelOpen: false,
  propertyPanelWidth: PROPERTY_PANEL_DEFAULT_WIDTH,
  showTemplateSelector: false,

  // Template State
  templates: [],
  templatesLoading: false,
  templatesError: null,

  // Canvas State (Fixed 1366x768)
  canvasZoom: DEFAULT_CANVAS_ZOOM,
  canvasPan: { x: 0, y: 0 },
  showGrid: true,
  gridColumns: 24,
  currentBreakpoint: 'lg',
  maxRows: FIXED_MAX_ROWS,

  // Widget State
  widgets: [],
  selectedWidgetIds: [],
  hoveredWidgetId: null,
  clipboard: null,

  // Interaction State
  isDragging: false,
  isResizing: false,
  isPanning: false,
  draggedWidget: null,

  // History for Undo/Redo
  history: [],
  historyIndex: -1,
  maxHistory: 50,

  // Template Actions
  fetchTemplates: async () => {
    set({ templatesLoading: true, templatesError: null });
    
    try {
      const response = await fetch('http://localhost:4000/api/templates');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({ 
        templates: data, 
        templatesLoading: false,
        templatesError: null 
      });
    } catch (error) {
      console.error('Error fetching templates:', error);
      set({ 
        templatesLoading: false,
        templatesError: error.message || 'Failed to load templates'
      });
    }
  },

  // UI Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarWidth: (width) => set({ sidebarWidth: Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, width)) }),
  togglePropertyPanel: () => set((state) => ({ propertyPanelOpen: !state.propertyPanelOpen })),
  setPropertyPanelWidth: (width) => set({ propertyPanelWidth: Math.max(PROPERTY_PANEL_MIN_WIDTH, Math.min(PROPERTY_PANEL_MAX_WIDTH, width)) }),
  setShowTemplateSelector: (show) => set({ showTemplateSelector: show }),

  // Canvas Actions
  setCanvasZoom: (zoom) => set({ canvasZoom: Math.max(0.25, Math.min(3, zoom)) }),
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  resetCanvasView: () => set({ canvasZoom: DEFAULT_CANVAS_ZOOM, canvasPan: { x: 0, y: 0 } }),
  
  // Fit canvas to viewport
  fitCanvasToScreen: (viewportWidth, viewportHeight) => {
    const zoom = GRID_CONFIG.calculateFitZoom(viewportWidth, viewportHeight);
    set({ 
      canvasZoom: zoom,
      canvasPan: { x: 0, y: 0 }
    });
  },
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setCurrentBreakpoint: (breakpoint) => set({ currentBreakpoint: breakpoint }),
  updateGridColumns: (columns) => set({ gridColumns: columns }),
  setMaxRows: (rows) => set({ maxRows: rows }),

  // Enhanced Collision Detection
  checkCollision: (widget, excludeId = null) => {
    try {
      const state = get();
      const { x, y, w, h } = widget.gridArea;

      // Validate inputs
      if (x < 0 || y < 0 || w <= 0 || h <= 0) {
        return true;
      }

      // Check column bounds
      if (x + w > state.gridColumns) {
        return true;
      }

      // Check row bounds
      if (y + h > state.maxRows) {
        return true;
      }

      // Check overlap with other widgets
      return state.widgets.some(w => {
        if (w.id === excludeId) return false;
        const area = w.gridArea;

        return !(
          x >= area.x + area.w ||
          area.x >= x + w ||
          y >= area.y + area.h ||
          area.y >= y + h
        );
      });
    } catch (error) {
      console.error('Collision check error:', error);
      return true;
    }
  },

  // Smart findEmptySpace - tries top-left first, then anywhere on grid
  findEmptySpace: (width, height) => {
    const state = get();
    const maxColumns = state.gridColumns;
    const maxRows = state.maxRows;

    // First pass: Try to place near top-left for better UX
    for (let y = 0; y <= Math.min(3, maxRows - height); y++) {
      for (let x = 0; x <= maxColumns - width; x++) {
        const testWidget = { gridArea: { x, y, w: width, h: height } };
        if (!state.checkCollision(testWidget)) {
          return { x, y };
        }
      }
    }

    // Second pass: Try ALL positions - allows placement anywhere
    for (let y = 0; y <= maxRows - height; y++) {
      for (let x = 0; x <= maxColumns - width; x++) {
        const testWidget = { gridArea: { x, y, w: width, h: height } };
        if (!state.checkCollision(testWidget)) {
          return { x, y };
        }
      }
    }

    // If no space found, place at bottom
    const maxY = Math.max(...state.widgets.map(w => w.gridArea.y + w.gridArea.h), 0);
    return { x: 0, y: Math.min(maxY, maxRows - height) };
  },

  // Widget Selection
  selectWidget: (widgetId, multiSelect = false) => {
    set((state) => {
      const isAlreadySelected = state.selectedWidgetIds.includes(widgetId);

      if (multiSelect) {
        return {
          selectedWidgetIds: isAlreadySelected
            ? state.selectedWidgetIds.filter(id => id !== widgetId)
            : [...state.selectedWidgetIds, widgetId],
          propertyPanelOpen: true,
        };
      }

      if (isAlreadySelected && state.selectedWidgetIds.length === 1) {
        return state;
      }

      return {
        selectedWidgetIds: [widgetId],
        propertyPanelOpen: true,
      };
    });
  },

  deselectAll: () => set({ selectedWidgetIds: [], propertyPanelOpen: false }),
  selectMultiple: (widgetIds) => set({ selectedWidgetIds: widgetIds, propertyPanelOpen: widgetIds.length > 0 }),
  setHoveredWidget: (widgetId) => set({ hoveredWidgetId: widgetId }),

  // Widget CRUD
  addWidget: (widgetType, widgetConfig = {}) => {
    const state = get();

    let gridArea = widgetConfig.gridArea;
    if (!gridArea) {
      const defaultWidth = Math.min(widgetType.minW || 6, state.gridColumns);
      const defaultHeight = Math.min(widgetType.minH || 4, state.maxRows);
      const position = state.findEmptySpace(defaultWidth, defaultHeight);
      gridArea = { x: position.x, y: position.y, w: defaultWidth, h: defaultHeight };
    }

    // Ensure widget fits within canvas
    if (gridArea.x + gridArea.w > state.gridColumns) {
      gridArea.w = state.gridColumns - gridArea.x;
    }
    if (gridArea.y + gridArea.h > state.maxRows) {
      gridArea.h = state.maxRows - gridArea.y;
    }

    const newWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: widgetType.id,
      gridArea,
      rotation: 0,
      locked: false,
      visible: true,
      opacity: 1,
      zIndex: state.widgets.length,
      data: { ...widgetType.defaultProps, ...widgetConfig.data },
    };

    set((state) => ({
      widgets: [...state.widgets, newWidget],
      selectedWidgetIds: [newWidget.id],
      propertyPanelOpen: true,
    }));

    get().saveToHistory();
    get().saveToLocalStorage();
    return newWidget;
  },

  updateWidget: (widgetId, updates) => {
    batchedUpdates(() => {
      set((state) => ({
        widgets: state.widgets.map((widget) =>
          widget.id === widgetId ? { ...widget, ...updates } : widget
        ),
      }));
      get().saveToLocalStorage();
    });
  },

  updateWidgetData: (widgetId, dataUpdates) => {
    batchedUpdates(() => {
      set((state) => ({
        widgets: state.widgets.map((widget) =>
          widget.id === widgetId
            ? { ...widget, data: { ...widget.data, ...dataUpdates } }
            : widget
        ),
      }));
      get().saveToLocalStorage();
    });
  },

  updateWidgetGridArea: (widgetId, gridArea, checkCollision = true) => {
    const state = get();
    const widget = state.widgets.find(w => w.id === widgetId);
    if (!widget) return false;

    const maxColumns = state.gridColumns;
    const maxRows = state.maxRows;

    // Constrain to canvas boundaries
    const constrainedArea = {
      x: Math.max(0, Math.min(gridArea.x, maxColumns - gridArea.w)),
      y: Math.max(0, Math.min(gridArea.y, maxRows - gridArea.h)),
      w: Math.max(GRID_CONFIG.minWidgetWidth, Math.min(gridArea.w, maxColumns)),
      h: Math.max(GRID_CONFIG.minWidgetHeight, Math.min(gridArea.h, maxRows))
    };

    // Ensure widget doesn't exceed canvas bounds
    if (constrainedArea.x + constrainedArea.w > maxColumns) {
      constrainedArea.w = maxColumns - constrainedArea.x;
    }
    if (constrainedArea.y + constrainedArea.h > maxRows) {
      constrainedArea.h = maxRows - constrainedArea.y;
    }

    if (checkCollision) {
      const testWidget = { gridArea: constrainedArea };
      if (state.checkCollision(testWidget, widgetId)) {
        return false;
      }
    }

    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId ? { ...w, gridArea: constrainedArea } : w
      ),
    }));

    return true;
  },

  deleteWidget: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.filter((widget) => widget.id !== widgetId),
      selectedWidgetIds: state.selectedWidgetIds.filter(id => id !== widgetId),
    }));
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  deleteSelectedWidgets: () => {
    const state = get();
    set({
      widgets: state.widgets.filter((widget) => !state.selectedWidgetIds.includes(widget.id)),
      selectedWidgetIds: [],
      propertyPanelOpen: false,
    });
    get().saveToHistory();
    get().saveToLocalStorage();
  },

  duplicateWidget: (widgetId) => {
    const state = get();
    const widget = state.widgets.find((w) => w.id === widgetId);
    if (!widget) return;
    const position = state.findEmptySpace(widget.gridArea.w, widget.gridArea.h);

    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gridArea: { ...widget.gridArea, x: position.x, y: position.y },
      zIndex: state.widgets.length,
      data: { ...widget.data },
    };

    set((state) => ({
      widgets: [...state.widgets, newWidget],
      selectedWidgetIds: [newWidget.id],
    }));

    get().saveToHistory();
    get().saveToLocalStorage();
    return newWidget;
  },

  toggleWidgetLock: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, locked: !widget.locked } : widget
      ),
    }));
    get().saveToLocalStorage();
  },

  toggleWidgetVisibility: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      ),
    }));
    get().saveToLocalStorage();
  },

  // Template Management
  loadTemplate: (template) => {
    set({ widgets: [], selectedWidgetIds: [], propertyPanelOpen: false, canvasZoom: DEFAULT_CANVAS_ZOOM, canvasPan: { x: 0, y: 0 }, });
    const newWidgets = template.widgets.map((widgetConfig, index) => ({
      id: `widget-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      type: widgetConfig.type,
      gridArea: widgetConfig.gridArea,
      rotation: 0,
      locked: false,
      visible: true,
      opacity: 1,
      zIndex: index,
      data: { ...widgetConfig.data },
    }));

    set({ widgets: newWidgets });

    get().saveToHistory();
    get().saveToLocalStorage();
  },

  // Clipboard Operations
  copySelectedWidgets: () => {
    const state = get();
    const selectedWidgets = state.widgets.filter((w) =>
      state.selectedWidgetIds.includes(w.id)
    );
    set({ clipboard: selectedWidgets });
  },

  pasteWidgets: () => {
    const state = get();
    if (!state.clipboard || state.clipboard.length === 0) return;
    const newWidgets = state.clipboard.map((widget) => {
      const position = state.findEmptySpace(widget.gridArea.w, widget.gridArea.h);

      return {
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gridArea: { ...widget.gridArea, x: position.x, y: position.y },
        zIndex: state.widgets.length + state.clipboard.indexOf(widget),
        data: { ...widget.data },
      };
    });

    set((state) => ({
      widgets: [...state.widgets, ...newWidgets],
      selectedWidgetIds: newWidgets.map((w) => w.id),
    }));

    get().saveToHistory();
    get().saveToLocalStorage();
  },

  // Z-Index Management
  bringToFront: (widgetId) => {
    const state = get();
    const maxZIndex = Math.max(...state.widgets.map(w => w.zIndex), 0);
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, zIndex: maxZIndex + 1 } : widget
      ),
    }));
    get().saveToLocalStorage();
  },

  sendToBack: (widgetId) => {
    const state = get();
    const minZIndex = Math.min(...state.widgets.map(w => w.zIndex), 0);
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, zIndex: minZIndex - 1 } : widget
      ),
    }));
    get().saveToLocalStorage();
  },

  // Interaction State
  setIsDragging: (isDragging, widgetId = null) => set({ isDragging, draggedWidget: widgetId }),
  setIsResizing: (isResizing) => set({ isResizing }),
  setIsPanning: (isPanning) => set({ isPanning }),

  // History Management
  saveToHistory: () => {
    const state = get();
    const snapshot = {
      widgets: JSON.parse(JSON.stringify(state.widgets)),
      timestamp: Date.now(),
    };
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(snapshot);

    if (newHistory.length > state.maxHistory) {
      newHistory.shift();
    }

    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const state = get();
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1;
      const snapshot = state.history[newIndex];
      set({
        widgets: JSON.parse(JSON.stringify(snapshot.widgets)),
        historyIndex: newIndex,
        selectedWidgetIds: [],
      });
      get().saveToLocalStorage();
    }
  },

  redo: () => {
    const state = get();
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1;
      const snapshot = state.history[newIndex];
      set({
        widgets: JSON.parse(JSON.stringify(snapshot.widgets)),
        historyIndex: newIndex,
        selectedWidgetIds: [],
      });
      get().saveToLocalStorage();
    }
  },

  // Persistence
  saveToLocalStorage: () => {
    if (!checkStorageQuota()) {
      console.warn('Storage unavailable, skipping save');
      return false;
    }
    const state = get();
    try {
      const saveData = {
        widgets: state.widgets,
        showGrid: state.showGrid,
        gridColumns: state.gridColumns,
        sidebarWidth: state.sidebarWidth,
        propertyPanelWidth: state.propertyPanelWidth,
        version: '4.0.0',
      };

      const serialized = JSON.stringify(saveData);

      if (serialized.length > 5 * 1024 * 1024) {
        console.warn('Data too large for localStorage');
        return false;
      }

      localStorage.setItem('figma-dashboard-grid', serialized);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
      } else {
        console.error('Error saving to localStorage:', error);
      }
      return false;
    }
  },

  loadFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem('figma-dashboard-grid');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.version && (data.version.startsWith('3.') || data.version === '4.0.0')) {
          if (data.widgets) {
            set({
              widgets: data.widgets || [],
              canvasZoom: DEFAULT_CANVAS_ZOOM,
              canvasPan: { x: 0, y: 0 },
              showGrid: data.showGrid !== undefined ? data.showGrid : true,
              gridColumns: 24,
              sidebarWidth: data.sidebarWidth || SIDEBAR_DEFAULT_WIDTH,
              propertyPanelWidth: data.propertyPanelWidth || PROPERTY_PANEL_DEFAULT_WIDTH,
            });

            if (data.widgets && data.widgets.length > 0) {
              get().saveToHistory();
            }
          } else {
            set({ showTemplateSelector: true }); 
          }
        } else {
          set({ showTemplateSelector: true });
        }
      } else {
        set({ showTemplateSelector: true });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      set({ showTemplateSelector: true });
    }
  },

  clearDashboard: () => {
    set({
      widgets: [],
      selectedWidgetIds: [],
      history: [],
      historyIndex: -1,
      canvasZoom: DEFAULT_CANVAS_ZOOM,
      canvasPan: { x: 0, y: 0 },
    });
    try {
      localStorage.removeItem('figma-dashboard-grid');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  exportDashboard: () => {
    const state = get();
    return {
      version: '4.0.0',
      canvasSize: { width: 1366, height: 768 },
      timestamp: new Date().toISOString(),
      widgets: state.widgets,
      settings: {
        showGrid: state.showGrid,
        gridColumns: state.gridColumns,
        maxRows: state.maxRows,
      },
    };
  },

  importDashboard: (data) => {
    if (!data || !data.widgets) {
      throw new Error('Invalid dashboard data');
    }
    set({
      widgets: data.widgets,
      selectedWidgetIds: [],
      showGrid: data.settings?.showGrid !== undefined ? data.settings.showGrid : true,
      canvasZoom: DEFAULT_CANVAS_ZOOM,
      canvasPan: { x: 0, y: 0 },
      gridColumns: 24,
    });

    get().saveToHistory();
    get().saveToLocalStorage();
  },
}));

export default useDashboardStore;