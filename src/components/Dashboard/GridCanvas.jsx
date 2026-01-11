// src/components/Dashboard/GridCanvas.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import BaseWidget from '../Widgets/BaseWidget';
import GRID_CONFIG from '../../config/gridConfig';

const GridCanvas = () => {
  const canvasRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  const {
    widgets,
    canvasZoom,
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

  // Update container width and responsive breakpoints
  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const width = canvasRef.current.offsetWidth;
        setContainerWidth(width);

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
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [setCurrentBreakpoint, updateGridColumns]);

  // Pan handling
  const handleCanvasMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.spaceBar)) {
      e.preventDefault();
      setIsPanningLocal(true);
      setIsPanning(true);
      setPanStart({ x: e.clientX - canvasPan.x, y: e.clientY - canvasPan.y });
    } else if (e.button === 0 && e.target === canvasRef.current) {
      deselectAll();
      const rect = canvasRef.current.getBoundingClientRect();
      const startX = (e.clientX - rect.left - canvasPan.x) / canvasZoom;
      const startY = (e.clientY - rect.top - canvasPan.y) / canvasZoom;
      setSelectionBox({ startX, startY, endX: startX, endY: startY });
    }
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (isPanningLocal) {
      setCanvasPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (selectionBox) {
      const rect = canvasRef.current.getBoundingClientRect();
      const endX = (e.clientX - rect.left - canvasPan.x) / canvasZoom;
      const endY = (e.clientY - rect.top - canvasPan.y) / canvasZoom;
      setSelectionBox({ ...selectionBox, endX, endY });
    }
  }, [isPanningLocal, panStart, selectionBox, canvasPan, canvasZoom, setCanvasPan]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isPanningLocal) {
      setIsPanningLocal(false);
      setIsPanning(false);
    }
    
    if (selectionBox && canvasRef.current) {
      const { startX, startY, endX, endY } = selectionBox;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      // Convert to grid coordinates
      const minGridX = Math.floor(minX / (GRID_CONFIG.getPixelWidth(1, containerWidth, gridColumns) + GRID_CONFIG.gap));
      const maxGridX = Math.ceil(maxX / (GRID_CONFIG.getPixelWidth(1, containerWidth, gridColumns) + GRID_CONFIG.gap));
      const minGridY = Math.floor(minY / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap));
      const maxGridY = Math.ceil(maxY / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap));

      const selectedIds = widgets
        .filter((widget) => {
          const { x, y, w, h } = widget.gridArea;
          return (
            x + w > minGridX &&
            x < maxGridX &&
            y + h > minGridY &&
            y < maxGridY
          );
        })
        .map((w) => w.id);

      if (selectedIds.length > 0) {
        selectMultiple(selectedIds);
      }
      
      setSelectionBox(null);
    }
  }, [isPanningLocal, selectionBox, widgets, setIsPanning, selectMultiple, containerWidth, gridColumns]);

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

  // Zoom with mouse wheel
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.max(0.5, Math.min(2, canvasZoom + delta));
      useDashboardStore.getState().setCanvasZoom(newZoom);
    }
  };

  // Prevent default browser zoom
  useEffect(() => {
    const preventZoom = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('wheel', preventZoom, { passive: false });
    return () => window.removeEventListener('wheel', preventZoom);
  }, []);

  // Calculate grid dimensions
  const columnWidth = containerWidth > 0 
    ? GRID_CONFIG.getPixelWidth(1, containerWidth, gridColumns) 
    : 100;
  
  const maxRow = Math.max(...widgets.map(w => w.gridArea.y + w.gridArea.h), 4);
  const canvasHeight = GRID_CONFIG.getPixelHeight(maxRow) + GRID_CONFIG.containerPadding * 2;

  return (
    <div
      ref={canvasRef}
      className={`w-full h-full overflow-auto relative ${
        isPanningLocal ? 'cursor-grabbing' : 'cursor-default'
      }`}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      style={{
        backgroundColor: '#18191B',
      }}
    >
      {/* Canvas Container */}
      <div
        className="relative"
        style={{
          minHeight: '100%',
          width: '100%',
          padding: GRID_CONFIG.containerPadding,
        }}
      >
        {/* Grid Background */}
        {showGrid && containerWidth > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              padding: GRID_CONFIG.containerPadding,
            }}
          >
            {/* Vertical grid lines */}
            {Array.from({ length: gridColumns + 1 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute top-0 bottom-0 border-l border-white/5"
                style={{
                  left: i * (columnWidth + GRID_CONFIG.gap),
                }}
              />
            ))}
            
            {/* Horizontal grid lines */}
            {Array.from({ length: maxRow + 1 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute left-0 right-0 border-t border-white/5"
                style={{
                  top: i * (GRID_CONFIG.rowHeight + GRID_CONFIG.gap),
                }}
              />
            ))}
          </div>
        )}

        {/* Widgets */}
        {containerWidth > 0 && widgets
          .filter((w) => w.visible)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((widget) => (
            <BaseWidget 
              key={widget.id} 
              widget={widget} 
              containerWidth={containerWidth}
              gridColumns={gridColumns}
            />
          ))}

        {/* Selection Box */}
        {selectionBox && (
          <div
            className="absolute border-2 border-accent-blue bg-accent-blue/10 pointer-events-none z-50"
            style={{
              left: Math.min(selectionBox.startX, selectionBox.endX) * canvasZoom + canvasPan.x,
              top: Math.min(selectionBox.startY, selectionBox.endY) * canvasZoom + canvasPan.y,
              width: Math.abs(selectionBox.endX - selectionBox.startX) * canvasZoom,
              height: Math.abs(selectionBox.endY - selectionBox.startY) * canvasZoom,
            }}
          />
        )}
      </div>

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-fadeIn">
            <div className="text-6xl mb-4 opacity-20">✨</div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              Your canvas awaits
            </h3>
            <p className="text-sm text-white/50">
              Add widgets from the sidebar to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridCanvas;