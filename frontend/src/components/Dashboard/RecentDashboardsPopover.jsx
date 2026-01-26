// src/components/Dashboard/RecentDashboardsPopover.jsx - FIXED: No nested buttons, better UX
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2, Loader2, LayoutDashboard, ArrowRight } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const RecentDashboardsPopover = ({ anchorRef, onClose }) => {
  const navigate = useNavigate();
  const popoverRef = useRef(null);
  const {
    dashboards,
    fetchDashboards,
    deleteDashboard,
    currentDashboardId,
    clearSelection,
  } = useDashboardStore();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const loadDashboards = async () => {
      setLoading(true);
      await fetchDashboards();
      setLoading(false);
    };
    loadDashboards();
  }, [fetchDashboards]);

  const recentDashboards = [...dashboards]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, anchorRef]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (loading || recentDashboards.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, recentDashboards.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (recentDashboards[selectedIndex]) {
            handleOpenDashboard(recentDashboards[selectedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, recentDashboards, selectedIndex, onClose]);

  // Smart positioning with edge detection
  useEffect(() => {
    if (anchorRef.current && popoverRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const popover = popoverRef.current;
      const popoverHeight = popover.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      const spaceBelow = viewportHeight - anchorRect.bottom - 8;
      const spaceAbove = anchorRect.top - 8;
      
      if (spaceBelow < popoverHeight && spaceAbove > spaceBelow) {
        popover.style.bottom = `${viewportHeight - anchorRect.top + 8}px`;
        popover.style.top = 'auto';
      } else {
        popover.style.top = `${anchorRect.bottom + 8}px`;
        popover.style.bottom = 'auto';
      }
      
      popover.style.left = `${anchorRect.left}px`;
      popover.style.right = 'auto';
      
      const popoverWidth = popover.offsetWidth;
      if (anchorRect.left + popoverWidth > window.innerWidth) {
        popover.style.right = `${window.innerWidth - anchorRect.right}px`;
        popover.style.left = 'auto';
      }
    }
  }, [anchorRef, recentDashboards]);

  const handleOpenDashboard = async (dashboardId) => {
    if (dashboardId === currentDashboardId) {
      onClose();
      return;
    }

    try {
      clearSelection();
      onClose();
      navigate(`/dashboard/${dashboardId}`);
    } catch (error) {
      console.error('Error switching dashboard:', error);
    }
  };

  const handleDelete = async (e, dashboardId, dashboardName) => {
    e.stopPropagation(); // FIXED: Stop propagation to prevent opening
    
    if (!window.confirm(`Delete "${dashboardName}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(dashboardId);
    try {
      await deleteDashboard(dashboardId);
      await fetchDashboards();
      
      if (dashboardId === currentDashboardId) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    } finally {
      setDeleting(null);
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
    });
  };

  return (
    <div
      ref={popoverRef}
      className="fixed z-[100] w-80 bg-panel-light border border-panel-border rounded-lg shadow-2xl overflow-hidden animate-slideIn"
    >
      <div className="px-4 py-3 border-b border-panel-border bg-panel">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock size={16} />
            Recent Dashboards
          </h3>
          {!loading && recentDashboards.length > 0 && (
            <span className="text-xs text-white/40">
              Use ↑↓ to navigate
            </span>
          )}
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto animate-spin text-accent-blue" size={24} />
            <p className="mt-2 text-xs text-white/40">Loading...</p>
          </div>
        ) : recentDashboards.length === 0 ? (
          <div className="py-12 text-center">
            <LayoutDashboard className="mx-auto mb-3 text-white/20" size={32} />
            <p className="text-sm text-white/40">No recent dashboards</p>
          </div>
        ) : (
          <div className="py-1">
            {recentDashboards.map((dashboard, index) => {
              const isCurrent = dashboard.id === currentDashboardId;
              const isDeleting = deleting === dashboard.id;
              const isSelected = index === selectedIndex;

              return (
                // FIXED: Changed from button to div to avoid nesting
                <div
                  key={dashboard.id}
                  onClick={() => !isDeleting && handleOpenDashboard(dashboard.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors cursor-pointer relative ${
                    isCurrent ? 'bg-accent-blue/10 border-l-2 border-accent-blue' : ''
                  } ${isSelected ? 'bg-panel' : 'hover:bg-panel'} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {/* Selection indicator */}
                  {isSelected && !isCurrent && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent-blue" />
                  )}

                  <div className="flex-shrink-0 w-10 h-10 bg-panel rounded flex items-center justify-center">
                    {isDeleting ? (
                      <Loader2 size={20} className="animate-spin text-accent-blue" />
                    ) : (
                      <LayoutDashboard size={20} className="text-accent-blue" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white truncate">
                        {dashboard.name}
                      </p>
                      {isCurrent && (
                        <span className="text-xs text-accent-blue font-semibold">Current</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-white/40">
                        {formatRelativeTime(dashboard.updatedAt)}
                      </p>
                      <span className="text-white/20">•</span>
                      <p className="text-xs text-white/40">
                        {dashboard.widgets?.length || 0} widgets
                      </p>
                    </div>
                  </div>

                  {/* FIXED: Delete button is now a separate div with its own click handler */}
                  {!isCurrent && !isDeleting && (
                    <div 
                      onClick={(e) => handleDelete(e, dashboard.id, dashboard.name)}
                      className="flex-shrink-0 p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-all opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </div>
                  )}

                  {!isCurrent && !isDeleting && (
                    <ArrowRight size={14} className="text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-panel-border bg-panel">
        <button
          onClick={() => {
            onClose();
            navigate('/');
          }}
          className="w-full text-sm text-accent-blue hover:text-accent-blue/80 transition-colors text-center font-medium"
        >
          View All Dashboards
        </button>
      </div>
    </div>
  );
};

export default RecentDashboardsPopover;