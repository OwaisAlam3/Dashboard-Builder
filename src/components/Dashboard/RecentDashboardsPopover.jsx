// src/components/Dashboard/RecentDashboardsPopover.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2, Loader2, LayoutDashboard } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const RecentDashboardsPopover = ({ anchorRef, onClose }) => {
  const navigate = useNavigate();
  const popoverRef = useRef(null);
  const {
    dashboards,
    fetchDashboards,
    deleteDashboard,
    saveToLocalStorage,
    currentDashboardId,
    clearSelection,
  } = useDashboardStore();

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const loadDashboards = async () => {
      setLoading(true);
      await fetchDashboards();
      setLoading(false);
    };
    loadDashboards();
  }, [fetchDashboards]);

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

  // Position popover
  useEffect(() => {
    if (anchorRef.current && popoverRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const popover = popoverRef.current;
      
      popover.style.top = `${anchorRect.bottom + 8}px`;
      popover.style.left = `${anchorRect.left}px`;
    }
  }, [anchorRef]);

  const handleOpenDashboard = async (dashboardId) => {
    if (dashboardId === currentDashboardId) {
      onClose();
      return;
    }

    // Save current dashboard
    try {
      saveToLocalStorage();
      clearSelection();
      onClose();
      navigate(`/dashboard/${dashboardId}`);
    } catch (error) {
      console.error('Error switching dashboard:', error);
    }
  };

  const handleDelete = async (e, dashboardId, dashboardName) => {
    e.stopPropagation();
    
    if (!confirm(`Delete "${dashboardName}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(dashboardId);
    try {
      await deleteDashboard(dashboardId);
      await fetchDashboards();
      
      // If deleted current dashboard, go home
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

  // Sort by most recent
  const recentDashboards = [...dashboards]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 10);

  return (
    <div
      ref={popoverRef}
      className="fixed z-[100] w-80 bg-panel-light border border-panel-border rounded-lg shadow-2xl overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-panel-border bg-panel">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Clock size={16} />
          Recent Dashboards
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="mx-auto animate-spin text-accent-blue" size={24} />
          </div>
        ) : recentDashboards.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-sm">
            No recent dashboards
          </div>
        ) : (
          <div className="py-1">
            {recentDashboards.map((dashboard) => {
              const isCurrent = dashboard.id === currentDashboardId;
              const isDeleting = deleting === dashboard.id;

              return (
                <button
                  key={dashboard.id}
                  onClick={() => handleOpenDashboard(dashboard.id)}
                  disabled={isDeleting}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-panel transition-colors text-left group ${
                    isCurrent ? 'bg-accent-blue/10 border-l-2 border-accent-blue' : ''
                  } ${isDeleting ? 'opacity-50' : ''}`}
                >
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
                        <span className="text-xs text-accent-blue">Current</span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      {formatRelativeTime(dashboard.updatedAt)}
                    </p>
                  </div>

                  {!isCurrent && (
                    <button
                      onClick={(e) => handleDelete(e, dashboard.id, dashboard.name)}
                      className="flex-shrink-0 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-red-400 rounded transition-all"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </button>
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
          className="w-full text-sm text-accent-blue hover:text-accent-blue/80 transition-colors text-center"
        >
          View All Dashboards
        </button>
      </div>
    </div>
  );
};

export default RecentDashboardsPopover;