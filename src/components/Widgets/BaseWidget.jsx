// src/components/Widgets/BaseWidget.jsx 
import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { Lock, Unlock, Copy, Trash2, MoveUp, MoveDown, GripVertical } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { WIDGET_COMPONENTS } from './index';
import GRID_CONFIG from '../../config/gridConfig';

const BaseWidget = memo(({ widget, containerWidth, gridColumns, canvasZoom }) => {
  const widgetRef = useRef(null);
  const cleanupRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialGridArea, setInitialGridArea] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [ghostPosition, setGhostPosition] = useState(null);

  const {
    selectedWidgetIds, selectWidget, updateWidgetGridArea,
    deleteWidget, duplicateWidget, toggleWidgetLock,
    bringToFront, sendToBack, setHoveredWidget,
    setIsDragging: setGlobalDragging, setIsResizing: setGlobalResizing,
    checkCollision, isPanning,
  } = useDashboardStore();

  const WidgetComponent = WIDGET_COMPONENTS[widget.type];
  const isSelected = selectedWidgetIds.includes(widget.id);
  const isLocked = widget.locked;

  // Calculate pixel positions from grid coordinates using containerWidth
  const columnWidth = GRID_CONFIG.getPixelWidth(1, containerWidth, gridColumns);
  const pixelX = widget.gridArea.x * (columnWidth + GRID_CONFIG.gap);
  const pixelY = widget.gridArea.y * (GRID_CONFIG.rowHeight + GRID_CONFIG.gap);
  const pixelWidth = GRID_CONFIG.getPixelWidth(widget.gridArea.w, containerWidth, gridColumns);
  const pixelHeight = GRID_CONFIG.getPixelHeight(widget.gridArea.h);

  // Handle widget click without re-opening panel on drag
  const handleWidgetClick = useCallback((e) => {
    if (
      e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON' ||
      e.target.closest('button') || e.target.closest('.resize-handle') ||
      isPanning || isDragging || isResizing
    ) {
      return;
    }

    e.stopPropagation();
    
    if (!isSelected) {
      selectWidget(widget.id, e.metaKey || e.ctrlKey || e.shiftKey);
    }
  }, [widget.id, selectWidget, isPanning, isDragging, isResizing, isSelected]);

  // Drag start with proper zoom offset
  const handleMouseDown = useCallback((e) => {
    if (isLocked || e.button !== 0 || isPanning) return;
    
    if (
      e.target.closest('.resize-handle') || e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' ||
      e.target.tagName === 'BUTTON' || e.target.closest('button')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    setIsDragging(true);
    setGlobalDragging(true, widget.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialGridArea({ ...widget.gridArea });
    setGhostPosition({ ...widget.gridArea });
    
    if (!isSelected) {
      selectWidget(widget.id, e.metaKey || e.ctrlKey || e.shiftKey);
    }

    document.body.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
  }, [isLocked, widget.gridArea, widget.id, isSelected, selectWidget, setGlobalDragging, isPanning]);

  // Resize start
  const handleResizeStart = useCallback((direction) => (e) => {
    if (isLocked || isPanning) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setGlobalResizing(true);
    setResizeDirection(direction);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialGridArea({ ...widget.gridArea });
    setGhostPosition({ ...widget.gridArea });

    document.body.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
  }, [isLocked, widget.gridArea, setGlobalResizing, isPanning]);

  // Mouse move with proper cleanup and batched updates
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    let animationFrameId = null;
    let pendingUpdate = null;

    const handleMouseMove = (e) => {
      // Store the event data
      pendingUpdate = {
        clientX: e.clientX,
        clientY: e.clientY,
      };

      // Cancel previous animation frame if it exists
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      // Schedule update on next animation frame for smooth performance
      animationFrameId = requestAnimationFrame(() => {
        if (!pendingUpdate) return;

        const { clientX, clientY } = pendingUpdate;
        
        // Account for canvas zoom in delta calculation
        const deltaX = (clientX - dragStart.x) / canvasZoom;
        const deltaY = (clientY - dragStart.y) / canvasZoom;

        if (isDragging) {
          const gridDeltaX = Math.round(deltaX / (columnWidth + GRID_CONFIG.gap));
          const gridDeltaY = Math.round(deltaY / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap));

          const newGridArea = {
            x: Math.max(0, Math.min(initialGridArea.x + gridDeltaX, gridColumns - initialGridArea.w)),
            y: Math.max(0, initialGridArea.y + gridDeltaY),
            w: initialGridArea.w,
            h: initialGridArea.h,
          };

          setGhostPosition(newGridArea);

        } else if (isResizing && resizeDirection) {
          const gridDeltaX = Math.round(deltaX / (columnWidth + GRID_CONFIG.gap));
          const gridDeltaY = Math.round(deltaY / (GRID_CONFIG.rowHeight + GRID_CONFIG.gap));

          let newGridArea = { ...initialGridArea };

          if (resizeDirection.includes('e')) {
            newGridArea.w = Math.max(GRID_CONFIG.minWidgetWidth, Math.min(initialGridArea.w + gridDeltaX, gridColumns - initialGridArea.x));
          }
          if (resizeDirection.includes('w')) {
            const newWidth = Math.max(GRID_CONFIG.minWidgetWidth, initialGridArea.w - gridDeltaX);
            const widthChange = initialGridArea.w - newWidth;
            newGridArea.w = newWidth;
            newGridArea.x = Math.max(0, initialGridArea.x + widthChange);
          }
          if (resizeDirection.includes('s')) {
            newGridArea.h = Math.max(GRID_CONFIG.minWidgetHeight, initialGridArea.h + gridDeltaY);
          }
          if (resizeDirection.includes('n')) {
            const newHeight = Math.max(GRID_CONFIG.minWidgetHeight, initialGridArea.h - gridDeltaY);
            const heightChange = initialGridArea.h - newHeight;
            newGridArea.h = newHeight;
            newGridArea.y = Math.max(0, initialGridArea.y + heightChange);
          }

          setGhostPosition(newGridArea);
        }

        pendingUpdate = null;
      });
    };

    const handleMouseUp = () => {
      // Cancel any pending animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      if (isDragging || isResizing) {
        if (ghostPosition) {
          // Check collision with current size during resize
          const hasCollision = checkCollision({ gridArea: ghostPosition }, widget.id);
          
          if (!hasCollision) {
            updateWidgetGridArea(widget.id, ghostPosition, false);
            const store = useDashboardStore.getState();
            store.saveToHistory();
            store.saveToLocalStorage();
          }
        }
      }

      setIsDragging(false);
      setIsResizing(false);
      setGlobalDragging(false);
      setGlobalResizing(false);
      setResizeDirection(null);
      setGhostPosition(null);
      document.body.classList.remove('is-dragging');
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Store cleanup function
    cleanupRef.current = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    return cleanupRef.current;
  }, [
    isDragging, isResizing, resizeDirection, dragStart, initialGridArea,
    widget.id, columnWidth, gridColumns, updateWidgetGridArea,
    setGlobalDragging, setGlobalResizing, checkCollision, ghostPosition, canvasZoom,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  // Toolbar actions
  const handleDuplicate = useCallback((e) => {
    e.stopPropagation();
    duplicateWidget(widget.id);
  }, [duplicateWidget, widget.id]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    deleteWidget(widget.id);
  }, [deleteWidget, widget.id]);

  const handleLockToggle = useCallback((e) => {
    e.stopPropagation();
    toggleWidgetLock(widget.id);
  }, [toggleWidgetLock, widget.id]);

  const handleBringToFront = useCallback((e) => {
    e.stopPropagation();
    bringToFront(widget.id);
  }, [bringToFront, widget.id]);

  const handleSendToBack = useCallback((e) => {
    e.stopPropagation();
    sendToBack(widget.id);
  }, [sendToBack, widget.id]);

  // Resize handles with zoom-aware sizing
  const resizeHandles = [
    { dir: 'n', className: 'resize-handle-n' },
    { dir: 's', className: 'resize-handle-s' },
    { dir: 'e', className: 'resize-handle-e' },
    { dir: 'w', className: 'resize-handle-w' },
    { dir: 'ne', className: 'resize-handle-ne' },
    { dir: 'nw', className: 'resize-handle-nw' },
    { dir: 'se', className: 'resize-handle-se' },
    { dir: 'sw', className: 'resize-handle-sw' },
  ];

  // Calculate ghost position pixels using containerWidth
  const ghostPixelX = ghostPosition ? ghostPosition.x * (columnWidth + GRID_CONFIG.gap) : null;
  const ghostPixelY = ghostPosition ? ghostPosition.y * (GRID_CONFIG.rowHeight + GRID_CONFIG.gap) : null;
  const ghostPixelWidth = ghostPosition ? GRID_CONFIG.getPixelWidth(ghostPosition.w, containerWidth, gridColumns) : null;
  const ghostPixelHeight = ghostPosition ? GRID_CONFIG.getPixelHeight(ghostPosition.h) : null;

  const hasGhostCollision = ghostPosition ? checkCollision({ gridArea: ghostPosition }, widget.id) : false;

  // Calculate handle size based on zoom (min 8px, max 12px)
  const handleSize = Math.min(12, Math.max(8, 10 / canvasZoom));

  // Memoize toolbar visibility logic
  const handleMouseEnter = useCallback(() => {
    if (!isDragging && !isResizing) {
      setHoveredWidget(widget.id);
      setShowToolbar(true);
    }
  }, [isDragging, isResizing, setHoveredWidget, widget.id]);

  const handleMouseLeave = useCallback(() => {
    if (!isDragging && !isResizing) {
      setHoveredWidget(null);
      setShowToolbar(false);
    }
  }, [isDragging, isResizing, setHoveredWidget]);

  return (
    <>
      {/* Ghost widget during drag/resize */}
      {(isDragging || isResizing) && ghostPosition && (
        <div
          className={`absolute pointer-events-none rounded-lg border-2 transition-all duration-75 ${
            hasGhostCollision ? 'border-red-500 bg-red-500/10' : 'border-accent-blue bg-accent-blue/10'
          }`}
          style={{
            left: ghostPixelX, 
            top: ghostPixelY,
            width: ghostPixelWidth, 
            height: ghostPixelHeight,
            zIndex: 9999,
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-xs font-medium px-2 py-1 rounded backdrop-blur-sm ${
              hasGhostCollision ? 'bg-red-500 text-white' : 'bg-accent-blue text-white'
            }`}>
              {ghostPosition.w} × {ghostPosition.h}
            </div>
          </div>
        </div>
      )}

      {/* Actual widget */}
      <div
        ref={widgetRef}
        className={`absolute select-none transition-all duration-75 ${
          isLocked ? 'cursor-not-allowed' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${(isDragging || isResizing) ? 'opacity-40' : ''} ${isSelected ? 'widget-selected' : 'widget-idle'}`}
        style={{
          left: pixelX, 
          top: pixelY,
          width: pixelWidth, 
          height: pixelHeight,
          zIndex: widget.zIndex + (isSelected ? 1000 : 0),
          opacity: (isDragging || isResizing) ? 0.4 : widget.opacity,
          pointerEvents: 'auto',
        }}
        onMouseDown={handleMouseDown}
        onClick={handleWidgetClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Selection border */}
        {isSelected && !isDragging && !isResizing && (
          <div className="absolute -inset-0.5 border-2 border-accent-blue rounded-lg pointer-events-none shadow-lg shadow-accent-blue/20" />
        )}

        {/* Floating toolbar */}
        {(showToolbar || isSelected) && !isDragging && !isResizing && (
          <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-2 py-1 floating-toolbar rounded-t-lg animate-slideIn no-print z-50">
            <div className="flex items-center gap-1">
              <GripVertical size={14} className="text-white/40" />
              <span className="text-xs text-white/70 px-1">{widget.type}</span>
              <span className="text-xs text-white/40">{widget.gridArea.w}×{widget.gridArea.h}</span>
            </div>
            <div className="flex items-center gap-1">
              {!isLocked && (
                <>
                  <button onClick={handleBringToFront}
                    className="p-1 hover:bg-white/10 rounded transition-colors" title="Bring to Front">
                    <MoveUp size={14} className="text-white" />
                  </button>
                  <button onClick={handleSendToBack}
                    className="p-1 hover:bg-white/10 rounded transition-colors" title="Send to Back">
                    <MoveDown size={14} className="text-white" />
                  </button>
                  <div className="w-px h-4 bg-white/20 mx-1" />
                </>
              )}
              <button onClick={handleLockToggle}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title={isLocked ? 'Unlock Widget' : 'Lock Widget'}>
                {isLocked ? <Lock size={14} className="text-yellow-400" /> : <Unlock size={14} className="text-white/70" />}
              </button>
              {!isLocked && (
                <>
                  <button onClick={handleDuplicate}
                    className="p-1 hover:bg-white/10 rounded transition-colors" title="Duplicate (Cmd+D)">
                    <Copy size={14} className="text-white" />
                  </button>
                  <button onClick={handleDelete}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors" title="Delete (Del)">
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Widget content */}
        <div className="w-full h-full bg-white rounded-lg shadow-widget overflow-hidden">
          {WidgetComponent ? (
            <WidgetComponent data={widget.data} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <p className="text-gray-500 text-sm">Widget not found</p>
            </div>
          )}
        </div>

        {/* Resize handles */}
        {isSelected && !isLocked && !isDragging && !isResizing && (
          <>
            {resizeHandles.map((handle) => (
              <div
                key={handle.dir}
                className={`resize-handle ${handle.className} bg-accent-blue hover:bg-accent-blue border border-white shadow-lg`}
                onMouseDown={handleResizeStart(handle.dir)}
                style={{
                  width: handleSize,
                  height: handleSize,
                  opacity: 0.9,
                }}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
});

BaseWidget.displayName = 'BaseWidget';

export default BaseWidget;