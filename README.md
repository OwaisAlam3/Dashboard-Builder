# 📊 Dashboard Builder - Production-Ready

> A professional, Figma-inspired dashboard builder with drag-and-drop widgets, real-time persistence, and template system.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-24-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

---

## ✨ Features

### 🎨 **Visual Dashboard Builder**
- **Drag & Drop Interface** - Intuitive widget placement like Figma/Canva
- **Real-time Grid System** - 24-column responsive grid with 16:9 canvas
- **Smart Collision Detection** - Prevents widget overlap with visual feedback
- **Zoom & Pan Controls** - Navigate large dashboards with ease
- **Multi-widget Selection** - Select, move, and manage multiple widgets

### 🧩 **Widget Library**
- **7 Widget Types** - Container, Card, Stats, Chart, Image, Calendar, Map
- **Live Property Panel** - Edit widget properties in real-time
- **Widget States** - Lock, hide, duplicate, delete with keyboard shortcuts
- **Z-Index Management** - Bring to front / send to back controls
- **Custom Styling** - Colors, borders, sizes, and more

### 💾 **Persistence & State**
- **PostgreSQL Database** - Production-grade data persistence
- **Auto-save (2s debounce)** - Never lose your work
- **Undo/Redo History** - 50-step history with Cmd+Z/Cmd+Y
- **Import/Export** - Save dashboards as JSON files
- **Template System** - 6 pre-built professional templates

### 🚀 **Developer Experience**
- **Full TypeScript Support** - Type-safe development (optional)
- **Docker Compose** - One-command deployment
- **Hot Module Replacement** - Instant development feedback
- **Clean Architecture** - Zustand store + Prisma ORM
- **Responsive Design** - Works on desktop and tablets

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
├─────────────────────────────────────────────────────────────┤
│  Components                                                 │
│  ├── Dashboard Layout     (Main editor interface)          │
│  ├── Grid Canvas          (16:9 canvas with zoom/pan)      │
│  ├── Widget Sidebar       (Widget library)                 │
│  ├── Property Panel       (Live widget editor)             │
│  └── Template Selector    (Professional templates)         │
├─────────────────────────────────────────────────────────────┤
│  State Management (Zustand)                                │
│  ├── Dashboard CRUD       (Create, Read, Update, Delete)   │
│  ├── Widget Management    (Add, edit, delete, transform)   │
│  ├── Auto-save System     (2-second debounced persistence) │
│  └── History Management   (Undo/Redo with 50-step buffer)  │
└─────────────────────────────────────────────────────────────┘
                              ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js + Express)               │
├─────────────────────────────────────────────────────────────┤
│  Routes                                                     │
│  ├── /api/dashboards      (CRUD operations)                │
│  └── /api/templates       (Template library)               │
├─────────────────────────────────────────────────────────────┤
│  Database (Prisma ORM + PostgreSQL)                        │
│  ├── Dashboard Model      (id, name, widgets, timestamps)  │
│  └── Template Model       (id, name, category, widgets)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **Git** ([Download](https://git-scm.com/))

### Option 1: Docker (Recommended)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd dashboard-builder

# 2. Start everything with Docker Compose
cd backend
docker-compose up --build

# 3. In a new terminal, start frontend
cd frontend
npm install
npm run dev

# ✅ Backend: http://localhost:4000
# ✅ Frontend: http://localhost:5173
```

### Option 2: Local Development

#### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# Start server
npm run dev
# ✅ Running on http://localhost:4000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment (optional)
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api

# Start dev server
npm run dev
# ✅ Running on http://localhost:5173
```

---

## 📁 Project Structure

```
dashboard-builder/
├── frontend/                      # React + Vite application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard/         # Main dashboard components
│   │   │   │   ├── DashboardLayout.jsx
│   │   │   │   ├── DashboardLoader.jsx
│   │   │   │   ├── GridCanvas.jsx
│   │   │   │   ├── WidgetSidebar.jsx
│   │   │   │   ├── PropertyPanel.jsx
│   │   │   │   └── RecentDashboardsPopover.jsx
│   │   │   ├── Home/
│   │   │   │   └── DashboardHome.jsx
│   │   │   ├── Templates/
│   │   │   │   └── TemplateSelector.jsx
│   │   │   └── Widgets/           # Widget implementations
│   │   │       ├── BaseWidget.jsx
│   │   │       ├── CardWidget.jsx
│   │   │       ├── StatsWidget.jsx
│   │   │       ├── ChartWidget.jsx
│   │   │       ├── ImageWidget.jsx
│   │   │       ├── CalendarWidget.jsx
│   │   │       ├── MapWidget.jsx
│   │   │       └── ContainerWidget.jsx
│   │   ├── store/
│   │   │   └── dashboardStore.js  # Zustand global state
│   │   ├── config/
│   │   │   ├── gridConfig.js      # Grid calculations
│   │   │   └── widgetRegistry.js  # Widget definitions
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx                # Root component
│   │   └── main.jsx               # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                       # Node.js + Express API
│   ├── routes/
│   │   ├── dashboards.js          # Dashboard CRUD
│   │   └── templates.js           # Template endpoints
│   ├── middleware/
│   │   └── errorHandler.js        # Error handling
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.js                # Database seeding
│   │   └── migrations/            # Database migrations
│   ├── server.js                  # Express app
│   ├── package.json
│   ├── Dockerfile
│   └── docker-compose.yml
│
└── README.md
```

---

## 🎮 Usage Guide

### Creating Your First Dashboard

1. **Launch Application**
   ```bash
   # Frontend: http://localhost:5173
   # Backend: http://localhost:4000
   ```

2. **Choose a Starting Point**
   - Click **"From Template"** for pre-built layouts
   - Click **"New Dashboard"** for a blank canvas

3. **Add Widgets**
   - Open widget sidebar (Menu icon)
   - Search or browse widgets
   - Click a widget to add it to canvas

4. **Customize Widgets**
   - Click a widget to select it
   - Property panel opens on the right
   - Edit properties in real-time

5. **Layout Controls**
   - **Drag** - Click and drag widgets
   - **Resize** - Drag corner/edge handles
   - **Multi-select** - Cmd/Ctrl + Click
   - **Pan** - Space + Drag or Middle Mouse
   - **Zoom** - Ctrl + Scroll or toolbar buttons

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | `Cmd/Ctrl + S` |
| Undo | `Cmd/Ctrl + Z` |
| Redo | `Cmd/Ctrl + Shift + Z` |
| Copy | `Cmd/Ctrl + C` |
| Paste | `Cmd/Ctrl + V` |
| Delete | `Delete` |
| Toggle Grid | `Cmd/Ctrl + G` |
| Pan Mode | Hold `Space` |

---

## 🔌 API Reference

### Dashboards

#### `GET /api/dashboards`
Get all dashboards (sorted by most recent)

**Query Parameters:**
- `limit` (number, default: 100) - Max dashboards to return
- `offset` (number, default: 0) - Pagination offset

**Response:**
```json
[
  {
    "id": "clx123abc",
    "name": "My Dashboard",
    "widgets": [...],
    "createdAt": "2026-01-24T10:00:00.000Z",
    "updatedAt": "2026-01-24T12:30:00.000Z"
  }
]
```

#### `GET /api/dashboards/:id`
Get single dashboard by ID

**Response:**
```json
{
  "id": "clx123abc",
  "name": "My Dashboard",
  "widgets": [
    {
      "id": "widget-1",
      "type": "card",
      "gridArea": { "x": 0, "y": 0, "w": 6, "h": 4 },
      "data": { "title": "Hello", "content": "World" },
      "rotation": 0,
      "locked": false,
      "visible": true,
      "opacity": 1,
      "zIndex": 0
    }
  ],
  "createdAt": "2026-01-24T10:00:00.000Z",
  "updatedAt": "2026-01-24T12:30:00.000Z"
}
```

#### `POST /api/dashboards`
Create new dashboard

**Request Body:**
```json
{
  "name": "My Dashboard",
  "widgets": []
}
```

**Response:** Created dashboard object (201 Created)

#### `PUT /api/dashboards/:id`
Update dashboard

**Request Body:**
```json
{
  "name": "Updated Name",
  "widgets": [...]
}
```

**Response:** Updated dashboard object

#### `DELETE /api/dashboards/:id`
Delete dashboard

**Response:**
```json
{
  "success": true,
  "message": "Dashboard deleted successfully",
  "id": "clx123abc"
}
```

### Templates

#### `GET /api/templates`
Get all templates

**Query Parameters:**
- `category` (string, optional) - Filter by category

**Response:**
```json
[
  {
    "id": "analytics",
    "name": "Analytics Dashboard",
    "description": "Perfect for tracking KPIs",
    "category": "data",
    "thumbnail": "📊",
    "icon": "BarChart3",
    "widgets": [...],
    "createdAt": "2026-01-24T10:00:00.000Z",
    "updatedAt": "2026-01-24T10:00:00.000Z"
  }
]
```

#### `GET /api/templates/:id`
Get single template

---

## 🛠️ Configuration

### Environment Variables

#### Backend `.env`

```bash
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dashboard_db?schema=public"

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN="*"
```

#### Frontend `.env` (optional)

```bash
# API URL
VITE_API_URL=http://localhost:4000/api
```

### Grid Configuration

Edit `frontend/src/config/gridConfig.js`:

```javascript
export const GRID_CONFIG = {
  columns: 24,           // Number of columns
  rowHeight: 60,         // Height per row (px)
  gap: 12,              // Gap between widgets (px)
  containerPadding: 24, // Canvas padding (px)
  
  // Canvas size (16:9 aspect ratio)
  canvasWidth: 1366,
  canvasHeight: 768,
  
  // Widget constraints
  minWidgetWidth: 1,    // Minimum columns
  minWidgetHeight: 1,   // Minimum rows
  maxWidgetWidth: 24,
  maxWidgetHeight: 24,
};
```

### Widget Registry

Add custom widgets in `frontend/src/config/widgetRegistry.js`:

```javascript
export const WIDGET_TYPES = {
  myWidget: {
    id: 'myWidget',
    name: 'My Custom Widget',
    category: 'custom',
    description: 'A custom widget',
    icon: MyIcon,           // Lucide icon
    minW: 2,               // Min width (columns)
    minH: 2,               // Min height (rows)
    defaultWidth: 400,
    defaultHeight: 300,
    defaultProps: {
      title: 'My Widget',
      bgColor: '#ffffff',
      // ... other default properties
    },
  },
};
```

---

## 🐳 Docker Deployment

### Production Build

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop stack
docker-compose down
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: dashboard_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/dashboard_db
      PORT: 4000
      NODE_ENV: production
    ports:
      - "4000:4000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- dashboards.test.js
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### E2E Tests

```bash
# Install Playwright
npm install -D @playwright/test

# Run E2E tests
npm run test:e2e

# Run in UI mode
npm run test:e2e:ui
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. **Database Connection Error**

```
Error: P1001: Can't reach database server
```

**Solution:**
```bash
# Check if PostgreSQL is running
docker ps

# Restart PostgreSQL
docker-compose restart postgres

# Check connection
psql -U postgres -h localhost -d dashboard_db
```

#### 2. **Port Already in Use**

```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solution:**
```bash
# Find process using port
lsof -i :4000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=4001
```

#### 3. **Prisma Client Not Generated**

```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
cd backend
npx prisma generate
npm run dev
```

#### 4. **Widgets Not Saving**

- Check browser console for errors
- Verify backend is running (`http://localhost:4000/health`)
- Check network tab for failed API requests
- Ensure database connection is active

#### 5. **Auto-save Not Working**

- Auto-save triggers 2 seconds after last change
- Check `hasUnsavedChanges` state in Redux DevTools
- Verify `saveDashboard()` function is called
- Check backend logs for save errors

---

## 📊 Performance Optimization

### Frontend

- **Code Splitting** - Routes are lazy-loaded
- **Memoization** - Components use `React.memo` and `useMemo`
- **Debounced Updates** - Auto-save, resize, and property updates
- **Virtual Rendering** - Only visible widgets are rendered
- **GPU Acceleration** - CSS transforms use `transform3d`

### Backend

- **Database Indexing** - Indexed on `updatedAt`, `createdAt`, `category`
- **Connection Pooling** - Prisma connection pool (default: 10)
- **JSON Optimization** - PostgreSQL JSONB for fast widget queries
- **Pagination** - Default limit of 100 dashboards

### Recommended Limits

- **Max Widgets per Dashboard**: 50 (for optimal performance)
- **Max Dashboard Size**: 5MB (widget data)
- **History Buffer**: 50 steps (adjustable in store)

---

## 🔐 Security

### Best Practices Implemented

✅ **Input Validation** - All API inputs validated  
✅ **SQL Injection Prevention** - Prisma ORM parameterized queries  
✅ **XSS Prevention** - React auto-escapes output  
✅ **CORS Configuration** - Configurable origins  
✅ **Error Handling** - No sensitive data in error responses  
✅ **Rate Limiting** - Recommended for production (add middleware)  

### Production Recommendations

1. **Add Authentication**
   ```javascript
   // middleware/auth.js
   import jwt from 'jsonwebtoken';
   
   export const authenticate = (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     // Verify JWT
   };
   ```

2. **Enable Rate Limiting**
   ```bash
   npm install express-rate-limit
   ```
   ```javascript
   import rateLimit from 'express-rate-limit';
   
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   
   app.use('/api/', limiter);
   ```

3. **Use HTTPS** - Always in production
4. **Environment Variables** - Never commit `.env` files
5. **Regular Updates** - Keep dependencies updated

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)

```bash
cd frontend

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod
```

### Backend (Railway/Render)

```bash
cd backend

# Ensure Prisma is configured
npx prisma generate

# Build (if using TypeScript)
npm run build

# Start production server
npm start
```

### Environment Variables (Production)

**Backend:**
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db"
PORT=4000
NODE_ENV=production
CORS_ORIGIN="https://yourdomain.com"
```

**Frontend:**
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Test thoroughly**
   ```bash
   npm test
   npm run lint
   ```
5. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push and create Pull Request**

### Commit Convention

```
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Adding tests
chore: Maintenance tasks
```

### Code Style

- **Frontend**: ESLint + Prettier
- **Backend**: ESLint + Prettier
- **Formatting**: Run `npm run format` before committing

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- **React** - UI library
- **Zustand** - State management
- **Prisma** - Database ORM
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library
- **Recharts** - Charting library
- **React Router** - Routing
- **Vite** - Build tool

---

## 📞 Support

- **Documentation**: [Wiki](https://github.com/yourrepo/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourrepo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourrepo/discussions)
- **Email**: support@yourdomain.com

---

## 🗺️ Roadmap

### v2.0 (Q2 2026)
- [ ] User authentication & multi-tenancy
- [ ] Real-time collaboration (WebSockets)
- [ ] Custom widget builder
- [ ] Dashboard sharing & embedding
- [ ] Mobile app (React Native)

### v1.5 (Q1 2026)
- [ ] More widget types (Tables, Forms, Video)
- [ ] Theme customization
- [ ] Export to PDF/PNG
- [ ] Widget marketplace
- [ ] Advanced permissions

### v1.0 (Current)
- [x] Core dashboard builder
- [x] 7 widget types
- [x] Template system
- [x] Auto-save
- [x] Undo/Redo
- [x] Import/Export
- [x] Docker deployment

---

## 📸 Screenshots

### Dashboard Builder
![Dashboard Builder](docs/images/builder.png)

### Template Selector
![Template Selector](docs/images/templates.png)

### Property Panel
![Property Panel](docs/images/properties.png)

### Dashboard Home
![Dashboard Home](docs/images/home.png)

---

**Made with ❤️ by Owais Alam**

*Star ⭐ this repository if you find it helpful!*
