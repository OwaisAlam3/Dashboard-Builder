// src/store/dashboardStore.js - FIXED: NO COLLISION DETECTION - Free widget placement
import { create } from 'zustand';
import GRID_CONFIG from '../config/gridConfig';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const SIDEBAR_MIN_WIDTH = 200;
const SIDEBAR_MAX_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 280;
const PROPERTY_PANEL_MIN_WIDTH = 240;
const PROPERTY_PANEL_MAX_WIDTH = 500;
const PROPERTY_PANEL_DEFAULT_WIDTH = 320;
const DEFAULT_CANVAS_ZOOM = 0.7;
const FIXED_MAX_ROWS = GRID_CONFIG.getMaxRows(768);

// Debounce helper
const createDebounce = () => {
  let timeout = null;
  return (fn, delay = 2000) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
};

const debounceAutoSave = createDebounce();

// Helper to constrain widget to grid boundaries
const constrainWidgetToGrid = (widget, gridColumns, maxRows) => {
  const { x, y, w, h } = widget.gridArea;
  
  // Constrain width and height to grid size
  const constrainedW = Math.min(w, gridColumns);
  const constrainedH = Math.min(h, maxRows);
  
  // Constrain position so widget doesn't exceed boundaries
  const constrainedX = Math.max(0, Math.min(x, gridColumns - constrainedW));
  const constrainedY = Math.max(0, Math.min(y, maxRows - constrainedH));
  
  return {
    ...widget,
    gridArea: {
      x: constrainedX,
      y: constrainedY,
      w: constrainedW,
      h: constrainedH
    }
  };
};

const useDashboardStore = create((set, get) => ({
  // ==================== UI STATE ====================
  sidebarOpen: true,
  sidebarWidth: SIDEBAR_DEFAULT_WIDTH,
  propertyPanelOpen: false,
  propertyPanelWidth: PROPERTY_PANEL_DEFAULT_WIDTH,
  showTemplateSelector: false,

  // ==================== DASHBOARD STATE ====================
  dashboards: [],
  dashboardsLoading: false,
  dashboardsError: null,
  currentDashboardId: null,
  currentDashboardName: null,
  
  // ==================== TEMPLATE STATE ====================
  templates: [],
  templatesLoading: false,
  templatesError: null,

  // ==================== CANVAS STATE ====================
  canvasZoom: DEFAULT_CANVAS_ZOOM,
  canvasPan: { x: 0, y: 0 },
  showGrid: true,
  gridColumns: 24,
  currentBreakpoint: 'lg',
  maxRows: FIXED_MAX_ROWS,

  // ==================== WIDGET STATE ====================
  widgets: [],
  selectedWidgetIds: [],
  hoveredWidgetId: null,
  clipboard: null,

  // ==================== INTERACTION STATE ====================
  isDragging: false,
  isResizing: false,
  isPanning: false,
  draggedWidget: null,

  // ==================== HISTORY STATE ====================
  history: [],
  historyIndex: -1,
  maxHistory: 50,

  // ==================== SAVE STATE ====================
  isSaving: false,
  lastSaved: null,
  hasUnsavedChanges: false,

  // ==================== INITIALIZATION ====================
  initializeApp: async () => {
    try {
      const uiPrefs = localStorage.getItem('dashboard-ui-preferences');
      if (uiPrefs) {
        const prefs = JSON.parse(uiPrefs);
        set({
          sidebarWidth: prefs.sidebarWidth || SIDEBAR_DEFAULT_WIDTH,
          propertyPanelWidth: prefs.propertyPanelWidth || PROPERTY_PANEL_DEFAULT_WIDTH,
          showGrid: prefs.showGrid !== undefined ? prefs.showGrid : true,
          canvasZoom: prefs.canvasZoom || DEFAULT_CANVAS_ZOOM,
        });
      }
    } catch (error) {
      console.error('Error loading UI preferences:', error);
    }

    await get().fetchTemplates();
    await get().fetchDashboards();
  },

  saveUIPreferences: () => {
    const state = get();
    try {
      const prefs = {
        sidebarWidth: state.sidebarWidth,
        propertyPanelWidth: state.propertyPanelWidth,
        showGrid: state.showGrid,
        canvasZoom: state.canvasZoom,
      };
      localStorage.setItem('dashboard-ui-preferences', JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving UI preferences:', error);
    }
  },

  // ==================== DASHBOARD CRUD ====================
  fetchDashboards: async () => {
    set({ dashboardsLoading: true, dashboardsError: null });
    try {
      const response = await fetch(`${API_URL}/dashboards`);
      if (!response.ok) throw new Error('Failed to fetch dashboards');
      const data = await response.json();
      set({ dashboards: data, dashboardsLoading: false });
      return data;
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      set({ dashboardsLoading: false, dashboardsError: error.message });
      return [];
    }
  },

  loadDashboard: async (dashboardId, embedToken = null) => {
    if (!dashboardId) {
      console.error('loadDashboard: No dashboard ID provided');
      return null;
    }

    try {
      const headers = {};
      if (embedToken) {
        headers['X-Embed-Token'] = embedToken;
      }

      const response = await fetch(`${API_URL}/dashboards/${dashboardId}`, { headers });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Dashboard not found');
        }
        throw new Error('Failed to load dashboard');
      }
      
      const dashboard = await response.json();
      
      const state = get();
      
      set({ 
        currentDashboardId: dashboard.id,
        currentDashboardName: dashboard.name,
        widgets: (dashboard.widgets || []).map(w => constrainWidgetToGrid(w, state.gridColumns, state.maxRows)),
        selectedWidgetIds: [],
        propertyPanelOpen: false,
        hasUnsavedChanges: false,
        canvasZoom: DEFAULT_CANVAS_ZOOM,
        canvasPan: { x: 0, y: 0 },
        history: [],
        historyIndex: -1,
      });
      
      get().saveToHistory();
      
      return dashboard;
    } catch (error) {
      console.error('Error loading dashboard:', error);
      throw error;
    }
  },

  createDashboard: async (name, widgets = [], isPublic = false) => {
    try {
      const response = await fetch(`${API_URL}/dashboards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, widgets, isPublic })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create dashboard');
      }
      
      const dashboard = await response.json();
      
      const state = get();
      
      set({ 
        currentDashboardId: dashboard.id,
        currentDashboardName: dashboard.name,
        widgets: (dashboard.widgets || []).map(w => constrainWidgetToGrid(w, state.gridColumns, state.maxRows)),
        hasUnsavedChanges: false,
        selectedWidgetIds: [],
        propertyPanelOpen: false,
        history: [],
        historyIndex: -1,
      });
      
      get().fetchDashboards();
      get().saveToHistory();
      
      return dashboard;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  },

  updateDashboardName: async (newName) => {
    const state = get();
    
    if (!state.currentDashboardId || !newName || newName.trim() === '') {
      return null;
    }

    const trimmedName = newName.trim();
    
    // Optimistic update
    set({ 
      currentDashboardName: trimmedName,
      hasUnsavedChanges: true 
    });

    try {
      const response = await fetch(`${API_URL}/dashboards/${state.currentDashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          widgets: state.widgets
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update dashboard name');
      }

      const updatedDashboard = await response.json();
      
      set({ 
        hasUnsavedChanges: false,
        lastSaved: new Date(),
      });
      
      get().fetchDashboards();
      
      return updatedDashboard;
    } catch (error) {
      console.error('Error updating dashboard name:', error);
      throw error;
    }
  },

  saveDashboard: async () => {
    const state = get();
    
    if (!state.currentDashboardId) {
      console.warn('No dashboard loaded to save');
      return null;
    }

    set({ isSaving: true });

    try {
      const response = await fetch(`${API_URL}/dashboards/${state.currentDashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.currentDashboardName,
          widgets: state.widgets
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save dashboard');
      }

      const updatedDashboard = await response.json();
      
      set({ 
        hasUnsavedChanges: false,
        isSaving: false,
        lastSaved: new Date(),
        currentDashboardName: updatedDashboard.name,
      });
      
      get().fetchDashboards();
      
      return updatedDashboard;
    } catch (error) {
      console.error('Error saving dashboard:', error);
      set({ isSaving: false });
      throw error;
    }
  },

  autoSave: () => {
    const state = get();
    if (!state.currentDashboardId || !state.hasUnsavedChanges) return;
    
    debounceAutoSave(() => {
      get().saveDashboard();
    }, 2000);
  },

  deleteDashboard: async (dashboardId) => {
    try {
      const response = await fetch(`${API_URL}/dashboards/${dashboardId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete dashboard');
      }

      const state = get();
      
      if (state.currentDashboardId === dashboardId) {
        set({
          currentDashboardId: null,
          currentDashboardName: null,
          widgets: [],
          selectedWidgetIds: [],
          hasUnsavedChanges: false,
          history: [],
          historyIndex: -1,
        });
      }
      
      get().fetchDashboards();
      
      return true;
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw error;
    }
  },

  duplicateDashboard: async (dashboardId) => {
    try {
      const response = await fetch(`${API_URL}/dashboards/${dashboardId}`);
      if (!response.ok) throw new Error('Dashboard not found');
      
      const dashboard = await response.json();
      const newDashboard = await get().createDashboard(
        `${dashboard.name} (Copy)`, 
        dashboard.widgets
      );
      
      return newDashboard;
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
      throw error;
    }
  },

  clearDashboard: () => {
    set({
      widgets: [],
      selectedWidgetIds: [],
      hasUnsavedChanges: true,
      propertyPanelOpen: false,
    });
    get().saveToHistory();
    get().autoSave();
  },

  // ==================== TEMPLATE MANAGEMENT ====================
  fetchTemplates: async () => {
    set({ templatesLoading: true, templatesError: null });
    try {
      const response = await fetch(`${API_URL}/templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      
      // Ensure blank template is first
      const blankTemplate = data.find(t => t.id === 'blank');
      const otherTemplates = data.filter(t => t.id !== 'blank');
      const sortedTemplates = blankTemplate 
        ? [blankTemplate, ...otherTemplates]
        : data;
      
      set({ templates: sortedTemplates, templatesLoading: false, templatesError: null });
    } catch (error) {
      console.error('Error fetching templates:', error);
      set({ templatesLoading: false, templatesError: error.message });
    }
  },

  loadTemplate: async (template) => {
    try {
      const dashboard = await get().createDashboard(template.name, template.widgets);
      return dashboard;
    } catch (error) {
      console.error('Error loading template:', error);
      throw error;
    }
  },

  // ==================== UI ACTIONS ====================
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
    get().saveUIPreferences();
  },
  
  setSidebarWidth: (width) => {
    set({ sidebarWidth: Math.max(SIDEBAR_MIN_WIDTH, Math.min(SIDEBAR_MAX_WIDTH, width)) });
    get().saveUIPreferences();
  },
  
  togglePropertyPanel: () => {
    set((state) => ({ propertyPanelOpen: !state.propertyPanelOpen }));
  },
  
  setPropertyPanelWidth: (width) => {
    set({ propertyPanelWidth: Math.max(PROPERTY_PANEL_MIN_WIDTH, Math.min(PROPERTY_PANEL_MAX_WIDTH, width)) });
    get().saveUIPreferences();
  },
  
  setShowTemplateSelector: (show) => set({ showTemplateSelector: show }),

  // ==================== CANVAS ACTIONS ====================
  setCanvasZoom: (zoom) => {
    set({ canvasZoom: Math.max(0.25, Math.min(3, zoom)) });
    get().saveUIPreferences();
  },
  
  setCanvasPan: (pan) => set({ canvasPan: pan }),
  
  resetCanvasView: () => {
    set({ canvasZoom: DEFAULT_CANVAS_ZOOM, canvasPan: { x: 0, y: 0 } });
    get().saveUIPreferences();
  },
  
  fitCanvasToScreen: (viewportWidth, viewportHeight) => {
    const zoom = GRID_CONFIG.calculateFitZoom(viewportWidth, viewportHeight);
    set({ canvasZoom: zoom, canvasPan: { x: 0, y: 0 } });
    get().saveUIPreferences();
  },
  
  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }));
    get().saveUIPreferences();
  },
  
  setCurrentBreakpoint: (breakpoint) => set({ currentBreakpoint: breakpoint }),
  updateGridColumns: (columns) => set({ gridColumns: columns }),
  setMaxRows: (rows) => set({ maxRows: rows }),

  // ==================== COLLISION DETECTION - DISABLED ====================
  // FIXED: checkCollision now only validates bounds, NOT overlap with other widgets
  checkCollision: (widget, excludeId = null) => {
    const state = get();
    const { x, y, w, h } = widget.gridArea;
    
    // Only check canvas boundaries - NO overlap checking
    if (x < 0 || y < 0 || w <= 0 || h <= 0) return true;
    if (x + w > state.gridColumns) return true;
    if (y + h > state.maxRows) return true;
    
    // REMOVED: Widget overlap checking - widgets can now overlap freely
    return false;
  },
  
  // FIXED: findEmptySpace now simply places widgets at the end
  findEmptySpace: (width, height) => {
    const state = get();
    
    // Simple strategy: Place at x=0, below all existing widgets
    if (state.widgets.length === 0) {
      return { x: 0, y: 0 };
    }
    
    const maxY = Math.max(
      ...state.widgets.map(w => w.gridArea.y + w.gridArea.h), 
      0
    );
    
    return { x: 0, y: Math.min(maxY, state.maxRows - height) };
  },

  // ==================== WIDGET SELECTION ====================
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
        propertyPanelOpen: true 
      };
    });
  },

  deselectAll: () => set({ selectedWidgetIds: [], propertyPanelOpen: false }),
  selectMultiple: (widgetIds) => set({ selectedWidgetIds: widgetIds, propertyPanelOpen: widgetIds.length > 0 }),
  setHoveredWidget: (widgetId) => set({ hoveredWidgetId: widgetId }),
  clearSelection: () => set({ selectedWidgetIds: [], propertyPanelOpen: false }),

  // ==================== WIDGET CRUD ====================
  addWidget: (widgetType, widgetConfig = {}) => {
    const state = get();
    
    let gridArea = widgetConfig.gridArea;
    if (!gridArea) {
      const defaultWidth = Math.min(widgetType.minW || 6, state.gridColumns);
      const defaultHeight = Math.min(widgetType.minH || 4, state.maxRows);
      const position = state.findEmptySpace(defaultWidth, defaultHeight);
      gridArea = { x: position.x, y: position.y, w: defaultWidth, h: defaultHeight };
    }
    
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

    set({
      widgets: [...state.widgets, newWidget],
      selectedWidgetIds: [newWidget.id],
      propertyPanelOpen: true,
      hasUnsavedChanges: true,
    });
    
    get().saveToHistory();
    get().autoSave();
    
    return newWidget;
  },

  updateWidget: (widgetId, updates) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, ...updates } : widget
      ),
      hasUnsavedChanges: true,
    }));
    get().autoSave();
  },

  updateWidgetData: (widgetId, dataUpdates) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId 
          ? { ...widget, data: { ...widget.data, ...dataUpdates } } 
          : widget
      ),
      hasUnsavedChanges: true,
    }));
    get().autoSave();
  },

  // FIXED: updateWidgetGridArea with NO collision checking
  updateWidgetGridArea: (widgetId, gridArea, checkCollision = false) => {
    const state = get();
    const widget = state.widgets.find(w => w.id === widgetId);
    if (!widget) return false;
    
    const maxColumns = state.gridColumns;
    const maxRows = state.maxRows;
    
    // Only constrain to canvas boundaries
    const constrainedArea = {
      x: Math.max(0, Math.min(gridArea.x, maxColumns - gridArea.w)),
      y: Math.max(0, Math.min(gridArea.y, maxRows - gridArea.h)),
      w: Math.max(GRID_CONFIG.minWidgetWidth, Math.min(gridArea.w, maxColumns)),
      h: Math.max(GRID_CONFIG.minWidgetHeight, Math.min(gridArea.h, maxRows))
    };
    
    if (constrainedArea.x + constrainedArea.w > maxColumns) {
      constrainedArea.w = maxColumns - constrainedArea.x;
    }
    if (constrainedArea.y + constrainedArea.h > maxRows) {
      constrainedArea.h = maxRows - constrainedArea.y;
    }
    
    // REMOVED: Collision checking - widgets can now be placed anywhere
    
    set((state) => ({
      widgets: state.widgets.map((w) => 
        w.id === widgetId ? { ...w, gridArea: constrainedArea } : w
      ),
      hasUnsavedChanges: true,
    }));
    
    return true;
  },

  deleteWidget: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.filter((widget) => widget.id !== widgetId),
      selectedWidgetIds: state.selectedWidgetIds.filter(id => id !== widgetId),
      hasUnsavedChanges: true,
    }));
    get().saveToHistory();
    get().autoSave();
  },

  deleteSelectedWidgets: () => {
    const state = get();
    set({
      widgets: state.widgets.filter((widget) => !state.selectedWidgetIds.includes(widget.id)),
      selectedWidgetIds: [],
      propertyPanelOpen: false,
      hasUnsavedChanges: true,
    });
    get().saveToHistory();
    get().autoSave();
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
    
    set({
      widgets: [...state.widgets, newWidget],
      selectedWidgetIds: [newWidget.id],
      hasUnsavedChanges: true,
    });
    
    get().saveToHistory();
    get().autoSave();
    
    return newWidget;
  },

  toggleWidgetLock: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, locked: !widget.locked } : widget
      ),
      hasUnsavedChanges: true,
    }));
    get().autoSave();
  },

  toggleWidgetVisibility: (widgetId) => {
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, visible: !widget.visible } : widget
      ),
      hasUnsavedChanges: true,
    }));
    get().autoSave();
  },

  // ==================== CLIPBOARD ====================
  copySelectedWidgets: () => {
    const state = get();
    const selectedWidgets = state.widgets.filter((w) => state.selectedWidgetIds.includes(w.id));
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
    
    set({
      widgets: [...state.widgets, ...newWidgets],
      selectedWidgetIds: newWidgets.map((w) => w.id),
      hasUnsavedChanges: true,
    });
    
    get().saveToHistory();
    get().autoSave();
  },

  // ==================== Z-INDEX ====================
  bringToFront: (widgetId) => {
    const state = get();
    const maxZIndex = Math.max(...state.widgets.map(w => w.zIndex), 0);
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, zIndex: maxZIndex + 1 } : widget
      ),
      hasUnsavedChanges: true,
    }));
    get().autoSave();
  },

  sendToBack: (widgetId) => {
    const state = get();
    const minZIndex = Math.min(...state.widgets.map(w => w.zIndex), 0);
    set((state) => ({
      widgets: state.widgets.map((widget) =>
        widget.id === widgetId ? { ...widget, zIndex: minZIndex - 1 } : widget
      ),
      hasUnsavedChanges: true,
    }));
    get().autoSave();
  },

  // ==================== INTERACTION STATE ====================
  setIsDragging: (isDragging, widgetId = null) => set({ isDragging, draggedWidget: widgetId }),
  setIsResizing: (isResizing) => set({ isResizing }),
  setIsPanning: (isPanning) => set({ isPanning }),

  // ==================== HISTORY ====================
  saveToHistory: () => {
    const state = get();
    const snapshot = { 
      widgets: JSON.parse(JSON.stringify(state.widgets)), 
      timestamp: Date.now() 
    };
    
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(snapshot);
    
    if (newHistory.length > state.maxHistory) {
      newHistory.shift();
    }
    
    set({ 
      history: newHistory, 
      historyIndex: newHistory.length - 1 
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
        hasUnsavedChanges: true,
      });
      
      get().autoSave();
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
        hasUnsavedChanges: true,
      });
      
      get().autoSave();
    }
  },

  // ==================== EXPORT/IMPORT ====================
  exportDashboard: () => {
    const state = get();
    return {
      version: '5.0.0',
      canvasSize: { width: 1366, height: 768 },
      timestamp: new Date().toISOString(),
      name: state.currentDashboardName || 'Untitled Dashboard',
      widgets: state.widgets,
      settings: { 
        showGrid: state.showGrid, 
        gridColumns: state.gridColumns, 
        maxRows: state.maxRows 
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
      hasUnsavedChanges: true,
    });
    
    get().saveToHistory();
    get().autoSave();
  },
}));

export default useDashboardStore;