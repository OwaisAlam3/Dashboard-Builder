// src/components/Dashboard/WidgetSidebar.jsx - IMPROVED: Better state management, category counts
import React, { useState, useMemo } from 'react';
import { Search, X, Package } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { WIDGET_TYPES, WIDGET_CATEGORIES } from '../../config/widgetRegistry';

const WidgetSidebar = () => {
  const { addWidget, sidebarOpen, toggleSidebar } = useDashboardStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get categories with counts
  const categories = useMemo(() => {
    const widgetsByCategory = {};
    
    Object.values(WIDGET_TYPES).forEach(widget => {
      const category = widget.category || 'other';
      widgetsByCategory[category] = (widgetsByCategory[category] || 0) + 1;
    });

    const cats = [{
      id: 'all',
      label: 'All Widgets',
      order: 0,
      count: Object.values(WIDGET_TYPES).length
    }];

    Object.entries(WIDGET_CATEGORIES)
      .sort((a, b) => a[1].order - b[1].order)
      .forEach(([key, value]) => {
        cats.push({
          id: key,
          label: value.label,
          order: value.order,
          count: widgetsByCategory[key] || 0
        });
      });

    return cats;
  }, []);

  const filteredWidgets = useMemo(() => {
    return Object.values(WIDGET_TYPES).filter(widget => {
      const matchesSearch = 
        widget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        widget.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || widget.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const handleAddWidget = (widgetType) => {
    addWidget(widgetType);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="h-full bg-panel border-r border-panel-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-accent-blue" />
            <h2 className="text-sm font-semibold text-white">Widgets</h2>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-panel-light rounded transition-colors lg:hidden"
            title="Close sidebar"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={14} className="absolute left-2.5 top-2.5 text-white/40 pointer-events-none" />
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-canvas border border-panel-border rounded text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent-blue transition-colors"
          />
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="absolute right-2.5 top-2.5 text-white/40 hover:text-white/70 transition-colors"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                selectedCategory === category.id
                  ? 'bg-accent-blue text-white'
                  : 'bg-panel-light text-white/70 hover:bg-panel-lighter'
              }`}
            >
              <span>{category.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                selectedCategory === category.id
                  ? 'bg-white/20'
                  : 'bg-canvas'
              }`}>
                {category.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Widget List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredWidgets.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto mb-3 text-white/20" size={32} />
            <p className="text-sm text-white/50 mb-1">No widgets found</p>
            <p className="text-xs text-white/30">Try adjusting your search</p>
          </div>
        ) : (
          filteredWidgets.map((widgetType) => (
            <button
              key={widgetType.id}
              onClick={() => handleAddWidget(widgetType)}
              className="w-full p-3 bg-panel-light hover:bg-panel-lighter rounded-lg transition-all duration-200 text-left group hover:shadow-figma active:scale-[0.98]"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-canvas rounded-lg group-hover:bg-accent-blue/10 transition-colors flex-shrink-0">
                  {React.createElement(widgetType.icon, {
                    size: 18,
                    className: 'text-accent-blue'
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-white mb-0.5 group-hover:text-accent-blue transition-colors">
                    {widgetType.name}
                  </h3>
                  <p className="text-xs text-white/50 line-clamp-2">
                    {widgetType.description}
                  </p>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-panel-border bg-canvas/50">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/40">
            {filteredWidgets.length} widget{filteredWidgets.length !== 1 ? 's' : ''}
          </span>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              className="text-accent-blue hover:text-accent-blue/80 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default WidgetSidebar;