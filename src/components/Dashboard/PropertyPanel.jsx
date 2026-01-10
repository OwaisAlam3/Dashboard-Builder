import React, { useMemo, useCallback } from 'react';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { WIDGET_TYPES } from '../../config/widgetRegistry';

const PropertyPanel = () => {
  const { 
    selectedWidgetIds, 
    widgets, 
    deselectAll, 
    updateWidget,
    updateWidgetData,
    propertyPanelOpen 
  } = useDashboardStore();

  const [expandedSections, setExpandedSections] = React.useState({
    position: true,
    size: true,
    appearance: true,
    content: true,
  });

  const selectedWidget = useMemo(() => {
    if (selectedWidgetIds.length === 1) {
      return widgets.find(w => w.id === selectedWidgetIds[0]);
    }
    return null;
  }, [selectedWidgetIds, widgets]);

  const widgetType = useMemo(() => {
    if (selectedWidget) {
      return WIDGET_TYPES[selectedWidget.type];
    }
    return null;
  }, [selectedWidget]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // FIXED: Prevent event bubbling
  const handleDataChange = useCallback((key, value) => {
    if (selectedWidget) {
      updateWidgetData(selectedWidget.id, { [key]: value });
    }
  }, [selectedWidget, updateWidgetData]);

  const handlePositionChange = useCallback((axis, value) => {
    if (selectedWidget) {
      updateWidget(selectedWidget.id, {
        position: {
          ...selectedWidget.position,
          [axis]: parseFloat(value) || 0
        }
      });
    }
  }, [selectedWidget, updateWidget]);

  const handleSizeChange = useCallback((dimension, value) => {
    if (selectedWidget) {
      updateWidget(selectedWidget.id, {
        size: {
          ...selectedWidget.size,
          [dimension]: parseFloat(value) || 100
        }
      });
    }
  }, [selectedWidget, updateWidget]);

  // FIXED: Stop propagation on all inputs
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  if (!propertyPanelOpen || !selectedWidget) return null;

  const Section = ({ title, section, children }) => (
    <div className="border-b border-panel-border last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-3 hover:bg-panel-light transition-colors text-left"
      >
        <span className="text-sm font-medium text-white">{title}</span>
        {expandedSections[section] ? 
          <ChevronDown size={14} className="text-white/50" /> : 
          <ChevronRight size={14} className="text-white/50" />
        }
      </button>
      {expandedSections[section] && (
        <div className="px-3 pb-3 space-y-3" onMouseDown={stopPropagation} onKeyDown={stopPropagation}>
          {children}
        </div>
      )}
    </div>
  );

  const Input = ({ label, value, onChange, type = "text", min, max, step = 1 }) => (
    <div>
      <label className="block text-xs font-medium text-white/70 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={stopPropagation}
        onKeyDown={stopPropagation}
        min={min}
        max={max}
        step={step}
        className="w-full px-2.5 py-1.5 bg-canvas border border-panel-border rounded text-sm text-white focus:outline-none focus:border-accent-blue transition-colors"
      />
    </div>
  );

  const ColorInput = ({ label, value, onChange }) => (
    <div>
      <label className="block text-xs font-medium text-white/70 mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={stopPropagation}
          className="w-12 h-9 rounded cursor-pointer bg-canvas border border-panel-border"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={stopPropagation}
          onKeyDown={stopPropagation}
          className="flex-1 px-2.5 py-1.5 bg-canvas border border-panel-border rounded text-sm text-white focus:outline-none focus:border-accent-blue transition-colors"
        />
      </div>
    </div>
  );

  const Select = ({ label, value, onChange, options }) => (
    <div>
      <label className="block text-xs font-medium text-white/70 mb-1.5">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={stopPropagation}
        className="w-full px-2.5 py-1.5 bg-canvas border border-panel-border rounded text-sm text-white focus:outline-none focus:border-accent-blue transition-colors"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const Textarea = ({ label, value, onChange, rows = 4 }) => (
    <div>
      <label className="block text-xs font-medium text-white/70 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={stopPropagation}
        onKeyDown={stopPropagation}
        rows={rows}
        className="w-full px-2.5 py-1.5 bg-canvas border border-panel-border rounded text-sm text-white focus:outline-none focus:border-accent-blue transition-colors resize-none"
      />
    </div>
  );

  const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer" onMouseDown={stopPropagation}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-panel-border bg-canvas checked:bg-accent-blue focus:ring-2 focus:ring-accent-blue/50"
      />
      <span className="text-sm text-white/80">{label}</span>
    </label>
  );

  return (
    <aside className="h-full bg-panel border-l border-panel-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-panel-border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {widgetType && React.createElement(widgetType.icon, {
              size: 18,
              className: 'text-accent-blue'
            })}
            <div>
              <h2 className="text-sm font-semibold text-white">Properties</h2>
              <p className="text-xs text-white/50">{widgetType?.name || 'Widget'}</p>
            </div>
          </div>
          <button
            onClick={deselectAll}
            className="p-1 hover:bg-panel-light rounded transition-colors"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Position & Size */}
        <Section title="Position & Size" section="position">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="X"
              type="number"
              value={selectedWidget.position.x}
              onChange={(val) => handlePositionChange('x', val)}
            />
            <Input
              label="Y"
              type="number"
              value={selectedWidget.position.y}
              onChange={(val) => handlePositionChange('y', val)}
            />
          </div>
        </Section>

        <Section title="Size" section="size">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Width"
              type="number"
              value={selectedWidget.size.width}
              onChange={(val) => handleSizeChange('width', val)}
              min={100}
            />
            <Input
              label="Height"
              type="number"
              value={selectedWidget.size.height}
              onChange={(val) => handleSizeChange('height', val)}
              min={80}
            />
          </div>
          <Input
            label="Rotation"
            type="number"
            value={selectedWidget.rotation || 0}
            onChange={(val) => updateWidget(selectedWidget.id, { rotation: parseFloat(val) || 0 })}
            min={-180}
            max={180}
            step={1}
          />
          <Input
            label="Opacity"
            type="number"
            value={selectedWidget.opacity || 1}
            onChange={(val) => updateWidget(selectedWidget.id, { opacity: Math.max(0, Math.min(1, parseFloat(val) || 1)) })}
            min={0}
            max={1}
            step={0.1}
          />
        </Section>

        {/* Widget-Specific Properties - Same as before */}
        {selectedWidget.type === 'container' && (
          <>
            <Section title="Content" section="content">
              <Input
                label="Title"
                value={selectedWidget.data.title || ''}
                onChange={(val) => handleDataChange('title', val)}
              />
            </Section>
            <Section title="Appearance" section="appearance">
              <ColorInput
                label="Background Color"
                value={selectedWidget.data.bgColor || '#ffffff'}
                onChange={(val) => handleDataChange('bgColor', val)}
              />
              <ColorInput
                label="Border Color"
                value={selectedWidget.data.borderColor || '#e2e8f0'}
                onChange={(val) => handleDataChange('borderColor', val)}
              />
              <Input
                label="Border Width"
                type="number"
                value={selectedWidget.data.borderWidth || 1}
                onChange={(val) => handleDataChange('borderWidth', parseFloat(val))}
                min={0}
                max={10}
              />
              <Input
                label="Border Radius"
                type="number"
                value={selectedWidget.data.borderRadius || 8}
                onChange={(val) => handleDataChange('borderRadius', parseFloat(val))}
                min={0}
                max={50}
              />
              <Select
                label="Shadow"
                value={selectedWidget.data.shadow || 'md'}
                onChange={(val) => handleDataChange('shadow', val)}
                options={[
                  { value: 'none', label: 'None' },
                  { value: 'sm', label: 'Small' },
                  { value: 'md', label: 'Medium' },
                  { value: 'lg', label: 'Large' },
                  { value: 'xl', label: 'Extra Large' },
                ]}
              />
            </Section>
          </>
        )}

        {selectedWidget.type === 'card' && (
          <>
            <Section title="Content" section="content">
              <Input
                label="Title"
                value={selectedWidget.data.title || ''}
                onChange={(val) => handleDataChange('title', val)}
              />
              <Textarea
                label="Content"
                value={selectedWidget.data.content || ''}
                onChange={(val) => handleDataChange('content', val)}
                rows={6}
              />
            </Section>
            <Section title="Appearance" section="appearance">
              <ColorInput
                label="Background Color"
                value={selectedWidget.data.bgColor || '#ffffff'}
                onChange={(val) => handleDataChange('bgColor', val)}
              />
              <Select
                label="Title Size"
                value={selectedWidget.data.titleSize || 'lg'}
                onChange={(val) => handleDataChange('titleSize', val)}
                options={[
                  { value: 'sm', label: 'Small' },
                  { value: 'md', label: 'Medium' },
                  { value: 'lg', label: 'Large' },
                  { value: 'xl', label: 'Extra Large' },
                ]}
              />
              <ColorInput
                label="Title Color"
                value={selectedWidget.data.titleColor || '#1e293b'}
                onChange={(val) => handleDataChange('titleColor', val)}
              />
              <ColorInput
                label="Text Color"
                value={selectedWidget.data.textColor || '#64748b'}
                onChange={(val) => handleDataChange('textColor', val)}
              />
            </Section>
          </>
        )}

        {selectedWidget.type === 'stats' && (
          <>
            <Section title="Content" section="content">
              <Input
                label="Label"
                value={selectedWidget.data.title || ''}
                onChange={(val) => handleDataChange('title', val)}
              />
              <Input
                label="Value"
                value={selectedWidget.data.value || ''}
                onChange={(val) => handleDataChange('value', val)}
              />
              <Input
                label="Change"
                value={selectedWidget.data.change || ''}
                onChange={(val) => handleDataChange('change', val)}
              />
              <Input
                label="Description"
                value={selectedWidget.data.description || ''}
                onChange={(val) => handleDataChange('description', val)}
              />
            </Section>
            <Section title="Appearance" section="appearance">
              <ColorInput
                label="Background Color"
                value={selectedWidget.data.bgColor || '#ffffff'}
                onChange={(val) => handleDataChange('bgColor', val)}
              />
              <ColorInput
                label="Accent Color"
                value={selectedWidget.data.accentColor || '#3b82f6'}
                onChange={(val) => handleDataChange('accentColor', val)}
              />
              <Select
                label="Icon"
                value={selectedWidget.data.icon || 'trending-up'}
                onChange={(val) => handleDataChange('icon', val)}
                options={[
                  { value: 'trending-up', label: 'Trending Up' },
                  { value: 'trending-down', label: 'Trending Down' },
                  { value: 'dollar-sign', label: 'Dollar' },
                  { value: 'users', label: 'Users' },
                  { value: 'shopping-cart', label: 'Shopping' },
                  { value: 'activity', label: 'Activity' },
                ]}
              />
            </Section>
          </>
        )}

        {selectedWidget.type === 'chart' && (
          <>
            <Section title="Content" section="content">
              <Input
                label="Title"
                value={selectedWidget.data.title || ''}
                onChange={(val) => handleDataChange('title', val)}
              />
              <Select
                label="Chart Type"
                value={selectedWidget.data.chartType || 'line'}
                onChange={(val) => handleDataChange('chartType', val)}
                options={[
                  { value: 'line', label: 'Line Chart' },
                  { value: 'bar', label: 'Bar Chart' },
                  { value: 'area', label: 'Area Chart' },
                  { value: 'pie', label: 'Pie Chart' },
                ]}
              />
            </Section>
            <Section title="Appearance" section="appearance">
              <ColorInput
                label="Background Color"
                value={selectedWidget.data.bgColor || '#ffffff'}
                onChange={(val) => handleDataChange('bgColor', val)}
              />
              <ColorInput
                label="Primary Color"
                value={selectedWidget.data.primaryColor || '#3b82f6'}
                onChange={(val) => handleDataChange('primaryColor', val)}
              />
              <ColorInput
                label="Secondary Color"
                value={selectedWidget.data.secondaryColor || '#8b5cf6'}
                onChange={(val) => handleDataChange('secondaryColor', val)}
              />
              <Checkbox
                label="Show Grid"
                checked={selectedWidget.data.showGrid !== false}
                onChange={(val) => handleDataChange('showGrid', val)}
              />
              <Checkbox
                label="Show Legend"
                checked={selectedWidget.data.showLegend !== false}
                onChange={(val) => handleDataChange('showLegend', val)}
              />
            </Section>
          </>
        )}

        {selectedWidget.type === 'image' && (
          <>
            <Section title="Content" section="content">
              <Input
                label="Image URL"
                value={selectedWidget.data.url || ''}
                onChange={(val) => handleDataChange('url', val)}
              />
              <Input
                label="Alt Text"
                value={selectedWidget.data.alt || ''}
                onChange={(val) => handleDataChange('alt', val)}
              />
            </Section>
            <Section title="Appearance" section="appearance">
              <Select
                label="Object Fit"
                value={selectedWidget.data.objectFit || 'cover'}
                onChange={(val) => handleDataChange('objectFit', val)}
                options={[
                  { value: 'cover', label: 'Cover' },
                  { value: 'contain', label: 'Contain' },
                  { value: 'fill', label: 'Fill' },
                  { value: 'none', label: 'None' },
                ]}
              />
              <Input
                label="Border Radius"
                type="number"
                value={selectedWidget.data.borderRadius || 8}
                onChange={(val) => handleDataChange('borderRadius', parseFloat(val))}
                min={0}
                max={50}
              />
              <Checkbox
                label="Show Caption"
                checked={selectedWidget.data.showCaption || false}
                onChange={(val) => handleDataChange('showCaption', val)}
              />
              {selectedWidget.data.showCaption && (
                <Input
                  label="Caption"
                  value={selectedWidget.data.caption || ''}
                  onChange={(val) => handleDataChange('caption', val)}
                />
              )}
            </Section>
          </>
        )}

        {(selectedWidget.type === 'calendar' || selectedWidget.type === 'map') && (
          <>
            <Section title="Content" section="content">
              <Input
                label="Title"
                value={selectedWidget.data.title || ''}
                onChange={(val) => handleDataChange('title', val)}
              />
            </Section>
            <Section title="Appearance" section="appearance">
              <ColorInput
                label="Background Color"
                value={selectedWidget.data.bgColor || '#ffffff'}
                onChange={(val) => handleDataChange('bgColor', val)}
              />
              <ColorInput
                label="Primary Color"
                value={selectedWidget.data.primaryColor || '#3b82f6'}
                onChange={(val) => handleDataChange('primaryColor', val)}
              />
            </Section>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-panel-border bg-canvas/30">
        <p className="text-xs text-white/40 text-center">
          Changes saved automatically
        </p>
      </div>
    </aside>
  );
};

export default PropertyPanel;