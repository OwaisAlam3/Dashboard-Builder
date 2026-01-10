import React, { useRef, useEffect, useState, useCallback } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import BaseWidget from '../Widgets/BaseWidget';

const GridCanvas = () => {
  const canvasRef = useRef(null);
  const {
    widgets,
    canvasZoom,
    canvasPan,
    setCanvasPan,
    showGrid,
    gridSize,
    deselectAll,
    selectMultiple,
    isPanning,
    setIsPanning,
  } = useDashboardStore();

  const [isPanningLocal, setIsPanningLocal] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState(null);

  // Pan handling
  const handleCanvasMouseDown = (e) => {
    if (e.button === 1 || (e.button === 0 && e.spaceKey)) {
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
    
    if (selectionBox) {
      const { startX, startY, endX, endY } = selectionBox;
      const minX = Math.min(startX, endX);
      const maxX = Math.max(startX, endX);
      const minY = Math.min(startY, endY);
      const maxY = Math.max(startY, endY);

      const selectedIds = widgets
        .filter((widget) => {
          const { x, y } = widget.position;
          const { width, height } = widget.size;
          return (
            x + width > minX &&
            x < maxX &&
            y + height > minY &&
            y < maxY
          );
        })
        .map((w) => w.id);

      if (selectedIds.length > 0) {
        selectMultiple(selectedIds);
      }
      
      setSelectionBox(null);
    }
  }, [isPanningLocal, selectionBox, widgets, setIsPanning, selectMultiple]);

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

  // Zoom with mouse wheel (FIXED - prevents browser zoom)
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      
      // Slower zoom speed
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newZoom = Math.max(0.1, Math.min(5, canvasZoom + delta));
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

  return (
    <div
      ref={canvasRef}
      className={`w-full h-full overflow-hidden relative ${
        isPanningLocal ? 'cursor-grabbing' : 'cursor-canvas-default'
      }`}
      onMouseDown={handleCanvasMouseDown}
      onWheel={handleWheel}
      style={{
        backgroundColor: '#18191B',
      }}
    >
      {/* Grid Pattern (FIXED - now visible) */}
      {showGrid && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize * canvasZoom}px ${gridSize * canvasZoom}px`,
            backgroundPosition: `${canvasPan.x}px ${canvasPan.y}px`,
          }}
        />
      )}

      {/* Canvas Transform Container */}
      <div
        className="absolute inset-0 origin-top-left gpu-accelerated"
        style={{
          transform: `translate(${canvasPan.x}px, ${canvasPan.y}px) scale(${canvasZoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Widgets */}
        {widgets
          .filter((w) => w.visible)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((widget) => (
            <BaseWidget key={widget.id} widget={widget} />
          ))}
      </div>

      {/* Selection Box */}
      {selectionBox && (
        <div
          className="absolute border-2 border-accent-blue bg-accent-blue/10 pointer-events-none"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.endX) * canvasZoom + canvasPan.x,
            top: Math.min(selectionBox.startY, selectionBox.endY) * canvasZoom + canvasPan.y,
            width: Math.abs(selectionBox.endX - selectionBox.startX) * canvasZoom,
            height: Math.abs(selectionBox.endY - selectionBox.startY) * canvasZoom,
          }}
        />
      )}

      {/* Empty State */}
      {widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-fadeIn">
            <div className="text-6xl mb-4 opacity-20">✨</div>
            <h3 className="text-xl font-semibold text-white/80 mb-2">
              Your canvas awaits
            </h3>
            <p className="text-sm text-white/50">
              Drag widgets from the sidebar to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GridCanvas;