// src/components/Dashboard/GridCanvas.jsx - COMPLETE REWRITE
import React, { useRef, useEffect, useState, useCallback } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import BaseWidget from '../Widgets/BaseWidget';
import GRID_CONFIG from '../../config/gridConfig';

const GridCanvas = () => {
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  const {
    widgets,
    canvasZoom,
    setCanvasZoom,
    canvasPan,
    setCanvasPan,
    showGrid,
    gridColumns,
    deselectAll,
    selectMultiple,
    isPanning,
    setIsPanning,
    updateGridColumns,
    setCurrentBreakpoint,
  } = useDashboardStore();

  const [isPanningLocal, setIsPanningLocal] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Update container dimensions and responsive breakpoints
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const width = canvasRef.current.offsetWidth;
        const height = canvasRef.current.offsetHeight;
        setContainerWidth(width);
        setContainerHeight(height);

        // Determine breakpoint
        let breakpoint = 'xs';
        let cols = GRID_CONFIG.breakpoints.xs.columns;

        Object.entries(GRID_CONFIG.breakpoints).forEach(([key, value]) => {
          if (width >= value.minWidth) {
            breakpoint = key;
            cols = value.columns;
          }
        });

        setCurrentBreakpoint(breakpoint);
        updateGridColumns(cols);
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (canvasRef.current) {
      resizeObserver.observe(canvasRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [setCurrentBreakpoint, updateGridColumns]);

  // Space key detection for panning
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
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

  // Pan handling
  const handleCanvasMouseDown = (e) => {
    const isCanvasClick = e.target === canvasRef.current || e.target === contentRef.current;

    // Middle mouse button or Space + Left click for panning
    if (e.button === 1 || (e.button === 0 && isSpacePressed)) {
      e.preventDefault();
      setIsPanningLocal(true);
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
    } 
    // Left click on canvas background for selection box
    else if (e.button === 0 && isCanvasClick && !isSpacePressed) {
      deselectAll();
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      const startX = (e.clientX - rect.left + scrollLeft) / canvasZoom;
      const startY = (e.clientY - rect.top + scrollTop) / canvasZoom;
      
      setSelectionBox({ startX, startY, endX: startX, endY: startY });
    }
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanningLocal) {
      const newPanX = e.clientX - panStart.x;
      const newPanY = e.clientY - panStart.y;
      
      // Smooth panning by directly scrolling the container
      if (canvasRef.current) {
        canvasRef.current.scrollLeft = -newPanX;
        canvasRef.current.scrollTop = -newPanY;
      }
      
      setCanvasPan({ x: newPanX, y: newPanY });
    } else if (selectionBox) {
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      const endX = (e.clientX - rect.left + scrollLeft) / canvasZoom;
      const endY = (e.clientY - rect.top + scrollTop) / canvasZoom;
      
      setSelectionBox({ ...selectionBox, endX, endY });
    }
  }, [isPanningLocal, panStart, selectionBox, canvasZoom, setCanvasPan]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isPanningLocal) {
      setIsPanningLocal(false);
      setIsPanning(false);
    }
    
    if (selectionBox && containerWidth > 0) {
      const { startX, startY, endX, endY } = selectionBox;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      const columnWidth = GRID_CONFIG.getPixelWidth(1, containerWidth / canvasZoom, gridColumns);
      
      // Convert to grid coordinates
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
      
      setSelectionBox(null);
    }
  }, [isPanningLocal, selectionBox, widgets, setIsPanning, selectMultiple, containerWidth, gridColumns, canvasZoom]);

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

  // Improved zoom with mouse wheel - zoom towards cursor position
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.25, Math.min(3, canvasZoom + delta));
      
      // Calculate new scroll position to zoom towards cursor
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      const zoomPointX = (scrollLeft + mouseX) / canvasZoom;
      const zoomPointY = (scrollTop + mouseY) / canvasZoom;
      
      setCanvasZoom(newZoom);
      
      // Adjust scroll to maintain zoom point
      requestAnimationFrame(() => {
        if (canvasRef.current) {
          canvasRef.current.scrollLeft = zoomPointX * newZoom - mouseX;
          canvasRef.current.scrollTop = zoomPointY * newZoom - mouseY;
        }
      });
    }
  }, [canvasZoom, setCanvasZoom]);

  // Prevent default browser zoom
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('wheel', preventZoom, { passive: false });
    return () => document.removeEventListener('wheel', preventZoom);
  }, []);

  // Calculate grid dimensions
  const scaledContainerWidth = containerWidth / canvasZoom;
  const columnWidth = scaledContainerWidth > 0 
    ? GRID_CONFIG.getPixelWidth(1, scaledContainerWidth, gridColumns) 
    : 100;
  
  const maxRow = Math.max(...widgets.map(w => w.gridArea.y + w.gridArea.h), 8);
  const contentWidth = Math.max(
    scaledContainerWidth,
    gridColumns * (columnWidth + GRID_CONFIG.gap) + GRID_CONFIG.containerPadding * 2
  );
  const contentHeight = Math.max(
    containerHeight / canvasZoom,
    GRID_CONFIG.getPixelHeight(maxRow) + GRID_CONFIG.containerPadding * 2
  );

  // Cursor style
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
      style={{
        cursor: getCursorStyle(),
      }}
    >
      {/* Zoomed Content Container */}
      <div
        ref={contentRef}
        className="origin-top-left"
        style={{
          width: contentWidth * canvasZoom,
          height: contentHeight * canvasZoom,
          minWidth: '100%',
          minHeight: '100%',
          transform: `scale(${canvasZoom})`,
          transformOrigin: '0 0',
        }}
      >
        <div
          className="relative"
          style={{
            width: contentWidth,
            height: contentHeight,
            padding: GRID_CONFIG.containerPadding,
          }}
        >
          {/* Grid Background */}
          {showGrid && scaledContainerWidth > 0 && (
            <div className="absolute inset-0 pointer-events-none" style={{ padding: GRID_CONFIG.containerPadding }}>
              {/* Vertical grid lines */}
              {Array.from({ length: gridColumns + 1 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0 border-l"
                  style={{
                    left: i * (columnWidth + GRID_CONFIG.gap),
                    borderColor: i % 3 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  }}
                />
              ))}
              
              {/* Horizontal grid lines */}
              {Array.from({ length: maxRow + 1 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute left-0 right-0 border-t"
                  style={{
                    top: i * (GRID_CONFIG.rowHeight + GRID_CONFIG.gap),
                    borderColor: i % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                  }}
                />
              ))}
            </div>
          )}

          {/* Widgets */}
          {scaledContainerWidth > 0 && widgets
            .filter((w) => w.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((widget) => (
              <BaseWidget 
                key={widget.id} 
                widget={widget} 
                containerWidth={scaledContainerWidth}
                gridColumns={gridColumns}
                canvasZoom={canvasZoom}
              />
            ))}

          {/* Selection Box */}
          {selectionBox && (
            <div
              className="absolute border-2 border-accent-blue bg-accent-blue/10 pointer-events-none z-[9999] rounded"
              style={{
                left: Math.min(selectionBox.startX, selectionBox.endX),
                top: Math.min(selectionBox.startY, selectionBox.endY),
                width: Math.abs(selectionBox.endX - selectionBox.startX),
                height: Math.abs(selectionBox.endY - selectionBox.startY),
              }}
            />
          )}
        </div>
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: `scale(${canvasZoom})`, transformOrigin: 'center' }}
        >
          <div className="text-center animate-fadeIn">
            <div className="text-6xl mb-4 opacity-20">✨</div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              Your canvas awaits
            </h3>
            <p className="text-sm text-white/50">
              Add widgets from the sidebar to get started
            </p>
            <p className="text-xs text-white/30 mt-4">
              Hold <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd> to pan • 
              <kbd className="px-2 py-1 bg-white/10 rounded ml-2">Ctrl + Scroll</kbd> to zoom
            </p>
          </div>
        </div>
      )}

      {/* Zoom Indicator */}
      <div className="absolute bottom-4 right-4 px-3 py-2 bg-panel/90 backdrop-blur-sm rounded-lg border border-panel-border text-xs text-white/70 pointer-events-none z-50">
        {Math.round(canvasZoom * 100)}%
      </div>

      {/* Grid Info */}
      {showGrid && (
        <div className="absolute bottom-4 left-4 px-3 py-2 bg-panel/90 backdrop-blur-sm rounded-lg border border-panel-border text-xs text-white/70 pointer-events-none z-50">
          {gridColumns} columns • {GRID_CONFIG.rowHeight}px rows
        </div>
      )}
    </div>
  );
};

export default GridCanvas;