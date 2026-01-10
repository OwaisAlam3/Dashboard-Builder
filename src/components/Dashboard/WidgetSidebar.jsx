import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { WIDGET_TYPES } from '../../config/widgetRegistry';

const WidgetSidebar = () => {
  const { addWidget, sidebarOpen, toggleSidebar } = useDashboardStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => {
    const cats = new Set(['all']);
    Object.values(WIDGET_TYPES).forEach(w => cats.add(w.category));
    return Array.from(cats);
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

  if (!sidebarOpen) return null;

  return (
    <aside className="h-full bg-panel border-r border-panel-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">Widgets</h2>
          <button
            onClick={toggleSidebar}
            className="p-1 hover:bg-panel-light rounded transition-colors lg:hidden"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-white/40" />
          <input
            type="text"
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-canvas border border-panel-border rounded text-sm text-white placeholder-white/40 focus:outline-none focus:border-accent-blue transition-colors"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-accent-blue text-white'
                  : 'bg-panel-light text-white/70 hover:bg-panel-lighter'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Widget List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredWidgets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-white/50">No widgets found</p>
          </div>
        ) : (
          filteredWidgets.map((widgetType) => (
            <button
              key={widgetType.id}
              onClick={() => handleAddWidget(widgetType)}
              className="w-full p-3 bg-panel-light hover:bg-panel-lighter rounded-lg transition-all duration-200 text-left group hover:shadow-figma"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-canvas rounded-lg group-hover:bg-accent-blue/10 transition-colors">
                  {React.createElement(widgetType.icon, {
                    size: 18,
                    className: 'text-accent-blue'
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-white mb-0.5">
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
        <p className="text-xs text-white/40 text-center">
          {filteredWidgets.length} widget{filteredWidgets.length !== 1 ? 's' : ''}
        </p>
      </div>
    </aside>
  );
};

export default WidgetSidebar;