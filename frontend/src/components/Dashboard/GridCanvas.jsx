import React, { useRef, useEffect, useState, useCallback } from 'react';
import useDashboardStore from '../../store/dashboardStore';
import BaseWidget from '../Widgets/BaseWidget';
import GRID_CONFIG from '../../config/gridConfig';

export const CANVAS_WIDTH = 1366;
export const CANVAS_HEIGHT = 768;

const GridCanvas = ({ embedMode = false, readOnly = false }) => {
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
    maxRows,
    setMaxRows,
    isDragging,
    isResizing,
  } = useDashboardStore();

  const [isPanningLocal, setIsPanningLocal] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [selectionBox, setSelectionBox] = useState(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [embedScale, setEmbedScale] = useState(1);

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

  // Calculate embed scale to fit content
  useEffect(() => {
    if (embedMode && canvasRef.current) {
      const calculateScale = () => {
        const container = canvasRef.current;
        if (!container) return;

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Add padding
        const padding = 32;
        const availableWidth = containerWidth - padding * 2;
        const availableHeight = containerHeight - padding * 2;
        
        // Calculate scale to fit
        const scaleX = availableWidth / CANVAS_WIDTH;
        const scaleY = availableHeight / CANVAS_HEIGHT;
        const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1
        
        setEmbedScale(scale);
      };

      calculateScale();
      
      const resizeObserver = new ResizeObserver(calculateScale);
      resizeObserver.observe(canvasRef.current);
      
      return () => resizeObserver.disconnect();
    }
  }, [embedMode]);

  const isInteractionDisabled = embedMode && readOnly;

  useEffect(() => {
    if (isInteractionDisabled) return;

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
  }, [isPanningLocal, setIsPanning, isInteractionDisabled]);

  const handleCanvasMouseDown = useCallback((e) => {
    if (isInteractionDisabled || isDragging || isResizing) return;

    const clickedElement = e.target;
    const isCanvasClick = 
      clickedElement === canvasRef.current || 
      clickedElement === contentRef.current || 
      clickedElement.classList.contains('grid-background') ||
      clickedElement.classList.contains('canvas-boundary') ||
      clickedElement.classList.contains('grid-container') ||
      clickedElement.classList.contains('grid-lines');

    if (clickedElement.closest('[data-widget-id]')) {
      return;
    }

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
      return;
    }
    
    if (e.button === 0 && isCanvasClick && !isSpacePressed) {
      deselectAll();
      
      const rect = canvasRef.current.getBoundingClientRect();
      const scrollLeft = canvasRef.current.scrollLeft;
      const scrollTop = canvasRef.current.scrollTop;
      
      const startX = (e.clientX - rect.left + scrollLeft) / canvasZoom;
      const startY = (e.clientY - rect.top + scrollTop) / canvasZoom;
      
      setSelectionBox({ startX, startY, endX: startX, endY: startY });
    }
  }, [isSpacePressed, canvasZoom, deselectAll, setIsPanning, isDragging, isResizing, isInteractionDisabled]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isInteractionDisabled) return;

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
  }, [isPanningLocal, panStart, selectionBox, canvasZoom, isInteractionDisabled]);

  const handleCanvasMouseUp = useCallback(() => {
    if (isInteractionDisabled) return;

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
      }
      
      setSelectionBox(null);
    }
  }, [isPanningLocal, selectionBox, widgets, setIsPanning, selectMultiple, gridColumns, isInteractionDisabled]);

  useEffect(() => {
    if (isInteractionDisabled) return;

    if (isPanningLocal || selectionBox) {
      document.addEventListener('mousemove', handleCanvasMouseMove);
      document.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove);
        document.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanningLocal, selectionBox, handleCanvasMouseMove, handleCanvasMouseUp, isInteractionDisabled]);

  const handleWheel = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && canvasRef.current?.contains(e.target)) {
      e.preventDefault();
      e.stopPropagation();
      
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      const newZoom = Math.max(0.1, Math.min(5, canvasZoom + delta));
      
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

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  const columnWidth = GRID_CONFIG.getPixelWidth(1, CANVAS_WIDTH, gridColumns);

  const getCursorStyle = () => {
    if (isInteractionDisabled) return 'default';
    if (isPanningLocal) return 'grabbing';
    if (isSpacePressed) return 'grab';
    if (selectionBox) return 'crosshair';
    return 'default';
  };

  if (embedMode) {
    return (
      <div 
        ref={canvasRef}
        className="w-full h-full overflow-auto bg-white flex items-center justify-center"
      >
        <div
          ref={contentRef}
          className="relative"
          style={{
            width: CANVAS_WIDTH,
            height: CANVAS_HEIGHT,
            transform: `scale(${embedScale})`,
            transformOrigin: 'center center',
            margin: '16px',
          }}
        >
          {widgets
            .filter((w) => w.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((widget) => (
              <BaseWidget 
                key={widget.id} 
                widget={widget} 
                containerWidth={CANVAS_WIDTH}
                gridColumns={gridColumns}
                canvasZoom={1}
                readOnly={true}
                embedMode={true}
              />
            ))}
        </div>
      </div>
    );
  }

  const wrapperStyle = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: CANVAS_WIDTH * canvasZoom + 256,
    height: CANVAS_HEIGHT * canvasZoom + 256,
    minWidth: CANVAS_WIDTH * canvasZoom + 256,
    minHeight: CANVAS_HEIGHT * canvasZoom + 256,
  };

  return (
    <div
      ref={canvasRef}
      className="w-full h-full overflow-auto relative bg-canvas"
      onMouseDown={!isInteractionDisabled ? handleCanvasMouseDown : undefined}
      style={{ cursor: getCursorStyle() }}
    >
      <div style={wrapperStyle}>
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
              backgroundColor: '#f8fafc',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.1)',
              borderRadius: '4px',
            }}
          >
            <div className="relative w-full h-full grid-container">
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid-lines">
                  {Array.from({ length: gridColumns + 1 }).map((_, i) => (
                    <div key={`v-${i}`} className="absolute top-0 bottom-0 border-l"
                      style={{
                        left: i * (columnWidth + GRID_CONFIG.gap),
                        borderColor: i % 6 === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.06)',
                        borderWidth: i % 6 === 0 ? '1.5px' : '1px',
                      }}
                    />
                  ))}
                  {Array.from({ length: maxRows + 1 }).map((_, i) => (
                    <div key={`h-${i}`} className="absolute left-0 right-0 border-t"
                      style={{
                        top: i * (GRID_CONFIG.rowHeight + GRID_CONFIG.gap),
                        borderColor: i % 4 === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.06)',
                        borderWidth: i % 4 === 0 ? '1.5px' : '1px',
                      }}
                    />
                  ))}
                </div>
              )}

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
                    readOnly={readOnly}
                    embedMode={embedMode}
                  />
                ))}

              {!isInteractionDisabled && selectionBox && (
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
          </div>
        </div>
      </div>

      {widgets.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center animate-fadeIn">
            <svg
              className="mx-auto mb-4 text-white/20"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 21V9" />
            </svg>
            <h3 className="text-xl font-semibold text-white/80 mb-2">Your canvas awaits</h3>
            <p className="text-sm text-white/50 mb-4">Add widgets from the sidebar to get started</p>
            <div className="text-xs text-white/40">
              {gridColumns} columns × {maxRows} rows
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 px-3 py-2 bg-panel/95 backdrop-blur-sm rounded-lg border border-panel-border text-xs text-white/70 pointer-events-none z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${canvasZoom === 1 ? 'bg-green-500' : 'bg-accent-blue animate-pulse'}`} />
          <span className="font-medium">{Math.round(canvasZoom * 100)}%</span>
          {canvasZoom !== 1 && <span className="text-white/40">• Ctrl+Wheel to zoom</span>}
        </div>
      </div>

      {showGrid && (
        <div className="absolute bottom-4 left-4 px-3 py-2 bg-panel/95 backdrop-blur-sm rounded-lg border border-panel-border text-xs text-white/70 pointer-events-none z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-medium">{gridColumns} cols × {maxRows} rows</span>
          </div>
        </div>
      )}

      {!isInteractionDisabled && isSpacePressed && !isPanningLocal && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-2 bg-black/80 backdrop-blur-sm rounded-lg text-sm text-white pointer-events-none z-50 shadow-2xl animate-fadeIn">
          Click and drag to pan
        </div>
      )}
    </div>
  );
};

export default GridCanvas;