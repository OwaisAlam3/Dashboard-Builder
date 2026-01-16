// src/components/Dashboard/GridCanvas.jsx - FULLY FIXED: Canvas sizing, widget placement & selection
import React, { useRef, useEffect, useState, useCallback } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import BaseWidget from '../Widgets/BaseWidget';
import GRID_CONFIG from '../../config/gridConfig';

// Fixed canvas dimensions - EXPORTED for use in other components
export const CANVAS_WIDTH = 1366;
export const CANVAS_HEIGHT = 768;

const GridCanvas = () => {
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  
  const {
    widgets,
    canvasZoom,
    setCanvasZoom,
    showGrid,
    gridColumns,
    deselectAll,
    selectMultiple,
    setIsPanning,
    updateGridColumns,
    setCurrentBreakpoint,
    propertyPanelOpen,
    maxRows,
    setMaxRows,
  } = useDashboardStore();

  const [isPanningLocal, setIsPanningLocal] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Initialize canvas dimensions and grid on mount
  useEffect(() => {
    const calculatedMaxRows = GRID_CONFIG.getMaxRows(CANVAS_HEIGHT);
    setMaxRows(calculatedMaxRows);

    let breakpoint = 'lg';
    let cols = GRID_CONFIG.breakpoints.lg?.columns || 24;

    Object.entries(GRID_CONFIG.breakpoints).forEach(([key, value]) => {
      if (CANVAS_WIDTH >= value.minWidth) {
        breakpoint = key;
        cols = value.columns;
      }
    });

    setCurrentBreakpoint(breakpoint);
    updateGridColumns(cols);
  }, [setCurrentBreakpoint, updateGridColumns, setMaxRows]);

  // Space key detection for panning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat && 
          document.activeElement.tagName !== 'INPUT' && 
          document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        if (isPanningLocal) {
          setIsPanningLocal(false);
          setIsPanning(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPanningLocal, setIsPanning]);

  // FIXED: Pan handling with better target detection
  const handleCanvasMouseDown = useCallback((e) => {
    // Check if click is on canvas background (not on widgets)
    const isCanvasClick = e.target === canvasRef.current || 
                          e.target === contentRef.current || 
                          e.target.classList.contains('grid-background') ||
                          e.target.classList.contains('canvas-boundary') ||
                          e.target.classList.contains('grid-container') ||
                          e.target.classList.contains('grid-lines');

    // Middle mouse button or Space + Left click for panning
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      setIsPanningLocal(true);
      setIsPanning(true);
      setPanStart({ 
        x: e.clientX, 
        y: e.clientY,
        scrollLeft: canvasRef.current.scrollLeft,
        scrollTop: canvasRef.current.scrollTop
      });
    } 
    // Left click on canvas background for selection box or deselect
    else if (e.button === 0 && isCanvasClick && !isSpacePressed) {
      // Deselect if property panel is open
      if (propertyPanelOpen) {
        deselectAll();
        return;
      }
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      const startX = (e.clientX - rect.left + scrollLeft) / canvasZoom;
      const startY = (e.clientY - rect.top + scrollTop) / canvasZoom;
      
      setSelectionBox({ startX, startY, endX: startX, endY: startY });
    }
  }, [isSpacePressed, propertyPanelOpen, canvasZoom, deselectAll, setIsPanning]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanningLocal && canvasRef.current) {
      const deltaX = e.clientX - panStart.x;
      const deltaY = e.clientY - panStart.y;
      canvasRef.current.scrollLeft = panStart.scrollLeft - deltaX;
      canvasRef.current.scrollTop = panStart.scrollTop - deltaY;
    } else if (selectionBox && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      const endX = (e.clientX - rect.left + scrollLeft) / canvasZoom;
      const endY = (e.clientY - rect.top + scrollTop) / canvasZoom;
      
      setSelectionBox(prev => ({ ...prev, endX, endY }));
    }
  }, [isPanningLocal, panStart, selectionBox, canvasZoom]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isPanningLocal) {
      setIsPanningLocal(false);
      setIsPanning(false);
    }
    
    if (selectionBox) {
      const { startX, startY, endX, endY } = selectionBox;
      
      const minMovement = 5;
      if (Math.abs(endX - startX) > minMovement || Math.abs(endY - startY) > minMovement) {
        const minX = Math.min(startX, endX);
        const maxX = Math.max(startX, endX);
        const minY = Math.min(startY, endY);
        const maxY = Math.max(startY, endY);

        const columnWidth = GRID_CONFIG.getPixelWidth(1, CANVAS_WIDTH, gridColumns);
        
        const minGridX = Math.floor(minX / (columnWidth + GRID_CONFIG.gap));
        const maxGridX = Math.ceil(maxX / (columnWidth + GRID_CONFIG.gap));
        const minGridY = Math.floor(minY / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap));
        const maxGridY = Math.ceil(maxY / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap));

        const selectedIds = widgets
          .filter((widget) => {
            const { x, y, w, h } = widget.gridArea;
            return (
              x < maxGridX &&
              x + w > minGridX &&
              y < maxGridY &&
              y + h > minGridY
            );
          })
          .map((w) => w.id);

        if (selectedIds.length > 0) {
          selectMultiple(selectedIds);
        }
      } else {
        deselectAll();
      }
      
      setSelectionBox(null);
    }
  }, [isPanningLocal, selectionBox, widgets, setIsPanning, selectMultiple, deselectAll, gridColumns]);

  useEffect(() => {
    if (isPanningLocal || selectionBox) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanningLocal, selectionBox, handleCanvasMouseMove, handleCanvasMouseUp]);

  // Improved zoom with proper event handling
  const handleWheel = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && canvasRef.current?.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.25, Math.min(3, canvasZoom + delta));
      
      if (newZoom === canvasZoom) return;
      
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      const zoomPointX = (scrollLeft + mouseX) / canvasZoom;
      const zoomPointY = (scrollTop + mouseY) / canvasZoom;
      
      setCanvasZoom(newZoom);
      
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          canvasRef.current.scrollLeft = zoomPointX * newZoom - mouseX;
          canvasRef.current.scrollTop = zoomPointY * newZoom - mouseY;
        }
      });
    }
  }, [canvasZoom, setCanvasZoom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const preventZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && canvas.contains(e.target)) {
        e.preventDefault();
      }
    };
    
    canvas.addEventListener('wheel', preventZoom, { passive: false });
    return () => canvas.removeEventListener('wheel', preventZoom);
  }, []);

  const columnWidth = GRID_CONFIG.getPixelWidth(1, CANVAS_WIDTH, gridColumns);

  const getCursorStyle = () => {
    if (isPanningLocal) return 'grabbing';
    if (isSpacePressed) return 'grab';
    return 'default';
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-auto relative bg-canvas"
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      style={{ cursor: getCursorStyle() }}
    >
      {/* FIXED: Canvas wrapper with proper centering and sizing */}
      <div 
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: CANVAS_WIDTH * canvasZoom + 128,
          height: CANVAS_HEIGHT * canvasZoom + 128,
          minWidth: CANVAS_WIDTH * canvasZoom + 128,
          minHeight: CANVAS_HEIGHT * canvasZoom + 128,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            ref={contentRef}
            className="origin-center relative canvas-boundary"
            style={{
              width: CANVAS_WIDTH,
              height: CANVAS_HEIGHT,
              transform: `scale(${canvasZoom})`,
              transformOrigin: 'center center',
              backgroundColor: '#434446',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* FIXED: Grid container with proper class for click detection */}
            <div className="relative w-full h-full grid-container" style={{
              padding: GRID_CONFIG.containerPadding,
            }}>
              {/* Grid Lines */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid-lines" style={{ 
                  padding: GRID_CONFIG.containerPadding 
                }}>
                  {/* Vertical lines */}
                  {Array.from({ length: gridColumns + 1 }).map((_, i) => (
                    <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l"
                      style={{
                        left: i * (columnWidth + GRID_CONFIG.gap),
                        borderColor: i % 4 === 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.08)',
                        borderWidth: '1px',
                      }}
                    />
                  ))}
                  {/* Horizontal lines */}
                  {Array.from({ length: maxRows + 1 }).map((_, i) => (
                    <div key={`h-${i}`} className="absolute left-0 right-0 border-t"
                      style={{
                        top: i * (GRID_CONFIG.rowHeight + GRID_CONFIG.gap),
                        borderColor: i % 3 === 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(148, 163, 184, 0.08)',
                        borderWidth: '1px',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Widgets */}
              {widgets
                .filter((w) => w.visible)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((widget) => (
                  <BaseWidget 
                    key={widget.id} 
                    widget={widget} 
                    containerWidth={CANVAS_WIDTH}
                    gridColumns={gridColumns}
                    canvasZoom={canvasZoom}
                  />
                ))}

              {/* Selection Box */}
              {selectionBox && (
                <div className="absolute border-2 border-accent-blue bg-accent-blue/10 pointer-events-none z-[9999] rounded"
                  style={{
                    left: Math.min(selectionBox.startX, selectionBox.endX),
                    top: Math.min(selectionBox.startY, selectionBox.endY),
                    width: Math.abs(selectionBox.endX - selectionBox.startX),
                    height: Math.abs(selectionBox.endY - selectionBox.startY),
                  }}
                />
              )}
            </div>

            {/* Canvas Info Overlay */}
            <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white/90 pointer-events-none">
              16:9 Canvas • {CANVAS_WIDTH} × {CANVAS_HEIGHT}px
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-fadeIn">
            <div className="text-6xl mb-4 opacity-20">✨</div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">Your canvas awaits</h3>
            <p className="text-sm text-white/50 mb-4">Add widgets from the sidebar to get started</p>
            <div className="text-xs text-white/40">
              Canvas: {CANVAS_WIDTH} × {CANVAS_HEIGHT}px ({gridColumns} columns × {maxRows} rows)
            </div>
          </div>
        </div>
      )}

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-2 bg-panel/95 backdrop-blur-sm rounded-lg border border-panel-border text-xs text-white/70 pointer-events-none z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-accent-blue rounded-full animate-pulse" />
          {Math.round(canvasZoom * 100)}%
        </div>
      </div>

      {/* Grid Info */}
      {showGrid && (
        <div className="absolute bottom-4 left-4 px-3 py-2 bg-panel/95 backdrop-blur-sm rounded-lg border border-panel-border text-xs text-white/70 pointer-events-none z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            {gridColumns} cols × {maxRows} rows
          </div>
        </div>
      )}
    </div>
  );
};

export default GridCanvas;