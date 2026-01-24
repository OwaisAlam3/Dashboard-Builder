// src/components/Home/DashboardHome.jsx - FIXED: Direct navigation
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Search, LayoutDashboard, Clock, Trash2, Copy, 
  FolderOpen, Loader2, AlertCircle, Sparkles, Grid,
  MoreVertical, Calendar, List
} from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

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
    setShowTemplateSelector,
  } = useDashboardStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updated');
  const [viewMode, setViewMode] = useState('grid');
  const [activeMenu, setActiveMenu] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchDashboards();
  }, [fetchDashboards]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    if (activeMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeMenu]);

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

  const handleCreateNew = async () => {
    setIsCreating(true);
    try {
      const newDashboard = await createDashboard('Untitled Dashboard', []);
      await fetchDashboards();
      navigate(`/dashboard/${newDashboard.id}`);
    } catch (error) {
      console.error('Error creating dashboard:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateFromTemplate = () => {
    setShowTemplateSelector(true);
  };

  const handleOpenDashboard = (dashboardId) => {
    navigate(`/dashboard/${dashboardId}`);
  };

  const handleDuplicate = async (e, dashboardId) => {
    e.stopPropagation();
    setActionLoading(dashboardId);
    try {
      const newDashboard = await duplicateDashboard(dashboardId);
      await fetchDashboards();
      navigate(`/dashboard/${newDashboard.id}`);
    } catch (error) {
      console.error('Error duplicating dashboard:', error);
    } finally {
      setActionLoading(null);
      setActiveMenu(null);
    }
  };

  const handleDelete = async (e, dashboardId, dashboardName) => {
    e.stopPropagation();
    
    if (confirm(`Delete "${dashboardName}"? This action cannot be undone.`)) {
      setActionLoading(dashboardId);
      try {
        await deleteDashboard(dashboardId);
        await fetchDashboards();
      } catch (error) {
        console.error('Error deleting dashboard:', error);
      } finally {
        setActionLoading(null);
        setActiveMenu(null);
      }
    }
  };

  const toggleMenu = (e, dashboardId) => {
    e.stopPropagation();
    setActiveMenu(activeMenu === dashboardId ? null : dashboardId);
  };

  return (
    <div className="min-h-screen bg-canvas text-white">
      <header className="border-b border-panel-border bg-panel/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">My Dashboards</h1>
              <p className="text-white/60">Create and manage your dashboard layouts</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateFromTemplate}
                className="px-4 py-2.5 bg-panel-light hover:bg-panel-lighter rounded-lg transition-colors flex items-center gap-2"
              >
                <Sparkles size={18} />
                <span className="font-medium">From Template</span>
              </button>
              <button
                onClick={handleCreateNew}
                disabled={isCreating}
                className="px-4 py-2.5 bg-accent-blue hover:bg-accent-blue/80 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Plus size={18} />
                )}
                <span className="font-medium">New Dashboard</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                placeholder="Search dashboards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-panel border border-panel-border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-blue transition-colors"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-panel border border-panel-border rounded-lg text-white focus:outline-none focus:border-accent-blue transition-colors cursor-pointer"
            >
              <option value="updated">Last Modified</option>
              <option value="created">Date Created</option>
              <option value="name">Name (A-Z)</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2.5 bg-panel border border-panel-border rounded-lg hover:bg-panel-light transition-colors"
              title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
            >
              {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {dashboardsLoading ? (
          <div className="text-center py-24">
            <Loader2 className="mx-auto mb-4 animate-spin text-accent-blue" size={48} />
            <p className="text-lg text-white/60">Loading dashboards...</p>
          </div>
        ) : dashboardsError ? (
          <div className="text-center py-24">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <p className="text-lg text-white/60 mb-2">Failed to load dashboards</p>
            <p className="text-sm text-white/40 mb-4">{dashboardsError}</p>
            <button
              onClick={fetchDashboards}
              className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredDashboards.length === 0 ? (
          <div className="text-center py-24">
            {searchTerm ? (
              <>
                <div className="text-6xl mb-4 opacity-20">🔍</div>
                <p className="text-lg text-white/60 mb-2">No dashboards found</p>
                <p className="text-sm text-white/40">Try adjusting your search</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4 opacity-20">📊</div>
                <p className="text-lg text-white/60 mb-4">No dashboards yet</p>
                <button
                  onClick={handleCreateNew}
                  className="px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                >
                  <Plus size={20} />
                  <span className="font-medium">Create Your First Dashboard</span>
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

              return (
                <div
                  key={dashboard.id}
                  onClick={() => !isLoading && handleOpenDashboard(dashboard.id)}
                  className={`group relative bg-panel rounded-xl border border-panel-border hover:border-accent-blue/50 transition-all duration-300 cursor-pointer overflow-hidden ${
                    isLoading ? 'opacity-50 pointer-events-none' : 'hover:shadow-2xl hover:scale-[1.02]'
                  } ${viewMode === 'list' ? 'flex items-center' : ''}`}
                >
                  <div className={`bg-gradient-to-br from-accent-blue/20 to-purple-500/20 flex items-center justify-center border-b border-panel-border ${
                    viewMode === 'grid' ? 'aspect-video' : 'w-32 h-32 border-b-0 border-r'
                  }`}>
                    <div className="text-center">
                      <LayoutDashboard size={viewMode === 'grid' ? 48 : 32} className="text-accent-blue mx-auto mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-xs text-white/40">{widgetCount} widget{widgetCount !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className={`p-4 flex-1 ${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-white group-hover:text-accent-blue transition-colors line-clamp-1 flex-1">
                          {dashboard.name}
                        </h3>
                        
                        <div className="relative">
                          <button
                            onClick={(e) => toggleMenu(e, dashboard.id)}
                            className="p-1 hover:bg-panel-light rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical size={16} className="text-white/60" />
                          </button>
                          
                          {activeMenu === dashboard.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-panel-light border border-panel-border rounded-lg shadow-2xl z-20 overflow-hidden">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleOpenDashboard(dashboard.id); }}
                                className="w-full px-4 py-2 text-left hover:bg-panel-lighter transition-colors flex items-center gap-2 text-sm"
                              >
                                <FolderOpen size={16} />
                                Open
                              </button>
                              <button
                                onClick={(e) => handleDuplicate(e, dashboard.id)}
                                className="w-full px-4 py-2 text-left hover:bg-panel-lighter transition-colors flex items-center gap-2 text-sm"
                              >
                                <Copy size={16} />
                                Duplicate
                              </button>
                              <div className="border-t border-panel-border" />
                              <button
                                onClick={(e) => handleDelete(e, dashboard.id, dashboard.name)}
                                className="w-full px-4 py-2 text-left hover:bg-red-500/20 text-red-400 transition-colors flex items-center gap-2 text-sm"
                              >
                                <Trash2 size={16} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className={`flex items-center gap-4 text-xs text-white/50 ${viewMode === 'list' ? '' : 'flex-wrap'}`}>
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{formatRelativeTime(dashboard.updatedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>Created {formatRelativeTime(dashboard.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    {viewMode === 'grid' && (
                      <div className="mt-3 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenDashboard(dashboard.id); }}
                          className="flex-1 px-3 py-1.5 bg-accent-blue/10 hover:bg-accent-blue/20 rounded text-accent-blue text-xs font-medium transition-colors flex items-center justify-center gap-1"
                        >
                          <FolderOpen size={14} />
                          Open
                        </button>
                        <button
                          onClick={(e) => handleDuplicate(e, dashboard.id)}
                          className="px-3 py-1.5 bg-panel-light hover:bg-panel-lighter rounded transition-colors"
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, dashboard.id, dashboard.name)}
                          className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded text-red-400 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {isLoading && (
                    <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm flex items-center justify-center">
                      <Loader2 className="animate-spin text-accent-blue" size={32} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!dashboardsLoading && !dashboardsError && dashboards.length > 0 && (
          <div className="mt-12 pt-8 border-t border-panel-border text-center">
            <p className="text-sm text-white/40">
              {filteredDashboards.length} of {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardHome;