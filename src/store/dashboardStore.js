import { create } from 'zustand';

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
  
  // Canvas State
  canvasZoom: 1,
  canvasPan: { x: 0, y: 0 },
  showGrid: true,
  snapToGrid: false,
  gridSize: 20,
  
  // Widget State
  widgets: [],
  selectedWidgetIds: [],
  hoveredWidgetId: null,
  clipboard: null,
  
  // Interaction State
  isDragging: false,
  isResizing: false,
  isPanning: false,
  
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

  // === Canvas Actions ===
  
  setCanvasZoom: (zoom) => set({ 
    canvasZoom: Math.max(0.1, Math.min(5, zoom))
  }),
  
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  
  resetCanvasView: () => set({ 
    canvasZoom: 1, 
    canvasPan: { x: 0, y: 0 } 
  }),
  
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),

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
    const newWidget = {
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: widgetType.id,
      position: widgetConfig.position || { 
        x: 50 + state.widgets.length * 20, 
        y: 50 + state.widgets.length * 20 
      },
      size: widgetConfig.size || { 
        width: widgetType.defaultWidth || 400, 
        height: widgetType.defaultHeight || 300 
      },
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
  
  updateWidgetPosition: (widgetId, position) => {
    const state = get();
    let finalPosition = position;
    
    if (state.snapToGrid) {
      finalPosition = {
        x: Math.round(position.x / state.gridSize) * state.gridSize,
        y: Math.round(position.y / state.gridSize) * state.gridSize,
      };
    }
    
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId 
          ? { ...widget, position: finalPosition }
          : widget
      ),
    }));
  },
  
  updateWidgetSize: (widgetId, size) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId 
          ? { ...widget, size }
          : widget
      ),
    }));
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

    const newWidget = {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: widget.position.x + 20,
        y: widget.position.y + 20,
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

    const newWidgets = state.clipboard.map((widget) => ({
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: widget.position.x + 30,
        y: widget.position.y + 30,
      },
      zIndex: state.widgets.length + state.clipboard.indexOf(widget),
      data: { ...widget.data },
    }));

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
  
  setIsDragging: (isDragging) => set({ isDragging }),
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
        snapToGrid: state.snapToGrid,
        sidebarWidth: state.sidebarWidth,
        propertyPanelWidth: state.propertyPanelWidth,
      };
      localStorage.setItem('figma-dashboard-v2', JSON.stringify(saveData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  loadFromLocalStorage: () => {
    try {
      const savedData = localStorage.getItem('figma-dashboard-v2');
      if (savedData) {
        const data = JSON.parse(savedData);
        set({
          widgets: data.widgets || [],
          canvasZoom: data.canvasZoom || 1,
          canvasPan: data.canvasPan || { x: 0, y: 0 },
          showGrid: data.showGrid !== undefined ? data.showGrid : true,
          snapToGrid: data.snapToGrid || false,
          sidebarWidth: data.sidebarWidth || SIDEBAR_DEFAULT_WIDTH,
          propertyPanelWidth: data.propertyPanelWidth || PROPERTY_PANEL_DEFAULT_WIDTH,
        });
        
        // Initialize history with loaded state
        if (data.widgets && data.widgets.length > 0) {
          get().saveToHistory();
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
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
    localStorage.removeItem('figma-dashboard-v2');
  },
  
  // === Export/Import ===
  
  exportDashboard: () => {
    const state = get();
    return {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      widgets: state.widgets,
      settings: {
        showGrid: state.showGrid,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
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
      snapToGrid: data.settings?.snapToGrid || false,
      gridSize: data.settings?.gridSize || 20,
    });
    
    get().saveToHistory();
    get().saveToLocalStorage();
  },
}));

export default useDashboardStore;