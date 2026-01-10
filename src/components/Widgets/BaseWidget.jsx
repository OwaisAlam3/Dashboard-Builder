import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { 
  Lock, 
  Unlock, 
  Copy, 
  Trash2,
  MoveUp,
  MoveDown
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { WIDGET_COMPONENTS } from './index';

const MIN_SIZE = { width: 100, height: 80 };

const BaseWidget = memo(({ widget }) => {
  const widgetRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 });
  const [showToolbar, setShowToolbar] = useState(false);

  const {
    selectedWidgetIds,
    selectWidget,
    updateWidget,
    deleteWidget,
    duplicateWidget,
    toggleWidgetLock,
    bringToFront,
    sendToBack,
    canvasZoom,
    setHoveredWidget,
    setIsDragging: setGlobalDragging,
    setIsResizing: setGlobalResizing,
  } = useDashboardStore();

  const WidgetComponent = WIDGET_COMPONENTS[widget.type];
  const isSelected = selectedWidgetIds.includes(widget.id);
  const isLocked = widget.locked;

  // Handle widget click
  const handleWidgetClick = useCallback((e) => {
    // Prevent selection when clicking on interactive elements
    if (
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.tagName === 'SELECT' ||
      e.target.tagName === 'BUTTON' ||
      e.target.closest('button') ||
      e.target.closest('.resize-handle')
    ) {
      return;
    }

    e.stopPropagation();
    selectWidget(widget.id, e.metaKey || e.ctrlKey || e.shiftKey);
  }, [widget.id, selectWidget]);

  // Handle drag start
  const handleMouseDown = useCallback((e) => {
    if (isLocked || e.button !== 0) return;
    
    // Don't start drag on resize handles or interactive elements
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

    setIsDragging(true);
    setGlobalDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ ...widget.position });
    
    // Select if not already selected
    if (!isSelected) {
      selectWidget(widget.id, e.metaKey || e.ctrlKey || e.shiftKey);
    }

    document.body.classList.add('is-dragging');
  }, [isLocked, widget.position, widget.id, isSelected, selectWidget, setGlobalDragging]);

  // Handle resize start
  const handleResizeStart = useCallback((direction) => (e) => {
    if (isLocked) return;
    
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setGlobalResizing(true);
    setResizeDirection(direction);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialPos({ ...widget.position });
    setInitialSize({ ...widget.size });

    document.body.classList.add('is-dragging');
  }, [isLocked, widget.position, widget.size, setGlobalResizing]);

  // Handle mouse move (drag & resize)
  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      const deltaX = (e.clientX - dragStart.x) / canvasZoom;
      const deltaY = (e.clientY - dragStart.y) / canvasZoom;

      if (isDragging) {
        const newX = initialPos.x + deltaX;
        const newY = initialPos.y + deltaY;
        updateWidget(widget.id, {
          position: { x: newX, y: newY }
        });
      } else if (isResizing && resizeDirection) {
        let newWidth = initialSize.width;
        let newHeight = initialSize.height;
        let newX = initialPos.x;
        let newY = initialPos.y;

        if (resizeDirection.includes('e')) {
          newWidth = Math.max(MIN_SIZE.width, initialSize.width + deltaX);
        }
        if (resizeDirection.includes('w')) {
          const widthChange = initialSize.width - deltaX;
          if (widthChange >= MIN_SIZE.width) {
            newWidth = widthChange;
            newX = initialPos.x + deltaX;
          }
        }
        if (resizeDirection.includes('s')) {
          newHeight = Math.max(MIN_SIZE.height, initialSize.height + deltaY);
        }
        if (resizeDirection.includes('n')) {
          const heightChange = initialSize.height - deltaY;
          if (heightChange >= MIN_SIZE.height) {
            newHeight = heightChange;
            newY = initialPos.y + deltaY;
          }
        }

        updateWidget(widget.id, {
          position: { x: newX, y: newY },
          size: { width: newWidth, height: newHeight },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setGlobalDragging(false);
      setGlobalResizing(false);
      setResizeDirection(null);
      document.body.classList.remove('is-dragging');
      
      if (isDragging || isResizing) {
        useDashboardStore.getState().saveToHistory();
        useDashboardStore.getState().saveToLocalStorage();
      }
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
    initialPos,
    initialSize,
    widget.id,
    canvasZoom,
    updateWidget,
    setGlobalDragging,
    setGlobalResizing,
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

  return (
    <div
      ref={widgetRef}
      className={`absolute select-none gpu-accelerated ${
        isLocked ? 'cursor-not-allowed' : 'cursor-grab'
      } ${isDragging ? 'widget-dragging' : isSelected ? 'widget-selected' : 'widget-idle'}`}
      style={{
        left: widget.position.x,
        top: widget.position.y,
        width: widget.size.width,
        height: widget.size.height,
        zIndex: widget.zIndex,
        opacity: widget.opacity,
        transform: `rotate(${widget.rotation || 0}deg)`,
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
      onClick={handleWidgetClick}
      onMouseEnter={() => {
        setHoveredWidget(widget.id);
        setShowToolbar(true);
      }}
      onMouseLeave={() => {
        setHoveredWidget(null);
        setShowToolbar(false);
      }}
    >
      {/* Selection Border */}
      {isSelected && !isDragging && (
        <div className="absolute -inset-0.5 border-2 border-accent-blue rounded pointer-events-none" />
      )}

      {/* Floating Toolbar */}
      {(showToolbar || isSelected) && (
        <div className="absolute -top-10 left-0 right-0 flex items-center justify-between px-2 py-1 floating-toolbar rounded-t-lg animate-slideIn no-print">
          <div className="flex items-center gap-1">
            <span className="text-xs text-white/70 px-2">{widget.type}</span>
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
                <Unlock size={14} className="text-white" />
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
      {isSelected && !isLocked && !isDragging && (
        <>
          {resizeHandles.map((handle) => (
            <div
              key={handle.dir}
              className={`resize-handle ${handle.className}`}
              onMouseDown={handleResizeStart(handle.dir)}
            />
          ))}
        </>
      )}
    </div>
  );
});

BaseWidget.displayName = 'BaseWidget';

export default BaseWidget;