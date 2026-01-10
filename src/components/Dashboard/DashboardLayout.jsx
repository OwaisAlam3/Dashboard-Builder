import React, { useEffect, useState, useRef } from 'react';
import { 
  Menu, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Grid, 
  ZoomIn, 
  ZoomOut,
  Maximize2,
  Undo2,
  Redo2,
  Copy,
  Clipboard,
  Check
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { usePersistentLayout } from '../../hooks/usePersistentLayout';
import WidgetSidebar from './WidgetSidebar';
import GridCanvas from './GridCanvas';
import PropertyPanel from './PropertyPanel';

const DashboardLayout = () => {
  const {
    sidebarOpen,
    sidebarWidth,
    setSidebarWidth,
    propertyPanelOpen,
    propertyPanelWidth,
    setPropertyPanelWidth,
    toggleSidebar,
    showGrid,
    toggleGrid,
    snapToGrid,
    toggleSnapToGrid,
    canvasZoom,
    setCanvasZoom,
    resetCanvasView,
    clearDashboard,
    saveToLocalStorage,
    exportDashboard,
    importDashboard,
    undo,
    redo,
    historyIndex,
    history,
    copySelectedWidgets,
    pasteWidgets,
    selectedWidgetIds,
  } = useDashboardStore();

  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingProperty, setIsResizingProperty] = useState(false);
  const [saveIndicator, setSaveIndicator] = useState(false);
  const sidebarDividerRef = useRef(null);
  const propertyDividerRef = useRef(null);

  usePersistentLayout();

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

  // Keyboard shortcuts (FIXED - prevents delete when typing)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in input/textarea
      const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      
      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Cmd/Ctrl + Z = Undo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Y = Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Cmd/Ctrl + C = Copy
      if ((e.metaKey || e.ctrlKey) && e.key === 'c' && selectedWidgetIds.length > 0 && !isTyping) {
        e.preventDefault();
        copySelectedWidgets();
      }
      // Cmd/Ctrl + V = Paste
      if ((e.metaKey || e.ctrlKey) && e.key === 'v' && !isTyping) {
        e.preventDefault();
        pasteWidgets();
      }
      // Delete (FIXED - only when not typing)
      if ((e.key === 'Delete') && selectedWidgetIds.length > 0 && !isTyping) {
        e.preventDefault();
        useDashboardStore.getState().deleteSelectedWidgets();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, copySelectedWidgets, pasteWidgets, selectedWidgetIds]);

  // Save with indicator
  const handleSave = () => {
    saveToLocalStorage();
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  // Export to PDF
  const handleExportPDF = async () => {
    try {
      // Get canvas element
      const canvas = document.querySelector('.gpu-accelerated');
      if (!canvas) return;

      // Use html2canvas-like approach (you'll need to install html2canvas)
      // For now, let's create a simple download
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const canvasElement = await html2canvas(canvas, {
        backgroundColor: '#18191B',
        scale: 2,
      });
      
      const imgData = canvasElement.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvasElement.width, canvasElement.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvasElement.width, canvasElement.height);
      pdf.save(`dashboard-${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF export error:', error);
      alert('Please install jspdf and html2canvas: npm install jspdf html2canvas');
    }
  };

  const handleExport = () => {
    const data = exportDashboard();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
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
            importDashboard(data);
          } catch (error) {
            alert('Invalid dashboard file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleZoomIn = () => setCanvasZoom(canvasZoom + 0.1);
  const handleZoomOut = () => setCanvasZoom(canvasZoom - 0.1);

  return (
    <div className="flex flex-col h-screen bg-canvas text-white overflow-hidden">
      {/* Top Toolbar */}
      <header className="h-12 bg-panel border-b border-panel-border flex items-center justify-between px-3 no-print z-50">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSidebar}
            className="p-1.5 hover:bg-panel-light rounded transition-colors"
            title="Toggle Sidebar (Cmd+\)"
          >
            <Menu size={18} />
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button
            onClick={undo}
            disabled={historyIndex <= 0}
            className="p-1.5 hover:bg-panel-light rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Cmd+Z)"
          >
            <Undo2 size={18} />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 hover:bg-panel-light rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Cmd+Shift+Z)"
          >
            <Redo2 size={18} />
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button
            onClick={copySelectedWidgets}
            disabled={selectedWidgetIds.length === 0}
            className="p-1.5 hover:bg-panel-light rounded transition-colors disabled:opacity-30"
            title="Copy (Cmd+C)"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={pasteWidgets}
            className="p-1.5 hover:bg-panel-light rounded transition-colors"
            title="Paste (Cmd+V)"
          >
            <Clipboard size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleGrid}
            className={`p-1.5 rounded transition-colors ${
              showGrid ? 'bg-accent-blue text-white' : 'hover:bg-panel-light'
            }`}
            title="Toggle Grid"
          >
            <Grid size={18} />
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-panel-light rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
          <span className="text-xs text-text-secondary w-12 text-center">
            {Math.round(canvasZoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-panel-light rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={resetCanvasView}
            className="p-1.5 hover:bg-panel-light rounded transition-colors"
            title="Reset View"
          >
            <Maximize2 size={18} />
          </button>
          
          <div className="w-px h-6 bg-panel-border mx-1" />
          
          <button
            onClick={handleSave}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-2 ${
              saveIndicator 
                ? 'bg-green-600 text-white' 
                : 'hover:bg-panel-light'
            }`}
            title="Save (Cmd+S)"
          >
            {saveIndicator ? (
              <>
                <Check size={16} />
                <span className="text-sm">Saved!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="text-sm">Save</span>
              </>
            )}
          </button>
          <button
            onClick={handleExportPDF}
            className="p-1.5 hover:bg-panel-light rounded transition-colors"
            title="Export to PDF"
          >
            <Download size={18} />
          </button>
          <button
            onClick={handleImport}
            className="p-1.5 hover:bg-panel-light rounded transition-colors"
            title="Import JSON"
          >
            <Upload size={18} />
          </button>
          <button
            onClick={() => {
              if (confirm('Clear entire dashboard?')) clearDashboard();
            }}
            className="p-1.5 hover:bg-red-600/20 text-red-400 rounded transition-colors"
            title="Clear All"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        {sidebarOpen && (
          <>
            <div style={{ width: sidebarWidth }} className="relative">
              <WidgetSidebar />
            </div>
            <div
              ref={sidebarDividerRef}
              className="panel-divider"
              onMouseDown={() => setIsResizingSidebar(true)}
            />
          </>
        )}

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <GridCanvas />
        </div>

        {/* Property Panel */}
        {propertyPanelOpen && (
          <>
            <div
              ref={propertyDividerRef}
              className="panel-divider"
              onMouseDown={() => setIsResizingProperty(true)}
            />
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