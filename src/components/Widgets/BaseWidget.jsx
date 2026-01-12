// src/components/Widgets/BaseWidget.jsx - COMPLETE FILE
import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { 
  Lock, 
  Unlock, 
  Copy, 
  Trash2,
  MoveUp,
  MoveDown,
  GripVertical
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { WIDGET_COMPONENTS } from './index';
import GRID_CONFIG from '../../config/gridConfig';

const BaseWidget = memo(({ widget, containerWidth, gridColumns, canvasZoom }) => {
  const widgetRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialGridArea, setInitialGridArea] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [ghostPosition, setGhostPosition] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const {
    selectedWidgetIds,
    selectWidget,
    updateWidgetGridArea,
    deleteWidget,
    duplicateWidget,
    toggleWidgetLock,
    bringToFront,
    sendToBack,
    setHoveredWidget,
    setIsDragging: setGlobalDragging,
    setIsResizing: setGlobalResizing,
    checkCollision,
    isPanning,
  } = useDashboardStore();

  const WidgetComponent = WIDGET_COMPONENTS[widget.type];
  const isSelected = selectedWidgetIds.includes(widget.id);
  const isLocked = widget.locked;

  // Calculate pixel positions from grid coordinates
  const columnWidth = GRID_CONFIG.getPixelWidth(1, containerWidth, gridColumns);
  const pixelX = widget.gridArea.x * (columnWidth + GRID_CONFIG.gap);
  const pixelY = widget.gridArea.y * (GRID_CONFIG.rowHeight + GRID_CONFIG.gap);
  const pixelWidth = GRID_CONFIG.getPixelWidth(widget.gridArea.w, containerWidth, gridColumns);
  const pixelHeight = GRID_CONFIG.getPixelHeight(widget.gridArea.h);

  // Handle widget click
  const handleWidgetClick = useCallback((e) => {
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button') ||
      e.target.closest('.resize-handle') ||
      isPanning
    ) {
      return;
    }

    e.stopPropagation();
    selectWidget(widget.id, e.metaKey || e.ctrlKey || e.shiftKey);
  }, [widget.id, selectWidget, isPanning]);

  // Handle drag start
  const handleMouseDown = useCallback((e) => {
    if (isLocked || e.button !== 0 || isPanning) return;
    
    if (
      e.target.closest('.resize-handle') ||
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button')
    ) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const rect = widgetRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setIsDragging(true);
    setGlobalDragging(true, widget.id);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ x: offsetX / canvasZoom, y: offsetY / canvasZoom });
    setInitialGridArea({ ...widget.gridArea });
    setGhostPosition({ ...widget.gridArea });
    
    if (!isSelected) {
      selectWidget(widget.id, e.metaKey || e.ctrlKey || e.shiftKey);
    }

    document.body.classList.add('is-dragging');
    document.body.style.userSelect = 'none';
  }, [isLocked, widget.gridArea, widget.id, isSelected, selectWidget, setGlobalDragging, canvasZoom, isPanning]);

  // Handle resize start
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

  // Handle mouse move (drag & resize)
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - dragStart.x) / canvasZoom;
      const deltaY = (e.clientY - dragStart.y) / canvasZoom;

      if (isDragging) {
        // Convert pixel delta to grid delta
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
    };

    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        if (ghostPosition) {
          // Check for collision before finalizing
          const hasCollision = checkCollision({ gridArea: ghostPosition }, widget.id);
          
          if (!hasCollision) {
            updateWidgetGridArea(widget.id, ghostPosition, false);
            useDashboardStore.getState().saveToHistory();
            useDashboardStore.getState().saveToLocalStorage();
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

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    isDragging,
    isResizing,
    resizeDirection,
    dragStart,
    initialGridArea,
    widget.id,
    columnWidth,
    gridColumns,
    updateWidgetGridArea,
    setGlobalDragging,
    setGlobalResizing,
    checkCollision,
    ghostPosition,
    canvasZoom,
  ]);

  // Toolbar actions
  const handleDuplicate = (e) => {
    e.stopPropagation();
    duplicateWidget(widget.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    deleteWidget(widget.id);
  };

  const handleLockToggle = (e) => {
    e.stopPropagation();
    toggleWidgetLock(widget.id);
  };

  const handleBringToFront = (e) => {
    e.stopPropagation();
    bringToFront(widget.id);
  };

  const handleSendToBack = (e) => {
    e.stopPropagation();
    sendToBack(widget.id);
  };

  // Resize handles data
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

  // Calculate ghost position pixels
  const ghostPixelX = ghostPosition ? ghostPosition.x * (columnWidth + GRID_CONFIG.gap) : null;
  const ghostPixelY = ghostPosition ? ghostPosition.y * (GRID_CONFIG.rowHeight + GRID_CONFIG.gap) : null;
  const ghostPixelWidth = ghostPosition ? GRID_CONFIG.getPixelWidth(ghostPosition.w, containerWidth, gridColumns) : null;
  const ghostPixelHeight = ghostPosition ? GRID_CONFIG.getPixelHeight(ghostPosition.h) : null;

  // Check if ghost position has collision
  const hasGhostCollision = ghostPosition ? checkCollision({ gridArea: ghostPosition }, widget.id) : false;

  return (
    <>
      {/* Ghost Widget (shown during drag/resize) */}
      {(isDragging || isResizing) && ghostPosition && (
        <div
          className={`absolute pointer-events-none rounded-lg border-2 transition-all duration-75 ${
            hasGhostCollision 
              ? 'border-red-500 bg-red-500/10' 
              : 'border-accent-blue bg-accent-blue/10'
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

      {/* Actual Widget */}
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
        onMouseEnter={() => {
          if (!isDragging && !isResizing) {
            setHoveredWidget(widget.id);
            setShowToolbar(true);
          }
        }}
        onMouseLeave={() => {
          if (!isDragging && !isResizing) {
            setHoveredWidget(null);
            setShowToolbar(false);
          }
        }}
      >
        {/* Selection Border */}
        {isSelected && !isDragging && !isResizing && (
          <div className="absolute -inset-0.5 border-2 border-accent-blue rounded-lg pointer-events-none shadow-lg shadow-accent-blue/20" />
        )}

        {/* Floating Toolbar */}
        {(showToolbar || isSelected) && !isDragging && !isResizing && (
          <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-2 py-1 floating-toolbar rounded-t-lg animate-slideIn no-print z-50">
            <div className="flex items-center gap-1">
              <GripVertical size={14} className="text-white/40" />
              <span className="text-xs text-white/70 px-1">{widget.type}</span>
              <span className="text-xs text-white/40">
                {widget.gridArea.w}×{widget.gridArea.h}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {!isLocked && (
                <>
                  <button
                    onClick={handleBringToFront}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Bring to Front"
                  >
                    <MoveUp size={14} className="text-white" />
                  </button>
                  <button
                    onClick={handleSendToBack}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Send to Back"
                  >
                    <MoveDown size={14} className="text-white" />
                  </button>
                  <div className="w-px h-4 bg-white/20 mx-1" />
                </>
              )}
              <button
                onClick={handleLockToggle}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title={isLocked ? 'Unlock Widget' : 'Lock Widget'}
              >
                {isLocked ? 
                  <Lock size={14} className="text-yellow-400" /> : 
                  <Unlock size={14} className="text-white/70" />
                }
              </button>
              {!isLocked && (
                <>
                  <button
                    onClick={handleDuplicate}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                    title="Duplicate (Cmd+D)"
                  >
                    <Copy size={14} className="text-white" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    title="Delete (Del)"
                  >
                    <Trash2 size={14} className="text-red-400" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Widget Content */}
        <div className="w-full h-full bg-white rounded-lg shadow-widget overflow-hidden">
          {WidgetComponent ? (
            <WidgetComponent data={widget.data} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <p className="text-gray-500 text-sm">Widget not found</p>
            </div>
          )}
        </div>

        {/* Resize Handles */}
        {isSelected && !isLocked && !isDragging && !isResizing && (
          <>
            {resizeHandles.map((handle) => (
              <div
                key={handle.dir}
                className={`resize-handle ${handle.className} bg-accent-blue hover:bg-accent-blue border border-white shadow-lg`}
                onMouseDown={handleResizeStart(handle.dir)}
                style={{
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