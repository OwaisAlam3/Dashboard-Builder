// src/components/Templates/TemplateSelector.jsx - IMPROVED: Better visuals, keyboard navigation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Sparkles, AlertCircle, Loader2, LayoutDashboard, ArrowRight } from 'lucide-react';
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
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Get unique categories
  const categories = React.useMemo(() => {
    const uniqueCategories = new Set();
    templates.forEach(template => {
      if (template.category) {
        uniqueCategories.add(template.category);
      }
    });
    
    return [
      { id: 'all', name: 'All Templates', icon: LayoutDashboard },
      ...Array.from(uniqueCategories).sort().map(cat => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
        icon: LayoutDashboard
      }))
    ];
  }, [templates]);

  // Sort templates: blank first, then by name
  const sortedTemplates = React.useMemo(() => {
    const blankTemplate = templates.find(t => t.id === 'blank');
    const otherTemplates = templates.filter(t => t.id !== 'blank').sort((a, b) => a.name.localeCompare(b.name));
    return blankTemplate ? [blankTemplate, ...otherTemplates] : templates;
  }, [templates]);

  const filteredTemplates = sortedTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory || template.id === 'blank';
    const matchesSearch = 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCreating || filteredTemplates.length === 0) return;

      const gridColumns = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredTemplates.length - 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + gridColumns, filteredTemplates.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - gridColumns, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTemplates[selectedIndex]) {
            handleSelectTemplate(filteredTemplates[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (!isCreating) {
            setShowTemplateSelector(false);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreating, filteredTemplates, selectedIndex, setShowTemplateSelector]);

  const handleSelectTemplate = async (template) => {
    setIsCreating(true);
    try {
      const dashboard = await loadTemplate(template);
      setShowTemplateSelector(false);
      navigate(`/dashboard/${dashboard.id}`);
    } catch (error) {
      console.error('Error creating dashboard from template:', error);
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-panel rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
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
              title="Close (Esc)"
            >
              <X size={20} className="text-white/70" />
            </button>
          </div>

          {/* Search */}
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                disabled={isCreating}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSelectedIndex(0);
                  }}
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

          {/* Helper text */}
          {!isCreating && filteredTemplates.length > 0 && (
            <p className="mt-3 text-xs text-white/40 text-center">
              Use arrow keys to navigate • Enter to select • Esc to close
            </p>
          )}
        </div>

        {/* Content */}
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
              <Search className="mx-auto mb-4 text-white/20" size={64} />
              <p className="text-lg text-white/60">No templates found</p>
              <p className="text-sm text-white/40 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template, index) => {
                const isBlank = template.id === 'blank';
                const widgetCount = template.widgets?.length || 0;
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    disabled={isCreating}
                    className={`group relative bg-panel-light rounded-xl overflow-hidden hover:bg-panel-lighter transition-all duration-300 text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                      isBlank ? 'ring-2 ring-accent-blue' : ''
                    } ${isSelected ? 'ring-2 ring-accent-blue shadow-2xl scale-[1.02]' : 'hover:shadow-2xl hover:scale-[1.02]'}`}
                  >
                    {/* Badge */}
                    {isBlank && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-accent-blue text-white text-xs font-semibold rounded-full z-10">
                        Start Here
                      </div>
                    )}

                    {/* Selected indicator */}
                    {isSelected && !isBlank && (
                      <div className="absolute top-3 right-3 px-2.5 py-1 bg-accent-blue/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full z-10 flex items-center gap-1">
                        <span>Press Enter</span>
                        <ArrowRight size={12} />
                      </div>
                    )}

                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-accent-blue/20 to-purple-500/20 flex items-center justify-center border-b border-panel-border relative overflow-hidden">
                      <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                        {template.thumbnail}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-semibold text-white mb-2 group-hover:text-accent-blue transition-colors text-base">
                        {template.name}
                      </h3>
                      <p className="text-sm text-white/60 line-clamp-2 mb-3">
                        {template.description || 'No description available'}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <span className="text-xs text-white/40">
                          {widgetCount} widget{widgetCount !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs font-medium text-accent-blue group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Use Template
                          <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>

                    <div className="absolute inset-0 bg-accent-blue/0 group-hover:bg-accent-blue/5 transition-colors pointer-events-none" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isCreating && (
          <div className="absolute inset-0 bg-canvas/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="mx-auto mb-4 animate-spin text-accent-blue" size={48} />
              <p className="text-lg text-white font-medium">Creating your dashboard...</p>
              <p className="text-sm text-white/50 mt-2">This will only take a moment</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-panel-border bg-canvas/50">
          <p className="text-xs text-white/40 text-center">
            All templates are fully customizable after creation
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;