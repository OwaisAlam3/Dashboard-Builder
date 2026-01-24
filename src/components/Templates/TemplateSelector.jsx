// src/components/Templates/TemplateSelector.jsx - FIXED: Creates dashboard immediately
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Sparkles, AlertCircle, Loader2, LayoutDashboard } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';

const TemplateSelector = () => {
  const navigate = useNavigate();
  const { 
    setShowTemplateSelector, 
    loadTemplate,
    templates,
    templatesLoading,
    templatesError,
    fetchTemplates
  } = useDashboardStore();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const categories = React.useMemo(() => {
    const uniqueCategories = new Set();
    templates.forEach(template => {
      if (template.category) {
        uniqueCategories.add(template.category);
      }
    });
    
    return [
      { id: 'all', name: 'All Templates', icon: LayoutDashboard },
      ...Array.from(uniqueCategories).map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        icon: LayoutDashboard
      }))
    ];
  }, [templates]);

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory || template.id === 'blank';
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSelectTemplate = async (template) => {
    setIsCreating(true);
    try {
      const dashboard = await loadTemplate(template);
      setShowTemplateSelector(false);
      navigate(`/dashboard/${dashboard.id}`);
    } catch (error) {
      console.error('Error creating dashboard from template:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-panel rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        <div className="p-6 border-b border-panel-border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent-blue/10 rounded-lg">
                  <Sparkles className="text-accent-blue" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Choose a Template</h2>
                  <p className="text-sm text-white/60">Start with a professional layout or build from scratch</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowTemplateSelector(false)}
              className="p-2 hover:bg-panel-light rounded-lg transition-colors"
              disabled={isCreating}
            >
              <X size={20} className="text-white/70" />
            </button>
          </div>

          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isCreating}
              className="w-full pl-10 pr-4 py-3 bg-canvas border border-panel-border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-accent-blue transition-colors disabled:opacity-50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={isCreating}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all disabled:opacity-50 ${
                    selectedCategory === category.id
                      ? 'bg-accent-blue text-white shadow-lg'
                      : 'bg-panel-light text-white/70 hover:bg-panel-lighter'
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {templatesLoading ? (
            <div className="text-center py-16">
              <Loader2 className="mx-auto mb-4 animate-spin text-accent-blue" size={48} />
              <p className="text-lg text-white/60">Loading templates...</p>
            </div>
          ) : templatesError ? (
            <div className="text-center py-16">
              <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
              <p className="text-lg text-white/60 mb-2">Failed to load templates</p>
              <p className="text-sm text-white/40 mb-4">{templatesError}</p>
              <button
                onClick={fetchTemplates}
                className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-20">🔍</div>
              <p className="text-lg text-white/60">No templates found</p>
              <p className="text-sm text-white/40 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => {
                const Icon = template.icon || LayoutDashboard;
                const thumbnail = template.thumbnail || '🎨';
                
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    disabled={isCreating}
                    className="group relative bg-panel-light rounded-xl overflow-hidden hover:bg-panel-lighter transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] text-left disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="aspect-video bg-gradient-to-br from-accent-blue/20 to-purple-500/20 flex items-center justify-center border-b border-panel-border">
                      <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                        {thumbnail}
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start gap-3 mb-2">
                        <div className="p-2 bg-accent-blue/10 rounded-lg group-hover:bg-accent-blue/20 transition-colors">
                          {typeof Icon === 'string' ? (
                            <LayoutDashboard size={20} className="text-accent-blue" />
                          ) : (
                            <Icon size={20} className="text-accent-blue" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 group-hover:text-accent-blue transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-white/60 line-clamp-2">
                            {template.description || 'No description available'}
                          </p>
                        </div>
                      </div>

                      {template.widgets && template.widgets.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/5">
                          <p className="text-xs text-white/40">
                            {template.widgets.length} widget{template.widgets.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="absolute inset-0 bg-accent-blue/0 group-hover:bg-accent-blue/5 transition-colors pointer-events-none" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {isCreating && (
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 animate-spin text-accent-blue" size={48} />
              <p className="text-lg text-white">Creating dashboard...</p>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-panel-border bg-canvas/50">
          <p className="text-xs text-white/40 text-center">
            You can customize any template after selection
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;