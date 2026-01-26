// src/components/Home/DashboardHome.jsx - PRODUCTION READY: Complete UX/UI Overhaul
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, LayoutDashboard, Clock, Trash2, Copy, 
  FolderOpen, Loader2, AlertCircle, Grid, MoreVertical, 
  Calendar, List, Edit2, Check, X, Sparkles, Filter,
  ArrowUpDown, SortAsc
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import TemplateSelector from '../Templates/TemplateSelector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const DashboardHome = () => {
  const navigate = useNavigate();
  const {
    dashboards,
    dashboardsLoading,
    dashboardsError,
    fetchDashboards,
    createDashboard,
    deleteDashboard,
    duplicateDashboard,
    showTemplateSelector,
    setShowTemplateSelector, // FIXED: Now properly used
  } = useDashboardStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const [activeMenu, setActiveMenu] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [notification, setNotification] = useState(null);
  
  const inputRef = useRef(null);
  const menuTimeoutRef = useRef(null);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  // Enhanced menu closing with debounce
  useEffect(() => {
    if (activeMenu === null) return;

    const handleClickOutside = (e) => {
      if (e.target.closest('.menu-button') || e.target.closest('.menu-dropdown')) {
        return;
      }
      
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
      
      setActiveMenu(null);
    };
    
    menuTimeoutRef.current = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);
    
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenu]);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const filteredDashboards = useMemo(() => {
    let filtered = dashboards.filter(dashboard =>
      dashboard.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'updated':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

    return filtered;
  }, [dashboards, searchTerm, sortBy]);

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
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // FIXED: Now opens template selector
  const handleCreateNew = () => {
    setShowTemplateSelector(true);
  };

  const handleOpenDashboard = (dashboardId) => {
    if (editingId || actionLoading) return;
    navigate(`/dashboard/${dashboardId}`);
  };

  const handleDuplicate = async (e, dashboardId, dashboardName) => {
    e.stopPropagation();
    setActiveMenu(null);
    setActionLoading(dashboardId);
    
    try {
      const newDashboard = await duplicateDashboard(dashboardId);
      await fetchDashboards();
      showNotification(`"${dashboardName}" duplicated successfully`);
      
      setTimeout(() => {
        navigate(`/dashboard/${newDashboard.id}`);
      }, 500);
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
      showNotification('Failed to duplicate dashboard', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (e, dashboardId, dashboardName) => {
    e.stopPropagation();
    setActiveMenu(null);
    
    const confirmed = window.confirm(
      `Delete "${dashboardName}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    setActionLoading(dashboardId);
    try {
      await deleteDashboard(dashboardId);
      await fetchDashboards();
      showNotification(`"${dashboardName}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      showNotification('Failed to delete dashboard', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartRename = (e, dashboard) => {
    e.stopPropagation();
    setActiveMenu(null);
    setEditingId(dashboard.id);
    setEditingName(dashboard.name);
  };

  const handleSaveRename = async (dashboardId) => {
    const trimmedName = editingName.trim();
    
    if (!trimmedName) {
      showNotification('Dashboard name cannot be empty', 'error');
      inputRef.current?.focus();
      return;
    }

    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (!dashboard) return;

    if (trimmedName === dashboard.name) {
      setEditingId(null);
      return;
    }

    setActionLoading(dashboardId);
    try {
      const response = await fetch(`${API_URL}/dashboards/${dashboardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          widgets: dashboard.widgets || []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to rename dashboard');
      }

      await fetchDashboards();
      setEditingId(null);
      showNotification(`Renamed to "${trimmedName}"`);
    } catch (error) {
      console.error('Error renaming dashboard:', error);
      showNotification('Failed to rename dashboard', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelRename = (e) => {
    if (e) e.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  const toggleMenu = (e, dashboardId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === dashboardId ? null : dashboardId);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector('input[type="text"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen bg-canvas text-white overflow-auto flex flex-col">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-2xl animate-slideIn flex items-center gap-3 ${
          notification.type === 'error' 
            ? 'bg-red-500/95 backdrop-blur-sm' 
            : 'bg-green-500/95 backdrop-blur-sm'
        }`}>
          {notification.type === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <Check size={18} />
          )}
          <span className="text-sm font-medium text-white">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-panel-border bg-panel/80 backdrop-blur-md sticky top-0 z-20 shadow-xl flex-shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-white/70 bg-clip-text">
                My Dashboards
              </h1>
              <p className="text-white/60 text-sm">Create and manage your dashboard layouts</p>
            </div>
            <button
              onClick={handleCreateNew}
              disabled={isCreating}
              className="group px-5 py-3 bg-accent-blue hover:bg-accent-blue/90 rounded-lg transition-all flex items-center gap-2.5 disabled:opacity-50 shadow-lg hover:shadow-xl active:scale-95 disabled:active:scale-100"
            >
              {isCreating ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              )}
              <span className="font-semibold">New Dashboard</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search dashboards... (Cmd+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-panel border border-panel-border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-panel border border-panel-border rounded-lg text-white text-sm focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 transition-all cursor-pointer hover:bg-panel-light"
            >
              <option value="updated">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2.5 bg-panel border border-panel-border rounded-lg hover:bg-panel-light active:scale-95 transition-all"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 overflow-auto">
        {dashboardsLoading ? (
          <div className="text-center py-24">
            <Loader2 className="mx-auto mb-4 animate-spin text-accent-blue" size={48} />
            <p className="text-lg text-white/60">Loading dashboards...</p>
          </div>
        ) : dashboardsError ? (
          <div className="text-center py-24">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <p className="text-lg text-white/60 mb-2">Failed to load dashboards</p>
            <p className="text-sm text-white/40 mb-6">{dashboardsError}</p>
            <button
              onClick={fetchDashboards}
              className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 rounded-lg transition-all active:scale-95"
            >
              Retry
            </button>
          </div>
        ) : filteredDashboards.length === 0 ? (
          <div className="text-center py-24">
            {searchTerm ? (
              <>
                <Search className="mx-auto mb-4 text-white/20" size={64} />
                <p className="text-lg text-white/60 mb-2">No dashboards found</p>
                <p className="text-sm text-white/40 mb-6">Try a different search term</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 bg-panel hover:bg-panel-light rounded-lg transition-all active:scale-95 text-sm"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <LayoutDashboard className="mx-auto mb-4 text-white/20" size={64} />
                <p className="text-lg text-white/60 mb-2">No dashboards yet</p>
                <p className="text-sm text-white/40 mb-6">Create your first dashboard to get started</p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/90 rounded-lg transition-all flex items-center gap-2.5 mx-auto shadow-lg hover:shadow-xl active:scale-95"
                >
                  <Sparkles size={20} />
                  <span className="font-semibold">Create Your First Dashboard</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
          }>
            {filteredDashboards.map((dashboard) => {
              const widgetCount = dashboard.widgets?.length || 0;
              const isLoading = actionLoading === dashboard.id;
              const isEditing = editingId === dashboard.id;

              return (
                <div
                  key={dashboard.id}
                  onClick={() => !isLoading && !isEditing && handleOpenDashboard(dashboard.id)}
                  className={`group relative bg-panel rounded-xl border border-panel-border transition-all duration-300 overflow-hidden ${
                    isLoading ? 'opacity-50 pointer-events-none' : 'hover:border-accent-blue/50 hover:shadow-2xl hover:scale-[1.02] cursor-pointer'
                  } ${viewMode === 'list' ? 'flex items-center' : ''} ${isEditing ? 'ring-2 ring-accent-blue' : ''}`}
                >
                  {/* Thumbnail */}
                  <div className={`bg-gradient-to-br from-accent-blue/20 to-purple-500/20 flex items-center justify-center border-panel-border relative overflow-hidden ${
                    viewMode === 'grid' ? 'aspect-video border-b' : 'w-32 h-32 flex-shrink-0 border-r'
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="text-center relative z-10">
                      <LayoutDashboard 
                        size={viewMode === 'grid' ? 48 : 36} 
                        className="text-accent-blue mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" 
                      />
                      <p className="text-xs text-white/40 font-medium">
                        {widgetCount} widget{widgetCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex items-center justify-between gap-4' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex-1 min-w-0' : ''}>
                      {/* Title / Edit Mode */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {isEditing ? (
                          <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              ref={inputRef}
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveRename(dashboard.id);
                                if (e.key === 'Escape') handleCancelRename();
                              }}
                              className="flex-1 px-3 py-1.5 bg-canvas border-2 border-accent-blue rounded text-white text-sm focus:outline-none"
                              maxLength={100}
                              placeholder="Dashboard name..."
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveRename(dashboard.id);
                              }}
                              className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition-colors active:scale-95"
                              title="Save"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCancelRename(e);
                              }}
                              className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors active:scale-95"
                              title="Cancel"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <h3 className="font-semibold text-white group-hover:text-accent-blue transition-colors line-clamp-2 flex-1 min-w-0 break-words">
                              {dashboard.name}
                            </h3>
                            
                            {/* Menu Button */}
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => toggleMenu(e, dashboard.id)}
                                className="menu-button p-1.5 hover:bg-panel-light rounded transition-colors opacity-0 group-hover:opacity-100 active:scale-95"
                                title="More options"
                              >
                                <MoreVertical size={16} className="text-white/60" />
                              </button>
                              
                              {/* Dropdown Menu */}
                              {activeMenu === dashboard.id && (
                                <div 
                                  className="menu-dropdown absolute right-0 mt-2 w-48 bg-panel-light border border-panel-border rounded-lg shadow-2xl z-50 overflow-hidden animate-slideIn"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setActiveMenu(null);
                                      handleOpenDashboard(dashboard.id); 
                                    }}
                                    className="w-full px-4 py-2.5 text-left hover:bg-panel-lighter transition-colors flex items-center gap-3 text-sm text-white"
                                  >
                                    <FolderOpen size={16} className="text-accent-blue" />
                                    <span>Open</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleStartRename(e, dashboard)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-panel-lighter transition-colors flex items-center gap-3 text-sm text-white"
                                  >
                                    <Edit2 size={16} className="text-blue-400" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    onClick={(e) => handleDuplicate(e, dashboard.id, dashboard.name)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-panel-lighter transition-colors flex items-center gap-3 text-sm text-white"
                                  >
                                    <Copy size={16} className="text-green-400" />
                                    <span>Duplicate</span>
                                  </button>
                                  <div className="h-px bg-panel-border my-1" />
                                  <button
                                    onClick={(e) => handleDelete(e, dashboard.id, dashboard.name)}
                                    className="w-full px-4 py-2.5 text-left hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-3 text-sm"
                                  >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Meta Information */}
                      {!isEditing && (
                        <div className={`flex items-center gap-4 text-xs text-white/50 ${viewMode === 'list' ? '' : 'flex-wrap'}`}>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} />
                            <span>Updated {formatRelativeTime(dashboard.updatedAt)}</span>
                          </div>
                          {viewMode === 'grid' && (
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} />
                              <span>Created {formatRelativeTime(dashboard.createdAt)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Grid View Actions */}
                    {viewMode === 'grid' && !isEditing && (
                      <div className="mt-4 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleOpenDashboard(dashboard.id); 
                          }}
                          className="flex-1 px-3 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 rounded text-accent-blue text-xs font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <FolderOpen size={14} />
                          <span>Open</span>
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(e, dashboard.id, dashboard.name)}
                          className="px-3 py-2 bg-panel-light hover:bg-panel-lighter rounded transition-all active:scale-95"
                          title="Duplicate"
                        >
                          <Copy size={14} className="text-white/70" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, dashboard.id, dashboard.name)}
                          className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 transition-all active:scale-95"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}

                    {/* List View Actions */}
                    {viewMode === 'list' && !isEditing && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleOpenDashboard(dashboard.id); 
                          }}
                          className="px-4 py-2 bg-accent-blue/10 hover:bg-accent-blue/20 rounded text-accent-blue text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                        >
                          <FolderOpen size={14} />
                          <span>Open</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Loading Overlay */}
                  {isLoading && (
                    <div className="absolute inset-0 bg-canvas/95 backdrop-blur-sm flex items-center justify-center z-20">
                      <div className="text-center">
                        <Loader2 className="mx-auto mb-2 animate-spin text-accent-blue" size={32} />
                        <p className="text-sm text-white/60">Processing...</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Stats */}
        {!dashboardsLoading && !dashboardsError && dashboards.length > 0 && (
          <div className="mt-12 pt-8 border-t border-panel-border text-center">
            <p className="text-sm text-white/50">
              Showing <span className="text-white/70 font-medium">{filteredDashboards.length}</span> of{' '}
              <span className="text-white/70 font-medium">{dashboards.length}</span> dashboard{dashboards.length !== 1 ? 's' : ''}
              {searchTerm && (
                <>
                  {' '}matching <span className="text-accent-blue font-medium">"{searchTerm}"</span>
                </>
              )}
            </p>
          </div>
        )}
      </main>

      {/* Template Selector Modal */}
      {showTemplateSelector && <TemplateSelector />}
    </div>
  );
};

export default DashboardHome;