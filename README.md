# Drag‑and‑Drop Dashboard Builder

A Figma‑inspired, no‑code dashboard builder that lets users design fully custom dashboards on an infinite canvas. Users can place, resize, rotate, and customize widgets visually—just like designing in Figma, but with real dashboard components.

This project focuses on **fluid interaction, performance, and flexibility**, making it ideal for dashboard prototyping, data visualization layouts, and business reporting interfaces.

---

## ✨ What Is This Project?

This is a **visual dashboard builder** where users design dashboards by dragging and dropping widgets onto an infinite canvas. There is no coding required—everything is done through direct manipulation and a real‑time property panel.

Think of it as:

* Figma‑style canvas interactions
* Real dashboard widgets (stats, charts, calendars, maps)
* Real‑time customization
* Persistent state with undo/redo

---

## 🎯 Key Features

### 🎨 Visual Canvas Editor

* Infinite canvas with **pan and zoom**
* Dark, professional **Figma‑like UI**
* Optional **grid overlay** for alignment
* Smooth **60fps interactions** using GPU acceleration

### 🧩 Widget System

Users can add and customize multiple widget types:

* **Container** – Flexible layout boxes
* **Card** – Title and description blocks
* **Stats** – KPI metrics (revenue, users, growth)
* **Chart** – Line, bar, area, and pie charts
* **Image** – Custom image blocks
* **Calendar** – Calendar view widget
* **Map** – Embedded map display

Each widget is fully movable, resizable, rotatable, and stylable.

---

### 🖱️ Interactions

* **Drag & Drop** – Move widgets freely on the canvas
* **Resize** – 8‑way resizing (corners + edges)
* **Rotate & Opacity** – Fine‑tune appearance
* **Lock / Unlock** – Prevent accidental edits
* **Z‑Index Control** – Bring forward or send backward

---

### 🎛️ Property Panel

When a widget is selected, a detailed property panel appears:

* Position controls (X / Y coordinates)
* Size controls (Width / Height)
* Rotation and opacity sliders
* Widget‑specific settings (colors, text, styles)
* All changes update **in real time**

---

### ⌨️ Keyboard Shortcuts

* **Cmd / Ctrl + S** – Save dashboard
* **Cmd / Ctrl + Z** – Undo
* **Cmd / Ctrl + Shift + Z** – Redo
* **Cmd / Ctrl + C** – Copy widgets
* **Cmd / Ctrl + V** – Paste widgets
* **Delete / Backspace** – Delete selected widget
* **Ctrl + Scroll** – Zoom in/out

Power users feel right at home.

---

## 💾 Data Management

* **Auto‑Save** – Changes automatically saved to browser storage
* **Undo / Redo** – Full history tracking (up to 50 steps)
* **Export to PDF** – Snapshot dashboards for presentations
* **Import / Export JSON** – Share or back up dashboard configurations

---

## 🏗️ How It Works

### 1. High‑Level Architecture

```
┌─────────────────────────────────────────┐
│         Dashboard Builder UI            │
├─────────────┬──────────────┬────────────┤
│   Sidebar   │    Canvas    │ Properties │
│  (Widgets)  │  (Workspace) │   (Panel)  │
└─────────────┴──────────────┴────────────┘
       ↓              ↓              ↓
   ┌──────────────────────────────────────┐
   │      Zustand State Management        │
   │  (widgets, positions, selections)    │
   └──────────────────────────────────────┘
                    ↓
   ┌──────────────────────────────────────┐
   │      LocalStorage Persistence        │
   └──────────────────────────────────────┘
```

---

### 2. Technology Stack

* **React 18** – Component‑based UI
* **Zustand** – Lightweight global state management
* **Tailwind CSS** – Utility‑first styling
* **Lucide React** – Icon system
* **Recharts** – Chart rendering
* **Vite** – Fast development and build tooling

---

### 3. Widget Data Model

Each widget is represented as a JavaScript object:

```js
{
  id: "unique-id",
  type: "card" | "stats" | "chart" | "image" | "calendar" | "map",
  position: { x: 100, y: 100 },
  size: { width: 400, height: 300 },
  rotation: 0,
  opacity: 1,
  zIndex: 1,
  locked: false,
  data: { /* widget-specific properties */ }
}
```

This structure makes widgets portable, serializable, and easy to persist.

---

### 4. Canvas Rendering

The canvas is optimized for performance:

* Widgets use **absolute positioning**
* Pan and zoom applied via a parent transform
* CSS transform: `translate(x, y) scale(zoom)`
* GPU acceleration via `translateZ(0)`

This keeps interactions smooth even with many widgets on screen.

---

### 5. State Management Flow

```
User Action (drag, resize, edit)
     ↓
Update Zustand Store
     ↓
React Re-renders Components
     ↓
Save to LocalStorage
     ↓
Add to History (undo / redo)
```

---

### 6. Resizable Panels

* Sidebar and property panel widths are draggable
* Sizes are stored in state and persisted
* Min/max constraints prevent layout breakage

---

## 🧭 User Workflow

1. **Add Widgets**

   * Select widgets from the left sidebar
   * Widgets spawn at the canvas center

2. **Position & Resize**

   * Drag widgets freely
   * Resize using edge or corner handles
   * Fine‑tune via property panel

3. **Customize**

   * Edit text, colors, styles
   * Adjust opacity, rotation, shadows
   * See changes instantly

4. **Save & Export**

   * Auto‑save or manual save
   * Export as PDF or JSON

---

## ⚡ Technical Highlights

### Performance Optimizations

* `React.memo` to prevent unnecessary renders
* `useCallback` and `useMemo` for stable functions
* GPU‑accelerated transforms
* Debounced auto‑save
* Virtual rendering (only visible widgets rendered)

### Responsive Design

* Adjustable panels
* Works on desktop, tablet, and large screens
* Touch‑friendly interactions

### Data Persistence

* Browser LocalStorage
* Portable JSON exports
* Session‑based undo/redo history

---

## 📌 Use Cases

* **Business Dashboards** – KPI and metric tracking
* **Data Visualization** – Chart layout design
* **Prototyping** – Dashboard UI planning before development
* **Learning Tool** – Explore dashboard design principles
* **Personal Projects** – Track goals, habits, or metrics visually

---

## 🚀 Vision

This project sits at the intersection of **design tools and data tools**. It treats dashboards not as rigid layouts, but as living canvases—flexible, interactive, and expressive.

A dashboard should feel designed, not assembled. This builder exists to make that possible.
