// src/store/dashboardStore.js
import { create } from 'zustand';
import GRID_CONFIG from '../config/gridConfig';

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 280;

const PROPERTY_PANEL_MIN_WIDTH = 240;
const PROPERTY_PANEL_MAX_WIDTH = 500;
const PROPERTY_PANEL_DEFAULT_WIDTH = 320;

const useDashboardStore = create((set, get) => ({
  // UI State
  sidebarOpen: true,
  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
  propertyPanelOpen: false,
  propertyPanelWidth: PROPERTY_PANEL_DEFAULT_WIDTH,
  showTemplateSelector: false,
  
  // Canvas State
  canvasZoom: 1,
  canvasPan: { x: 0, y: 0 },
  showGrid: true,
  gridColumns: GRID_CONFIG.columns,
  currentBreakpoint: 'lg',
  
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

  // === UI Actions ===
  
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  
  setSidebarWidth: (width) => set({ 
    sidebarWidth: Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, width))
  }),
  
  togglePropertyPanel: () => set((state) => ({ 
    propertyPanelOpen: !state.propertyPanelOpen 
  })),
  
  setPropertyPanelWidth: (width) => set({ 
    propertyPanelWidth: Math.max(PROPERTY_PANEL_MIN_WIDTH, Math.min(PROPERTY_PANEL_MAX_WIDTH, width))
  }),

  setShowTemplateSelector: (show) => set({ showTemplateSelector: show }),

  // === Canvas Actions ===
  
  setCanvasZoom: (zoom) => set({ 
    canvasZoom: Math.max(0.5, Math.min(2, zoom))
  }),
  
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  
  resetCanvasView: () => set({ 
    canvasZoom: 1, 
    canvasPan: { x: 0, y: 0 } 
  }),
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),

  setCurrentBreakpoint: (breakpoint) => set({ currentBreakpoint: breakpoint }),

  updateGridColumns: (columns) => set({ gridColumns: columns }),

  // === Grid Collision Detection ===
  
  checkCollision: (widget, excludeId = null) => {
    const state = get();
    const { x, y, w, h } = widget.gridArea;
    
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
  },

  findEmptySpace: (width, height) => {
    const state = get();
    const maxColumns = state.gridColumns;
    
    // Try to find empty space row by row
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x <= maxColumns - width; x++) {
        const testWidget = { gridArea: { x, y, w: width, h: height } };
        if (!state.checkCollision(testWidget)) {
          return { x, y };
        }
      }
    }
    
    // If no space found, place at bottom
    const maxY = Math.max(...state.widgets.map(w => w.gridArea.y + w.gridArea.h), 0);
    return { x: 0, y: maxY };
  },

  // === Widget Selection ===
  
  selectWidget: (widgetId, multiSelect = false) => {
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedWidgetIds.includes(widgetId);
        return {
          selectedWidgetIds: isSelected
            ? state.selectedWidgetIds.filter(id => id !== widgetId)
            : [...state.selectedWidgetIds, widgetId],
          propertyPanelOpen: true,
        };
      }
      return {
        selectedWidgetIds: [widgetId],
        propertyPanelOpen: true,
      };
    });
  },
  
  deselectAll: () => set({ 
    selectedWidgetIds: [],
    propertyPanelOpen: false,
  }),
  
  selectMultiple: (widgetIds) => set({ 
    selectedWidgetIds: widgetIds,
    propertyPanelOpen: widgetIds.length > 0,
  }),
  
  setHoveredWidget: (widgetId) => set({ hoveredWidgetId: widgetId }),

  // === Widget CRUD ===
  
  addWidget: (widgetType, widgetConfig = {}) => {
    const state = get();
    
    // Use provided grid area or find empty space
    let gridArea = widgetConfig.gridArea;
    if (!gridArea) {
      const defaultWidth = Math.min(widgetType.minW || 4, state.gridColumns);
      const defaultHeight = widgetType.minH || 2;
      const position = state.findEmptySpace(defaultWidth, defaultHeight);
      gridArea = { 
        x: position.x, 
        y: position.y, 
        w: defaultWidth, 
        h: defaultHeight 
      };
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
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
    }));
    get().saveToLocalStorage();
  },
  
  updateWidgetData: (widgetId, dataUpdates) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId 
          ? { ...widget, data: { ...widget.data, ...dataUpdates } }
          : widget
      ),
    }));
    get().saveToLocalStorage();
  },
  
  updateWidgetGridArea: (widgetId, gridArea, checkCollision = true) => {
    const state = get();
    const widget = state.widgets.find(w => w.id === widgetId);
    if (!widget) return false;

    // Ensure widget stays within grid bounds
    const maxColumns = state.gridColumns;
    const constrainedArea = {
      x: Math.max(0, Math.min(gridArea.x, maxColumns - gridArea.w)),
      y: Math.max(0, gridArea.y),
      w: Math.max(GRID_CONFIG.minWidgetWidth, Math.min(gridArea.w, maxColumns)),
      h: Math.max(GRID_CONFIG.minWidgetHeight, gridArea.h)
    };

    // Check collision if enabled
    if (checkCollision) {
      const testWidget = { gridArea: constrainedArea };
      if (state.checkCollision(testWidget, widgetId)) {
        return false;
      }
    }

    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId 
          ? { ...w, gridArea: constrainedArea }
          : w
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
      widgets: state.widgets.filter(
        (widget) => !state.selectedWidgetIds.includes(widget.id)
      ),
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

    // Find empty space for duplicate
    const position = state.findEmptySpace(widget.gridArea.w, widget.gridArea.h);

    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gridArea: {
        ...widget.gridArea,
        x: position.x,
        y: position.y
      },
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
        widget.id === widgetId 
          ? { ...widget, locked: !widget.locked }
          : widget
      ),
    }));
    get().saveToLocalStorage();
  },
  
  toggleWidgetVisibility: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId 
          ? { ...widget, visible: !widget.visible }
          : widget
      ),
    }));
    get().saveToLocalStorage();
  },

  // === Template Management ===
  
  loadTemplate: (template) => {
    const state = get();
    
    // Clear existing widgets
    set({ 
      widgets: [],
      selectedWidgetIds: [],
      propertyPanelOpen: false 
    });

    // Add template widgets with proper IDs
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

  // === Clipboard Operations ===
  
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
      // Find empty space
      const position = state.findEmptySpace(widget.gridArea.w, widget.gridArea.h);
      
      return {
        ...widget,
        id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        gridArea: {
          ...widget.gridArea,
          x: position.x,
          y: position.y
        },
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

  // === Z-Index Management ===
  
  bringToFront: (widgetId) => {
    const state = get();
    const maxZIndex = Math.max(...state.widgets.map(w => w.zIndex), 0);
    
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId 
          ? { ...widget, zIndex: maxZIndex + 1 }
          : widget
      ),
    }));
    get().saveToLocalStorage();
  },
  
  sendToBack: (widgetId) => {
    const state = get();
    const minZIndex = Math.min(...state.widgets.map(w => w.zIndex), 0);
    
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId 
          ? { ...widget, zIndex: minZIndex - 1 }
          : widget
      ),
    }));
    get().saveToLocalStorage();
  },

  // === Interaction State ===
  
  setIsDragging: (isDragging, widgetId = null) => set({ 
    isDragging,
    draggedWidget: widgetId 
  }),
  
  setIsResizing: (isResizing) => set({ isResizing }),
  setIsPanning: (isPanning) => set({ isPanning }),

  // === History Management ===
  
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

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
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

  // === Persistence ===
  
  saveToLocalStorage: () => {
    const state = get();
    try {
      const saveData = {
        widgets: state.widgets,
        canvasZoom: state.canvasZoom,
        canvasPan: state.canvasPan,
        showGrid: state.showGrid,
        gridColumns: state.gridColumns,
        sidebarWidth: state.sidebarWidth,
        propertyPanelWidth: state.propertyPanelWidth,
        version: '3.0.0',
      };
      localStorage.setItem('figma-dashboard-grid', JSON.stringify(saveData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  loadFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem('figma-dashboard-grid');
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Check if it's the new grid format
        if (data.version === '3.0.0' && data.widgets) {
          set({
            widgets: data.widgets || [],
            canvasZoom: data.canvasZoom || 1,
            canvasPan: data.canvasPan || { x: 0, y: 0 },
            showGrid: data.showGrid !== undefined ? data.showGrid : true,
            gridColumns: data.gridColumns || GRID_CONFIG.columns,
            sidebarWidth: data.sidebarWidth || SIDEBAR_DEFAULT_WIDTH,
            propertyPanelWidth: data.propertyPanelWidth || PROPERTY_PANEL_DEFAULT_WIDTH,
          });
          
          // Initialize history with loaded state
          if (data.widgets && data.widgets.length > 0) {
            get().saveToHistory();
          }
        } else {
          // Old format detected, show template selector
          set({ showTemplateSelector: true });
        }
      } else {
        // No saved data, show template selector
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
      canvasZoom: 1,
      canvasPan: { x: 0, y: 0 },
    });
    localStorage.removeItem('figma-dashboard-grid');
  },
  
  // === Export/Import ===
  
  exportDashboard: () => {
    const state = get();
    return {
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      widgets: state.widgets,
      settings: {
        showGrid: state.showGrid,
        gridColumns: state.gridColumns,
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
      gridColumns: data.settings?.gridColumns || GRID_CONFIG.columns,
    });
    
    get().saveToHistory();
    get().saveToLocalStorage();
  },
}));

export default useDashboardStore;