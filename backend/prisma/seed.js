// backend/prisma/seed.js - FIXED: All templates fit within 24 columns × 10 rows grid
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const DASHBOARD_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch',
    category: 'layout',
    thumbnail: '🎨',
    icon: 'LayoutDashboard',
    widgets: []
  },
  
  adminOverview: {
    id: 'adminOverview',
    name: 'Admin Overview',
    description: 'Complete admin dashboard with KPIs, charts, and tables',
    category: 'admin',
    thumbnail: '📊',
    icon: 'LayoutDashboard',
    widgets: [
      // Header
      {
        id: 'heading-1',
        type: 'heading',
        gridArea: { x: 0, y: 0, w: 24, h: 1 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          text: 'Dashboard Overview',
          level: 'h2',
          align: 'left',
          color: '#1e293b',
        }
      },
      
      // Info Boxes Row
      {
        id: 'metric-1',
        type: 'metric',
        gridArea: { x: 0, y: 1, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
        data: {
          label: 'Total Users',
          value: '8,420',
          trend: '+12.5%',
          trendDirection: 'up',
          comparison: 'from last month',
          iconType: 'users',
          color: 'blue',
        }
      },
      {
        id: 'metric-2',
        type: 'metric',
        gridArea: { x: 6, y: 1, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
        data: {
          label: 'Revenue',
          value: '€65.2K',
          trend: '+8.3%',
          trendDirection: 'up',
          comparison: 'from last month',
          iconType: 'revenue',
          color: 'green',
        }
      },
      {
        id: 'metric-3',
        type: 'metric',
        gridArea: { x: 12, y: 1, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          label: 'Total Orders',
          value: '1,843',
          trend: '+15.2%',
          trendDirection: 'up',
          comparison: 'from last month',
          iconType: 'orders',
          color: 'purple',
        }
      },
      {
        id: 'metric-4',
        type: 'metric',
        gridArea: { x: 18, y: 1, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 4,
        data: {
          label: 'Conversion',
          value: '3.65%',
          trend: '+2.1%',
          trendDirection: 'up',
          comparison: 'from last month',
          iconType: 'activity',
          color: 'cyan',
        }
      },

      // Charts Row - FIXED: Reduced height to fit
      {
        id: 'line-chart-1',
        type: 'lineChart',
        gridArea: { x: 0, y: 3, w: 16, h: 4 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 5,
        data: {
          title: 'Revenue Trend',
          subtitle: 'Last 6 months',
          data: [
            { month: 'Jan', value: 45200 },
            { month: 'Feb', value: 48300 },
            { month: 'Mar', value: 52100 },
            { month: 'Apr', value: 49800 },
            { month: 'May', value: 58400 },
            { month: 'Jun', value: 65200 },
          ],
          xAxisKey: 'month',
          yAxisKey: 'value',
          lineColor: '#3b82f6',
          showGrid: true,
          showDots: true,
          smooth: true,
        }
      },
      {
        id: 'pie-chart-1',
        type: 'pieChart',
        gridArea: { x: 16, y: 3, w: 8, h: 4 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 6,
        data: {
          title: 'Traffic Sources',
          subtitle: 'Last 30 days',
          data: [
            { name: 'Direct', value: 4500, color: '#3b82f6' },
            { name: 'Organic', value: 3200, color: '#10b981' },
            { name: 'Social', value: 2100, color: '#8b5cf6' },
            { name: 'Referral', value: 1200, color: '#f59e0b' },
            { name: 'Email', value: 800, color: '#ec4899' },
          ],
          showLegend: true,
          showLabels: true,
          donut: true,
        }
      },

      // Table - FIXED: Moved to y=7, height reduced to 3 to fit in 10 rows
      {
        id: 'table-1',
        type: 'table',
        gridArea: { x: 0, y: 7, w: 24, h: 3 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 7,
        data: {
          title: 'Recent Orders',
          subtitle: 'Latest transactions',
          columns: [
            { key: 'id', label: 'Order ID', width: '12%' },
            { key: 'customer', label: 'Customer', width: '22%' },
            { key: 'product', label: 'Product', width: '24%' },
            { key: 'date', label: 'Date', width: '16%' },
            { key: 'amount', label: 'Amount', width: '13%', type: 'number' },
            { key: 'status', label: 'Status', width: '13%', type: 'status' },
          ],
          data: [
            { id: '#10234', customer: 'John Doe', product: 'MacBook Pro 16"', date: 'Jan 28, 2026', amount: '€2,499', status: 'Completed' },
            { id: '#10235', customer: 'Jane Smith', product: 'iPhone 15 Pro', date: 'Jan 28, 2026', amount: '€1,199', status: 'Processing' },
            { id: '#10236', customer: 'Bob Johnson', product: 'iPad Air', date: 'Jan 27, 2026', amount: '€649', status: 'Shipped' },
            { id: '#10237', customer: 'Alice Brown', product: 'AirPods Pro', date: 'Jan 27, 2026', amount: '€279', status: 'Pending' },
          ],
          striped: true,
          showHeader: true,
          showFooter: true,
          footerText: 'recent orders',
          totalCount: 156,
        }
      },
    ]
  },

  analytics: {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Comprehensive analytics with charts and metrics',
    category: 'analytics',
    thumbnail: '📈',
    icon: 'TrendingUp',
    widgets: [
      {
        id: 'heading-1',
        type: 'heading',
        gridArea: { x: 0, y: 0, w: 24, h: 1 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          text: 'Analytics Dashboard',
          level: 'h2',
          align: 'left',
          color: '#1e293b',
        }
      },

      // Stats Grid
      {
        id: 'stat-grid-1',
        type: 'statGrid',
        gridArea: { x: 0, y: 1, w: 24, h: 3 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
        data: {
          title: 'Key Performance Indicators',
          stats: [
            { label: 'Page Views', value: '482.5K', change: '+18.2%', status: 'positive', description: 'Total page views' },
            { label: 'Unique Visitors', value: '125.4K', change: '+12.5%', status: 'positive', description: 'Unique users' },
            { label: 'Bounce Rate', value: '38.2%', change: '-5.3%', status: 'positive', description: 'User engagement' },
            { label: 'Avg. Duration', value: '4m 32s', change: '+8.7%', status: 'positive', description: 'Session time' },
          ],
          columns: 4,
          backgroundColor: '#f8f9fa',
        }
      },

      // Charts - FIXED: Adjusted positions and heights
      {
        id: 'line-chart-1',
        type: 'lineChart',
        gridArea: { x: 0, y: 4, w: 12, h: 3 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
        data: {
          title: 'Website Traffic',
          subtitle: 'Last 6 months',
          data: [
            { month: 'Jan', value: 125000 },
            { month: 'Feb', value: 138000 },
            { month: 'Mar', value: 142000 },
            { month: 'Apr', value: 156000 },
            { month: 'May', value: 168000 },
            { month: 'Jun', value: 182000 },
          ],
          xAxisKey: 'month',
          yAxisKey: 'value',
          lineColor: '#10b981',
          showGrid: true,
          showDots: true,
          smooth: true,
        }
      },
      {
        id: 'bar-chart-1',
        type: 'barChart',
        gridArea: { x: 12, y: 4, w: 12, h: 3 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          title: 'Top Pages',
          subtitle: 'By pageviews',
          data: [
            { category: 'Homepage', value: 45200 },
            { category: 'Products', value: 38400 },
            { category: 'About', value: 28300 },
            { category: 'Contact', value: 22100 },
            { category: 'Blog', value: 18900 },
          ],
          xAxisKey: 'category',
          yAxisKey: 'value',
          barColor: '#3b82f6',
          showGrid: true,
        }
      },

      // Activity List - FIXED: Moved to y=7, height 3 to fit in 10 rows
      {
        id: 'list-1',
        type: 'list',
        gridArea: { x: 0, y: 7, w: 24, h: 3 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 4,
        data: {
          title: 'Recent Activity',
          items: [
            { label: 'New user registration: john@example.com', description: '2 minutes ago', icon: 'check', iconColor: '#10b981' },
            { label: 'Order #10234 placed', description: '15 minutes ago', icon: 'check', iconColor: '#10b981' },
            { label: 'Payment received: €2,499', description: '1 hour ago', icon: 'check', iconColor: '#3b82f6' },
            { label: 'Support ticket #542 opened', description: '2 hours ago', icon: 'alert', iconColor: '#f59e0b' },
          ],
          showIcons: true,
          showDividers: true,
          backgroundColor: '#ffffff',
        }
      },
    ]
  },

  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce Dashboard',
    description: 'Sales and order management dashboard',
    category: 'ecommerce',
    thumbnail: '🛒',
    icon: 'ShoppingCart',
    widgets: [
      {
        id: 'heading-1',
        type: 'heading',
        gridArea: { x: 0, y: 0, w: 24, h: 1 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          text: 'E-Commerce Dashboard',
          level: 'h2',
          align: 'left',
          color: '#1e293b',
        }
      },

      // Metrics
      {
        id: 'metric-1',
        type: 'metric',
        gridArea: { x: 0, y: 1, w: 8, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
        data: {
          label: 'Total Sales',
          value: '€142.8K',
          trend: '+24.5%',
          trendDirection: 'up',
          comparison: 'vs last month',
          iconType: 'revenue',
          color: 'green',
        }
      },
      {
        id: 'metric-2',
        type: 'metric',
        gridArea: { x: 8, y: 1, w: 8, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
        data: {
          label: 'Orders',
          value: '1,843',
          trend: '+18.2%',
          trendDirection: 'up',
          comparison: 'vs last month',
          iconType: 'orders',
          color: 'blue',
        }
      },
      {
        id: 'metric-3',
        type: 'metric',
        gridArea: { x: 16, y: 1, w: 8, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          label: 'Avg. Order Value',
          value: '€77.50',
          trend: '+6.3%',
          trendDirection: 'up',
          comparison: 'vs last month',
          iconType: 'activity',
          color: 'purple',
        }
      },

      // Sales Chart and Status Board - FIXED: Adjusted heights
      {
        id: 'bar-chart-1',
        type: 'barChart',
        gridArea: { x: 0, y: 3, w: 14, h: 4 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 4,
        data: {
          title: 'Sales by Category',
          subtitle: 'This month',
          data: [
            { category: 'Electronics', value: 45200 },
            { category: 'Fashion', value: 38900 },
            { category: 'Home', value: 28400 },
            { category: 'Sports', value: 18700 },
            { category: 'Books', value: 11600 },
          ],
          xAxisKey: 'category',
          yAxisKey: 'value',
          barColor: '#10b981',
          showGrid: true,
        }
      },

      // Projects Status
      {
        id: 'status-board-1',
        type: 'statusBoard',
        gridArea: { x: 14, y: 3, w: 10, h: 4 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 5,
        data: {
          title: 'Order Processing',
          items: [
            { name: 'Pending Orders', status: 'pending', progress: 0, dueDate: 'Today' },
            { name: 'Being Prepared', status: 'in-progress', progress: 65, dueDate: 'Tomorrow' },
            { name: 'Shipped', status: 'in-progress', progress: 85, dueDate: 'This week' },
            { name: 'Delivered', status: 'completed', progress: 100, dueDate: 'Completed' },
          ],
          showProgress: true,
        }
      },

      // Orders Table - FIXED: Moved to y=7, height 3 to fit in 10 rows
      {
        id: 'table-1',
        type: 'table',
        gridArea: { x: 0, y: 7, w: 24, h: 3 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 6,
        data: {
          title: 'Recent Orders',
          columns: [
            { key: 'id', label: 'Order', width: '12%' },
            { key: 'customer', label: 'Customer', width: '22%' },
            { key: 'product', label: 'Product', width: '24%' },
            { key: 'date', label: 'Date', width: '16%' },
            { key: 'amount', label: 'Amount', width: '13%', type: 'number' },
            { key: 'status', label: 'Status', width: '13%', type: 'status' },
          ],
          data: [
            { id: '#10234', customer: 'John Doe', product: 'Wireless Headphones', date: 'Jan 28', amount: '€129', status: 'Shipped' },
            { id: '#10235', customer: 'Jane Smith', product: 'Smart Watch', date: 'Jan 28', amount: '€299', status: 'Processing' },
            { id: '#10236', customer: 'Bob Johnson', product: 'Laptop Bag', date: 'Jan 27', amount: '€45', status: 'Completed' },
            { id: '#10237', customer: 'Alice Brown', product: 'USB-C Cable', date: 'Jan 27', amount: '€19', status: 'Pending' },
          ],
          striped: true,
          showHeader: true,
          showFooter: true,
        }
      },
    ]
  },
};

async function main() {
  const templates = [
    { name: 'Blank Canvas', description: 'A blank starting dashboard' },
    { name: 'Admin Overview', description: 'Key metrics overview' },
    { name: 'Analytics Dashboard', description: 'Analytics widgets preloaded' },
    { name: 'E-Commerce Dashboard', description: 'E-commerce KPI widgets' },
  ];

  console.log('🌱 Seeding database with ADMIN PANEL templates...');

  for (const tpl of templates) {
    const existing = await prisma.template.findFirst({ where: { name: tpl.name } });
    if (existing) {
      await prisma.template.update({
        where: { id: existing.id },
        data: { description: tpl.description }
      });
    } else {
      await prisma.template.create({ data: tpl });
    }
    console.log(`✅ Template processed: ${tpl.name}`);
  }

}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });