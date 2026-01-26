// src/components/Dashboard/DashboardLayout.jsx - FINAL IMPROVED: All fixes, better UX, confirmations
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Menu, Maximize2, ZoomIn, ZoomOut, Grid as GridIcon, Save, Home, Undo2, Redo2,
  Trash2, Clock, Settings, Check, Loader2, ChevronDown, Edit2, X, Download,
  Upload, Copy, Clipboard, Sparkles, AlertCircle, MinusSquare, RefreshCw
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import GridCanvas from './GridCanvas';
import WidgetSidebar from './WidgetSidebar';
import PropertyPanel from './PropertyPanel';
import TemplateSelector from '../Templates/TemplateSelector';
import RecentDashboardsPopover from './RecentDashboardsPopover';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const recentButtonRef = useRef(null);
  const nameInputRef = useRef(null);
  const sidebarDividerRef = useRef(null);
  const propertyDividerRef = useRef(null);
  
  const {
    sidebarOpen, sidebarWidth, setSidebarWidth,
    propertyPanelOpen, propertyPanelWidth, setPropertyPanelWidth,
    toggleSidebar, togglePropertyPanel,
    canvasZoom, setCanvasZoom, resetCanvasView, fitCanvasToScreen,
    showGrid, toggleGrid,
    showTemplateSelector, setShowTemplateSelector,
    currentDashboardName, updateDashboardName,
    saveDashboard, exportDashboard, importDashboard,
    isSaving, lastSaved, hasUnsavedChanges,
    history, historyIndex, undo, redo,
    clearDashboard, copySelectedWidgets, pasteWidgets, deleteSelectedWidgets,
    widgets, selectedWidgetIds, deselectAll,
  } = useDashboardStore();

  const [showRecentPopover, setShowRecentPopover] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(currentDashboardName || '');
  const [saveStatus, setSaveStatus] = useState('saved');
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingProperty, setIsResizingProperty] = useState(false);
  const [notification, setNotification] = useState(null);

  // Update edited name when dashboard changes
  useEffect(() => {
    setEditedName(currentDashboardName || 'Untitled Dashboard');
  }, [currentDashboardName]);

  // Handle save status animation
  useEffect(() => {
    if (isSaving) {
      setSaveStatus('saving');
    } else if (lastSaved) {
      setSaveStatus('changes-saved');
      const timer = setTimeout(() => setSaveStatus('saved'), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // Sidebar resize handler
  useEffect(() => {
    if (!isResizingSidebar) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(200, Math.min(e.clientX, 500));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar, setSidebarWidth]);

  // Property panel resize handler
  useEffect(() => {
    if (!isResizingProperty) return;

    const handleMouseMove = (e) => {
      const newWidth = Math.max(240, Math.min(window.innerWidth - e.clientX, 600));
      setPropertyPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizingProperty(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingProperty, setPropertyPanelWidth]);

  // Keyboard shortcuts with better conflict handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      const isMod = e.metaKey || e.ctrlKey;
      
      // Save: Cmd/Ctrl + S
      if (isMod && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }
      
      // Undo: Cmd/Ctrl + Z (without shift)
      if (isMod && e.key === 'z' && !e.shiftKey && !isTyping) {
        e.preventDefault();
        handleUndo();
        return;
      }
      
      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if ((isMod && e.shiftKey && e.key === 'z') || (isMod && e.key === 'y' && !isTyping)) {
        e.preventDefault();
        handleRedo();
        return;
      }
      
      // Copy: Cmd/Ctrl + C
      if (isMod && e.key === 'c' && selectedWidgetIds.length > 0 && !isTyping) {
        e.preventDefault();
        copySelectedWidgets();
        showNotification(`Copied ${selectedWidgetIds.length} widget${selectedWidgetIds.length > 1 ? 's' : ''}`);
        return;
      }
      
      // Paste: Cmd/Ctrl + V
      if (isMod && e.key === 'v' && !isTyping) {
        e.preventDefault();
        pasteWidgets();
        return;
      }
      
      // Delete: Delete or Backspace (when not typing)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedWidgetIds.length > 0 && !isTyping) {
        e.preventDefault();
        handleDeleteSelected();
        return;
      }
      
      // Toggle Grid: Cmd/Ctrl + G
      if (isMod && e.key === 'g') {
        e.preventDefault();
        toggleGrid();
        showNotification(`Grid ${!showGrid ? 'enabled' : 'disabled'}`, 'info');
        return;
      }

      // Deselect All: Escape
      if (e.key === 'Escape' && selectedWidgetIds.length > 0 && !isTyping) {
        e.preventDefault();
        deselectAll();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWidgetIds, showGrid]);

  // Deselect widgets when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        e.target.closest('.property-panel') ||
        e.target.closest('.widget-toolbar') ||
        e.target.closest('.floating-toolbar') ||
        e.target.closest('button')
      ) {
        return;
      }
      
      if (
        selectedWidgetIds.length > 0 &&
        (e.target.classList.contains('grid-container') ||
         e.target.classList.contains('canvas-boundary') ||
         e.target.classList.contains('grid-lines'))
      ) {
        deselectAll();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedWidgetIds, deselectAll]);

  const handleZoomIn = () => setCanvasZoom(Math.min(canvasZoom + 0.1, 3));
  const handleZoomOut = () => setCanvasZoom(Math.max(canvasZoom - 0.1, 0.25));

  const handleFitToScreen = () => {
    const viewportWidth = window.innerWidth - (sidebarOpen ? sidebarWidth : 0) - (propertyPanelOpen ? propertyPanelWidth : 0);
    const viewportHeight = window.innerHeight - 64;
    fitCanvasToScreen(viewportWidth, viewportHeight);
  };

  const handleSave = async () => {
    try {
      await saveDashboard();
      showNotification('Dashboard saved successfully');
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      showNotification('Failed to save dashboard', 'error');
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      undo();
      showNotification('Undo', 'info');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      redo();
      showNotification('Redo', 'info');
    }
  };

  const handleClearAll = () => {
    if (widgets.length === 0) return;
    
    if (window.confirm(`Clear all ${widgets.length} widgets from this dashboard?\n\nThis action cannot be undone.`)) {
      clearDashboard();
      showNotification('Dashboard cleared');
    }
  };

  const handleDeleteSelected = () => {
    if (selectedWidgetIds.length === 0) return;
    
    if (window.confirm(`Delete ${selectedWidgetIds.length} selected widget${selectedWidgetIds.length > 1 ? 's' : ''}?\n\nThis action cannot be undone.`)) {
      deleteSelectedWidgets();
      showNotification(`Deleted ${selectedWidgetIds.length} widget${selectedWidgetIds.length > 1 ? 's' : ''}`);
    }
  };

  const handleStartEditName = () => {
    setIsEditingName(true);
    setEditedName(currentDashboardName || 'Untitled Dashboard');
  };

  const handleSaveName = async () => {
    const trimmedName = editedName.trim();
    
    if (!trimmedName) {
      showNotification('Dashboard name cannot be empty', 'error');
      return;
    }
    
    if (trimmedName !== currentDashboardName) {
      try {
        await updateDashboardName(trimmedName);
        showNotification('Dashboard renamed');
      } catch (error) {
        console.error('Failed to update dashboard name:', error);
        showNotification('Failed to rename dashboard', 'error');
      }
    }
    setIsEditingName(false);
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName(currentDashboardName || 'Untitled Dashboard');
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEditName();
    }
  };

  const handleExport = () => {
    try {
      const data = exportDashboard();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentDashboardName || 'dashboard'}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Dashboard exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Failed to export dashboard', 'error');
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
            
            if (hasUnsavedChanges) {
              if (!window.confirm('Import dashboard? Current unsaved changes will be lost.')) {
                return;
              }
            }
            
            importDashboard(data);
            showNotification('Dashboard imported successfully');
          } catch (error) {
            console.error('Import error:', error);
            showNotification(`Import failed: ${error.message}`, 'error');
          }
        };
        reader.onerror = () => {
          showNotification('Failed to read file', 'error');
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleNewDashboard = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('Create new dashboard?\n\nCurrent changes will be saved first.')) {
        saveDashboard().then(() => {
          setShowTemplateSelector(true);
        });
      }
    } else {
      setShowTemplateSelector(true);
    }
  };

  const handleGoHome = async () => {
    if (hasUnsavedChanges) {
      const result = window.confirm('Return to dashboard home?\n\nYou have unsaved changes. Save before leaving?');
      
      if (result) {
        try {
          await saveDashboard();
          navigate('/');
        } catch (error) {
          showNotification('Failed to save', 'error');
        }
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="h-screen bg-canvas flex flex-col overflow-hidden">
      {/* Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[9999] px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-slideIn ${
          notification.type === 'error' 
            ? 'bg-red-500/95 backdrop-blur-sm text-white' 
            : notification.type === 'info'
            ? 'bg-blue-500/95 backdrop-blur-sm text-white'
            : 'bg-green-500/95 backdrop-blur-sm text-white'
        }`}>
          {notification.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <Check size={18} />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="h-14 bg-panel border-b border-panel-border flex items-center justify-between px-4 z-20 flex-shrink-0">
        {/* Left: Name & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleGoHome}
            className="p-1.5 hover:bg-panel-light rounded transition-colors"
            title="Home"
          >
            <Home size={18} className="text-white/70 hover:text-white" />
          </button>

          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-panel-light rounded transition-colors lg:hidden"
            title="Widgets"
          >
            <Menu size={18} className="text-white/70 hover:text-white" />
          </button>

          <div className="w-px h-4 bg-panel-border" />

          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleSaveName}
                className="px-2 py-1 bg-canvas border border-accent-blue rounded text-white text-sm font-medium focus:outline-none w-48"
                maxLength={100}
              />
              <button onClick={handleSaveName} className="p-1 text-green-400 hover:bg-green-500/10 rounded" title="Save">
                <Check size={14} />
              </button>
              <button onClick={handleCancelEditName} className="p-1 text-red-400 hover:bg-red-500/10 rounded" title="Cancel">
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEditName}
              className="flex items-center gap-2 px-2 py-1 hover:bg-panel-light rounded transition-colors group"
            >
              <span className="text-sm font-medium text-white max-w-[200px] truncate">
                {currentDashboardName || 'Untitled'}
              </span>
              <Edit2 size={12} className="text-white/40 group-hover:text-white/60" />
            </button>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 size={12} className="animate-spin text-white/40" />
                <span className="text-white/40">Saving...</span>
              </>
            ) : saveStatus === 'changes-saved' ? (
              <>
                <Check size={12} className="text-green-400" />
                <span className="text-green-400">Saved</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                <span className="text-yellow-400">Unsaved</span>
              </>
            ) : (
              <>
                <Check size={12} className="text-white/30" />
                <span className="text-white/30">Saved</span>
              </>
            )}
          </div>
        </div>

        {/* Center: Zoom & Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 px-2 py-1 bg-panel-light rounded">
            <button onClick={handleZoomOut} className="p-1 hover:bg-panel-lighter rounded" title="Zoom Out">
              <ZoomOut size={14} className="text-white/70" />
            </button>
            <span className="text-xs text-white/70 min-w-[40px] text-center font-medium">
              {Math.round(canvasZoom * 100)}%
            </span>
            <button onClick={handleZoomIn} className="p-1 hover:bg-panel-lighter rounded" title="Zoom In">
              <ZoomIn size={14} className="text-white/70" />
            </button>
          </div>

          <button onClick={handleFitToScreen} className="p-1.5 hover:bg-panel-light rounded" title="Fit">
            <Maximize2 size={16} className="text-white/70" />
          </button>

          <button
            onClick={toggleGrid}
            className={`p-1.5 rounded transition-colors ${showGrid ? 'bg-accent-blue/20 text-accent-blue' : 'hover:bg-panel-light text-white/70'}`}
            title="Grid"
          >
            <GridIcon size={16} />
          </button>

          <div className="w-px h-4 bg-panel-border mx-1" />

          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 hover:bg-panel-light rounded disabled:opacity-30"
            title="Undo"
          >
            <Undo2 size={16} className="text-white/70" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 hover:bg-panel-light rounded disabled:opacity-30"
            title="Redo"
          >
            <Redo2 size={16} className="text-white/70" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <button
              ref={recentButtonRef}
              onClick={() => setShowRecentPopover(!showRecentPopover)}
              className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-panel-light rounded text-xs"
            >
              <Clock size={14} className="text-white/70" />
              <span className="text-white/70 hidden sm:inline">Recent</span>
            </button>
            {showRecentPopover && (
              <RecentDashboardsPopover anchorRef={recentButtonRef} onClose={() => setShowRecentPopover(false)} />
            )}
          </div>

          <button
            onClick={handleNewDashboard}
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-panel-light rounded text-xs"
            title="New"
          >
            <Sparkles size={14} className="text-white/70" />
            <span className="text-white/70 hidden sm:inline">New</span>
          </button>

          <div className="w-px h-4 bg-panel-border" />

          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue/90 rounded disabled:opacity-50 text-xs font-medium"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            <span>Save</span>
          </button>

          <button
            onClick={togglePropertyPanel}
            className={`p-1.5 rounded ${propertyPanelOpen ? 'bg-accent-blue/20 text-accent-blue' : 'hover:bg-panel-light text-white/70'}`}
            title="Properties"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            <div
              className="flex-shrink-0 h-full relative"
              style={{ width: sidebarWidth }}
            >
              <WidgetSidebar />
            </div>
            {/* Sidebar Resizer */}
            <div
              ref={sidebarDividerRef}
              onMouseDown={() => setIsResizingSidebar(true)}
              className="w-1 h-full bg-panel-border hover:bg-accent-blue transition-colors cursor-ew-resize flex-shrink-0 relative group"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-accent-blue/20" />
            </div>
          </>
        )}

        {/* Canvas */}
        <div className="flex-1 h-full overflow-hidden relative">
          <GridCanvas />
        </div>

        {/* Property Panel */}
        {propertyPanelOpen && (
          <>
            {/* Property Panel Resizer */}
            <div
              ref={propertyDividerRef}
              onMouseDown={() => setIsResizingProperty(true)}
              className="w-1 h-full bg-panel-border hover:bg-accent-blue transition-colors cursor-ew-resize flex-shrink-0 relative group"
            >
              <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-accent-blue/20" />
            </div>
            <div
              className="flex-shrink-0 h-full property-panel relative"
              style={{ width: propertyPanelWidth }}
            >
              <PropertyPanel />
            </div>
          </>
        )}
      </div>

      {/* Template Selector Modal */}
      {showTemplateSelector && <TemplateSelector />}
    </div>
  );
};

export default DashboardLayout;