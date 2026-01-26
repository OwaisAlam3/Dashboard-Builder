// src/components/Dashboard/PropertyPanel.jsx - IMPROVED: Better input handling, validation feedback
import React, { useMemo, useCallback, useState, useRef } from 'react';
import { X, ChevronDown, ChevronRight, AlertCircle } from 'lucide-react';
import useDashboardStore from '../../store/dashboardStore';
import { WIDGET_TYPES } from '../../config/widgetRegistry';
import GRID_CONFIG from '../../config/gridConfig';

const PropertyPanel = () => {
  const { 
    selectedWidgetIds, 
    widgets, 
    deselectAll, 
    updateWidget,
    updateWidgetData,
    updateWidgetGridArea,
    propertyPanelOpen,
    gridColumns,
    maxRows,
  } = useDashboardStore();

  const [expandedSections, setExpandedSections] = useState({
    position: true,
    size: true,
    appearance: true,
    content: true,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const inputRefs = useRef({});

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

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  const validateGridValue = useCallback((field, value, widget) => {
    const numValue = parseInt(value) || 0;
    let error = null;

    switch (field) {
      case 'x':
        if (numValue < 0) error = 'Must be 0 or greater';
        if (numValue > gridColumns - widget.gridArea.w) error = `Max: ${gridColumns - widget.gridArea.w}`;
        break;
      case 'y':
        if (numValue < 0) error = 'Must be 0 or greater';
        if (numValue > maxRows - widget.gridArea.h) error = `Max: ${maxRows - widget.gridArea.h}`;
        break;
      case 'w':
        if (numValue < GRID_CONFIG.minWidgetWidth) error = `Min: ${GRID_CONFIG.minWidgetWidth}`;
        if (numValue > gridColumns) error = `Max: ${gridColumns}`;
        break;
      case 'h':
        if (numValue < GRID_CONFIG.minWidgetHeight) error = `Min: ${GRID_CONFIG.minWidgetHeight}`;
        if (numValue > maxRows - widget.gridArea.y) error = `Max: ${maxRows - widget.gridArea.y}`;
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return !error;
  }, [gridColumns, maxRows]);

  const handleDataChange = useCallback((key, value) => {
    if (selectedWidget) {
      updateWidgetData(selectedWidget.id, { [key]: value });
    }
  }, [selectedWidget?.id, updateWidgetData]);

  const handleGridChange = useCallback((axis, value) => {
    if (!selectedWidget) return;
    
    const numValue = Math.max(0, parseInt(value) || 0);
    
    if (!validateGridValue(axis, numValue, selectedWidget)) {
      return;
    }

    const newGridArea = { ...selectedWidget.gridArea };
    
    switch (axis) {
      case 'x':
        newGridArea.x = Math.min(numValue, gridColumns - newGridArea.w);
        break;
      case 'y':
        newGridArea.y = Math.min(numValue, maxRows - newGridArea.h);
        break;
      case 'w':
        newGridArea.w = Math.max(
          GRID_CONFIG.minWidgetWidth, 
          Math.min(numValue, gridColumns - newGridArea.x)
        );
        break;
      case 'h':
        newGridArea.h = Math.max(
          GRID_CONFIG.minWidgetHeight, 
          Math.min(numValue, maxRows - newGridArea.y)
        );
        break;
    }
    
    updateWidgetGridArea(selectedWidget.id, newGridArea, true);
  }, [selectedWidget?.id, selectedWidget?.gridArea, updateWidgetGridArea, gridColumns, maxRows, validateGridValue]);

  const handleWidgetUpdate = useCallback((key, value) => {
    if (selectedWidget) {
      updateWidget(selectedWidget.id, { [key]: value });
    }
  }, [selectedWidget?.id, updateWidget]);

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

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
        <div className="px-3 pb-3 space-y-3">
          {children}
        </div>
      )}
    </div>
  );

  const Input = ({ label, value, onChange, type = "number", min, max, step = 1, suffix = '', helperText = '', fieldKey = '' }) => {
    const hasError = validationErrors[fieldKey];
    
    return (
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">
          {label}
        </label>
        <div className="relative">
          <input
            ref={el => inputRefs.current[fieldKey] = el}
            type={type}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            onMouseDown={stopPropagation}
            onFocus={() => setValidationErrors(prev => ({ ...prev, [fieldKey]: null }))}
            min={min}
            max={max}
            step={step}
            className={`w-full px-2.5 py-1.5 bg-canvas border rounded text-sm text-white focus:outline-none transition-colors ${
              hasError 
                ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/50' 
                : 'border-panel-border focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50'
            }`}
          />
          {suffix && (
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-white/40 pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {hasError ? (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle size={10} />
            {hasError}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-white/40">{helperText}</p>
        ) : null}
      </div>
    );
  };

  const ColorInput = ({ label, value, onChange }) => {
    const [isValid, setIsValid] = useState(true);

    const handleColorChange = (newValue) => {
      // Basic hex color validation
      const hexRegex = /^#([0-9A-Fa-f]{3}){1,2}$/;
      setIsValid(!newValue || hexRegex.test(newValue));
      onChange(newValue);
    };

    return (
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">
          {label}
        </label>
        <div className="flex gap-2">
          <input
            type="color"
            value={value && /^#([0-9A-Fa-f]{3}){1,2}$/.test(value) ? value : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            onMouseDown={stopPropagation}
            className="w-12 h-9 rounded cursor-pointer bg-canvas border border-panel-border"
          />
          <input
            type="text"
            value={value ?? ''}
            onChange={(e) => handleColorChange(e.target.value)}
            onMouseDown={stopPropagation}
            placeholder="#000000"
            className={`flex-1 px-2.5 py-1.5 bg-canvas border rounded text-sm text-white focus:outline-none transition-colors ${
              isValid
                ? 'border-panel-border focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50'
                : 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400/50'
            }`}
          />
        </div>
        {!isValid && (
          <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
            <AlertCircle size={10} />
            Invalid hex color
          </p>
        )}
      </div>
    );
  };

  const Select = ({ label, value, onChange, options }) => (
    <div>
      <label className="block text-xs font-medium text-white/70 mb-1.5">
        {label}
      </label>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={stopPropagation}
        className="w-full px-2.5 py-1.5 bg-canvas border border-panel-border rounded text-sm text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50 transition-colors cursor-pointer"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  const Textarea = ({ label, value, onChange, rows = 4 }) => {
    return (
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">
          {label}
        </label>
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          onMouseDown={stopPropagation}
          rows={rows}
          className="w-full px-2.5 py-1.5 bg-canvas border border-panel-border rounded text-sm text-white focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue/50 transition-colors resize-none"
        />
      </div>
    );
  };

  const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked ?? false}
        onChange={(e) => onChange(e.target.checked)}
        onMouseDown={stopPropagation}
        className="w-4 h-4 rounded border-panel-border bg-canvas text-accent-blue focus:ring-2 focus:ring-accent-blue/50 cursor-pointer"
      />
      <span className="text-sm text-white/80 group-hover:text-white transition-colors">{label}</span>
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
            title="Close Properties"
          >
            <X size={16} className="text-white/70" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Grid Position & Size */}
        <Section title="Grid Position" section="position">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Column (X)"
              value={selectedWidget.gridArea.x}
              onChange={(val) => handleGridChange('x', val)}
              min={0}
              max={gridColumns - selectedWidget.gridArea.w}
              fieldKey="x"
            />
            <Input
              label="Row (Y)"
              value={selectedWidget.gridArea.y}
              onChange={(val) => handleGridChange('y', val)}
              min={0}
              max={maxRows - selectedWidget.gridArea.h}
              fieldKey="y"
            />
          </div>
        </Section>

        <Section title="Grid Size" section="size">
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Width"
              value={selectedWidget.gridArea.w}
              onChange={(val) => handleGridChange('w', val)}
              min={GRID_CONFIG.minWidgetWidth}
              max={gridColumns}
              suffix="cols"
              fieldKey="w"
            />
            <Input
              label="Height"
              value={selectedWidget.gridArea.h}
              onChange={(val) => handleGridChange('h', val)}
              min={GRID_CONFIG.minWidgetHeight}
              max={maxRows - selectedWidget.gridArea.y}
              suffix="rows"
              fieldKey="h"
            />
          </div>
          <Input
            label="Rotation"
            value={selectedWidget.rotation || 0}
            onChange={(val) => handleWidgetUpdate('rotation', parseFloat(val) || 0)}
            min={-180}
            max={180}
            step={1}
            suffix="°"
          />
          <Input
            label="Opacity"
            value={selectedWidget.opacity || 1}
            onChange={(val) => handleWidgetUpdate('opacity', Math.max(0, Math.min(1, parseFloat(val) || 1)))}
            min={0}
            max={1}
            step={0.1}
          />
        </Section>

        {/* Widget-Specific Properties */}
        {selectedWidget.type === 'container' && (
          <>
            <Section title="Content" section="content">
              <Input
                label="Title"
                type="text"
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
                value={selectedWidget.data.borderWidth || 1}
                onChange={(val) => handleDataChange('borderWidth', parseFloat(val))}
                min={0}
                max={10}
                suffix="px"
              />
              <Input
                label="Border Radius"
                value={selectedWidget.data.borderRadius || 8}
                onChange={(val) => handleDataChange('borderRadius', parseFloat(val))}
                min={0}
                max={50}
                suffix="px"
              />
            </Section>
          </>
        )}

        {selectedWidget.type === 'card' && (
          <>
            <Section title="Content" section="content">
              <Input
                label="Title"
                type="text"
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
                type="text"
                value={selectedWidget.data.title || ''}
                onChange={(val) => handleDataChange('title', val)}
              />
              <Input
                label="Value"
                type="text"
                value={selectedWidget.data.value || ''}
                onChange={(val) => handleDataChange('value', val)}
              />
              <Input
                label="Change"
                type="text"
                value={selectedWidget.data.change || ''}
                onChange={(val) => handleDataChange('change', val)}
              />
              <Input
                label="Description"
                type="text"
                value={selectedWidget.data.description || ''}
                onChange={(val) => handleDataChange('description', val)}
              />
            </Section>
            <Section title="Appearance" section="appearance">
              <ColorInput
                label="Background Color"
                value={selectedWidget.data.bgColor || '#3b82f6'}
                onChange={(val) => handleDataChange('bgColor', val)}
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
                type="text"
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
                type="text"
                value={selectedWidget.data.url || ''}
                onChange={(val) => handleDataChange('url', val)}
              />
              <Input
                label="Alt Text"
                type="text"
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
                value={selectedWidget.data.borderRadius || 8}
                onChange={(val) => handleDataChange('borderRadius', parseFloat(val))}
                min={0}
                max={50}
                suffix="px"
              />
              <Checkbox
                label="Show Caption"
                checked={selectedWidget.data.showCaption || false}
                onChange={(val) => handleDataChange('showCaption', val)}
              />
              {selectedWidget.data.showCaption && (
                <Input
                  label="Caption"
                  type="text"
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
                type="text"
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