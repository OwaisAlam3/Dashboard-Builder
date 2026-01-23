// src/components/Dashboard/DashboardLayout.jsx
import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { 
  Menu, Save, Download, Upload, Trash2, Grid, ZoomIn, ZoomOut,
  Maximize2, Minimize2, Undo2, Redo2, Copy, Clipboard, Check, 
  Sparkles, AlertCircle, Clock, Home
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { usePersistentLayout } from '../../hooks/usePersistentLayout';
import WidgetSidebar from './WidgetSidebar';
import GridCanvas from './GridCanvas';
import PropertyPanel from './PropertyPanel';
import TemplateSelector from '../Templates/TemplateSelector';
import RecentDashboardsPopover from './RecentDashboardsPopover';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const {
    sidebarOpen, sidebarWidth, setSidebarWidth,
    propertyPanelOpen, propertyPanelWidth, setPropertyPanelWidth,
    toggleSidebar, showGrid, toggleGrid,
    canvasZoom, setCanvasZoom, resetCanvasView, fitCanvasToScreen,
    clearDashboard, saveToLocalStorage, exportDashboard, importDashboard,
    undo, redo, historyIndex, history,
    copySelectedWidgets, pasteWidgets, selectedWidgetIds,
    showTemplateSelector, setShowTemplateSelector,
    currentDashboardId, currentDashboardName,
  } = useDashboardStore();

  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingProperty, setIsResizingProperty] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [error, setError] = useState(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [showRecentDashboards, setShowRecentDashboards] = useState(false);
  
  const sidebarDividerRef = useRef(null);
  const propertyDividerRef = useRef(null);
  const saveTimeoutRef = useRef(null);
  const recentButtonRef = useRef(null);

  usePersistentLayout();

  // Track viewport size for fit-to-screen
  useEffect(() => {
    const updateViewportSize = () => {
      const canvasArea = document.querySelector('.canvas-viewport');
      if (canvasArea) {
        setViewportSize({
          width: canvasArea.clientWidth,
          height: canvasArea.clientHeight,
        });
      }
    };

    updateViewportSize();
    window.addEventListener('resize', updateViewportSize);
    return () => window.removeEventListener('resize', updateViewportSize);
  }, [sidebarOpen, propertyPanelOpen, sidebarWidth, propertyPanelWidth]);

  // Sidebar resize handler
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e) => {
      const newWidth = e.clientX;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.body.style.cursor = '';
      document.body.classList.remove('no-select');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.classList.add('no-select');

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, setSidebarWidth]);

  // Property panel resize handler
  useEffect(() => {
    if (!isResizingProperty) return;

    const handleMouseMove = (e) => {
      const newWidth = window.innerWidth - e.clientX;
      setPropertyPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingProperty(false);
      document.body.style.cursor = '';
      document.body.classList.remove('no-select');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.classList.add('no-select');

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingProperty, setPropertyPanelWidth]);

  // Keyboard shortcuts with proper preventDefault
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault();
        redo();
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedWidgetIds.length > 0 && !isTyping) {
        e.preventDefault();
        copySelectedWidgets();
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && !isTyping) {
        e.preventDefault();
        pasteWidgets();
        return;
      }
      
      if (e.key === 'Delete' && selectedWidgetIds.length > 0 && !isTyping) {
        e.preventDefault();
        useDashboardStore.getState().deleteSelectedWidgets();
        return;
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        toggleGrid();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copySelectedWidgets, pasteWidgets, selectedWidgetIds, toggleGrid]);

  const handleSave = () => {
    try {
      saveToLocalStorage();
      
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      setSaveIndicator(true);
      saveTimeoutRef.current = setTimeout(() => {
        setSaveIndicator(false);
      }, 2000);
    } catch (error) {
      console.error('Save error:', error);
      setError('Failed to save dashboard');
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleExport = () => {
    try {
      const data = exportDashboard();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      setError('Failed to export dashboard');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            
            if (!data.widgets || !Array.isArray(data.widgets)) {
              throw new Error('Invalid dashboard format: missing widgets array');
            }
            
            if (!data.version) {
              throw new Error('Invalid dashboard format: missing version');
            }
            
            importDashboard(data);
            setError(null);
          } catch (error) {
            console.error('Import error:', error);
            setError(`Import failed: ${error.message}`);
            setTimeout(() => setError(null), 5000);
          }
        };
        reader.onerror = () => {
          setError('Failed to read file');
          setTimeout(() => setError(null), 3000);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(3, canvasZoom + 0.25);
    setCanvasZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.25, canvasZoom - 0.25);
    setCanvasZoom(newZoom);
  };

  const handleFitToScreen = () => {
    if (viewportSize.width > 0 && viewportSize.height > 0) {
      fitCanvasToScreen(viewportSize.width, viewportSize.height);
    }
  };

  const handleNewDashboard = () => {
    if (confirm('Create new dashboard? Current work will be saved.')) {
      handleSave();
      setShowTemplateSelector(true);
    }
  };

  const handleGoHome = () => {
    if (confirm('Return to dashboard home? Current work will be saved.')) {
      handleSave();
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-canvas text-white overflow-hidden">
      {showTemplateSelector && <TemplateSelector />}

      {/* Recent Dashboards Popover */}
      {showRecentDashboards && (
        <RecentDashboardsPopover
          anchorRef={recentButtonRef}
          onClose={() => setShowRecentDashboards(false)}
        />
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-[9999] bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slideIn">
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <header className="h-12 bg-panel border-b border-panel-border flex items-center justify-between px-3 no-print z-50">
        <div className="flex items-center gap-2">
          <button onClick={handleGoHome}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Dashboard Home">
            <Home size={18} />
          </button>
          
          <button onClick={toggleSidebar}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Toggle Sidebar">
            <Menu size={18} />
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          {/* Current Dashboard Name */}
          <div className="px-3 py-1 bg-panel-light rounded text-sm font-medium text-white/80">
            {currentDashboardName || 'Untitled Dashboard'}
          </div>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button
            ref={recentButtonRef}
            onClick={() => setShowRecentDashboards(!showRecentDashboards)}
            className="px-3 py-1.5 hover:bg-panel-light rounded transition-colors flex items-center gap-2"
            title="Recent Dashboards">
            <Clock size={16} />
            <span className="text-sm hidden sm:inline">Recent</span>
          </button>
          
          <button onClick={handleNewDashboard}
            className="px-3 py-1.5 hover:bg-panel-light rounded transition-colors flex items-center gap-2" title="New Dashboard">
            <Sparkles size={16} />
            <span className="text-sm hidden sm:inline">New</span>
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button onClick={undo} disabled={historyIndex <= 0}
            className="p-1.5 hover:bg-panel-light rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Cmd+Z)">
            <Undo2 size={18} />
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1}
            className="p-1.5 hover:bg-panel-light rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Cmd+Y)">
            <Redo2 size={18} />
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button onClick={copySelectedWidgets} disabled={selectedWidgetIds.length === 0}
            className="p-1.5 hover:bg-panel-light rounded transition-colors disabled:opacity-30" title="Copy (Cmd+C)">
            <Copy size={18} />
          </button>
          <button onClick={pasteWidgets}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Paste (Cmd+V)">
            <Clipboard size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleGrid}
            className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-accent-blue text-white' : 'hover:bg-panel-light'}`}
            title="Toggle Grid (Cmd+G)">
            <Grid size={18} />
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button onClick={handleZoomOut}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <span className="text-xs text-text-secondary w-12 text-center">
            {Math.round(canvasZoom * 100)}%
          </span>
          <button onClick={handleZoomIn}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={handleFitToScreen}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Fit to Screen">
            <Minimize2 size={18} />
          </button>
          <button onClick={resetCanvasView}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Reset to 100%">
            <Maximize2 size={18} />
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button onClick={handleSave}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 ${
              saveIndicator ? 'bg-green-600 text-white' : 'hover:bg-panel-light'
            }`} title="Save (Cmd+S)">
            {saveIndicator ? (
              <><Check size={16} /><span className="text-sm hidden sm:inline">Saved!</span></>
            ) : (
              <><Save size={16} /><span className="text-sm hidden sm:inline">Save</span></>
            )}
          </button>
          <button onClick={handleExport}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Export JSON">
            <Download size={18} />
          </button>
          <button onClick={handleImport}
            className="p-1.5 hover:bg-panel-light rounded transition-colors" title="Import JSON">
            <Upload size={18} />
          </button>
          <button onClick={() => {
            if (confirm('Clear entire dashboard? This cannot be undone.')) clearDashboard();
          }}
            className="p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-colors" title="Clear All">
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {sidebarOpen && (
          <>
            <div style={{ width: sidebarWidth }} className="relative">
              <WidgetSidebar />
            </div>
            <div ref={sidebarDividerRef} className="panel-divider"
              onMouseDown={() => setIsResizingSidebar(true)} />
          </>
        )}

        <div className="flex-1 relative overflow-hidden canvas-viewport">
          <GridCanvas />
        </div>

        {propertyPanelOpen && (
          <>
            <div ref={propertyDividerRef} className="panel-divider"
              onMouseDown={() => setIsResizingProperty(true)} />
            <div style={{ width: propertyPanelWidth }} className="relative">
              <PropertyPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;