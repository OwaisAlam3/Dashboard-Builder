// backend/prisma/seed.js - PRODUCTION TEMPLATES
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DASHBOARD_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty dashboard',
    category: 'layout',
    thumbnail: '🎨',
    icon: 'LayoutDashboard',
    widgets: []
  },
  
  executive: {
    id: 'executive',
    name: 'Executive Dashboard',
    description: 'High-level KPIs and business metrics at a glance',
    category: 'business',
    thumbnail: '📊',
    icon: 'BarChart3',
    widgets: [
      {
        id: 'widget-heading-1',
        type: 'heading',
        gridArea: { x: 0, y: 0, w: 24, h: 1 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          text: 'Executive Overview',
          level: 'h2',
          align: 'left',
          color: '#1e293b',
          backgroundColor: 'transparent',
        }
      },
      {
        id: 'widget-metric-1',
        type: 'metric',
        gridArea: { x: 0, y: 1, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
        data: {
          label: 'Total Revenue',
          value: '€2.4M',
          trend: '+18.2%',
          trendDirection: 'up',
          comparison: 'vs last quarter',
          showSparkline: false,
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-metric-2',
        type: 'metric',
        gridArea: { x: 6, y: 1, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
        data: {
          label: 'Active Customers',
          value: '12,450',
          trend: '+8.4%',
          trendDirection: 'up',
          comparison: 'vs last quarter',
          showSparkline: false,
          primaryColor: '#10b981',
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-metric-3',
        type: 'metric',
        gridArea: { x: 12, y: 1, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          label: 'Avg Deal Size',
          value: '€45.2K',
          trend: '+12.1%',
          trendDirection: 'up',
          comparison: 'vs last quarter',
          showSparkline: false,
          primaryColor: '#8b5cf6',
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-metric-4',
        type: 'metric',
        gridArea: { x: 18, y: 1, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 4,
        data: {
          label: 'Customer Satisfaction',
          value: '94%',
          trend: '+2.1%',
          trendDirection: 'up',
          comparison: 'vs last quarter',
          showSparkline: false,
          primaryColor: '#f59e0b',
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-line-1',
        type: 'lineChart',
        gridArea: { x: 0, y: 3, w: 16, h: 6 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 5,
        data: {
          title: 'Revenue Trend',
          subtitle: 'Last 12 months',
          data: [
            { month: 'Jan', value: 185000 },
            { month: 'Feb', value: 192000 },
            { month: 'Mar', value: 201000 },
            { month: 'Apr', value: 198000 },
            { month: 'May', value: 215000 },
            { month: 'Jun', value: 223000 },
            { month: 'Jul', value: 218000 },
            { month: 'Aug', value: 235000 },
            { month: 'Sep', value: 242000 },
            { month: 'Oct', value: 238000 },
            { month: 'Nov', value: 251000 },
            { month: 'Dec', value: 265000 },
          ],
          xAxisKey: 'month',
          yAxisKey: 'value',
          lineColor: '#3b82f6',
          showGrid: true,
          showDots: true,
          smooth: true,
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-pie-1',
        type: 'pieChart',
        gridArea: { x: 16, y: 3, w: 8, h: 6 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 6,
        data: {
          title: 'Revenue by Region',
          subtitle: 'Q4 2024',
          data: [
            { name: 'North America', value: 850000, color: '#3b82f6' },
            { name: 'Europe', value: 720000, color: '#8b5cf6' },
            { name: 'Asia Pacific', value: 550000, color: '#10b981' },
            { name: 'Latin America', value: 280000, color: '#f59e0b' },
          ],
          showLegend: true,
          showLabels: true,
          backgroundColor: '#ffffff',
        }
      },
    ]
  },

  analytics: {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Comprehensive data analysis and visualization',
    category: 'data',
    thumbnail: '📈',
    icon: 'TrendingUp',
    widgets: [
      {
        id: 'widget-heading-1',
        type: 'heading',
        gridArea: { x: 0, y: 0, w: 18, h: 1 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          text: 'Analytics Overview',
          level: 'h2',
          align: 'left',
          color: '#1e293b',
          backgroundColor: 'transparent',
        }
      },
      {
        id: 'widget-stat-grid-1',
        type: 'statGrid',
        gridArea: { x: 0, y: 1, w: 18, h: 3 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
        data: {
          title: 'Key Performance Indicators',
          stats: [
            { label: 'Total Visits', value: '125.4K', change: '+15.3%', status: 'positive' },
            { label: 'Page Views', value: '342.8K', change: '+22.1%', status: 'positive' },
            { label: 'Bounce Rate', value: '42.3%', change: '-5.2%', status: 'positive' },
            { label: 'Avg Session', value: '3m 42s', change: '+12.8%', status: 'positive' },
            { label: 'Conversions', value: '2,845', change: '+18.4%', status: 'positive' },
            { label: 'Conv. Rate', value: '2.27%', change: '+0.3%', status: 'positive' },
          ],
          columns: 3,
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
        }
      },
      {
        id: 'widget-status-1',
        type: 'statusBoard',
        gridArea: { x: 18, y: 0, w: 6, h: 4 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
        data: {
          title: 'Active Campaigns',
          items: [
            { name: 'Summer Sale', status: 'in-progress', progress: 75, dueDate: 'Jul 31' },
            { name: 'Product Launch', status: 'in-progress', progress: 45, dueDate: 'Aug 15' },
            { name: 'Brand Refresh', status: 'pending', progress: 0, dueDate: 'Sep 1' },
          ],
          showProgress: true,
          statusColors: {
            completed: '#10b981',
            'in-progress': '#3b82f6',
            pending: '#6b7280',
          },
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-line-1',
        type: 'lineChart',
        gridArea: { x: 0, y: 4, w: 12, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          title: 'Traffic Over Time',
          subtitle: 'Daily visitors',
          data: [
            { month: 'Week 1', value: 12500 },
            { month: 'Week 2', value: 14200 },
            { month: 'Week 3', value: 13800 },
            { month: 'Week 4', value: 15600 },
            { month: 'Week 5', value: 16200 },
            { month: 'Week 6', value: 15900 },
            { month: 'Week 7', value: 17400 },
            { month: 'Week 8', value: 18100 },
          ],
          xAxisKey: 'month',
          yAxisKey: 'value',
          lineColor: '#3b82f6',
          showGrid: true,
          showDots: false,
          smooth: true,
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-bar-1',
        type: 'barChart',
        gridArea: { x: 12, y: 4, w: 12, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 4,
        data: {
          title: 'Top Pages',
          subtitle: 'By page views',
          data: [
            { category: 'Homepage', value: 45200 },
            { category: 'Products', value: 38900 },
            { category: 'About', value: 28400 },
            { category: 'Blog', value: 24100 },
            { category: 'Contact', value: 18700 },
          ],
          xAxisKey: 'category',
          yAxisKey: 'value',
          barColor: '#10b981',
          showGrid: true,
          horizontal: false,
          backgroundColor: '#ffffff',
        }
      },
    ]
  },

  operations: {
    id: 'operations',
    name: 'Operations Dashboard',
    description: 'Real-time operational metrics and task tracking',
    category: 'operations',
    thumbnail: '⚙️',
    icon: 'Settings',
    widgets: [
      {
        id: 'widget-heading-1',
        type: 'heading',
        gridArea: { x: 0, y: 0, w: 24, h: 1 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          text: 'Operations Center',
          level: 'h2',
          align: 'left',
          color: '#1e293b',
          backgroundColor: 'transparent',
        }
      },
      {
        id: 'widget-alert-1',
        type: 'alert',
        gridArea: { x: 0, y: 1, w: 24, h: 1 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
        data: {
          title: 'System Status',
          message: 'All systems operational. Last backup completed 2 hours ago.',
          variant: 'success',
          dismissible: true,
          icon: true,
        }
      },
      {
        id: 'widget-stat-grid-1',
        type: 'statGrid',
        gridArea: { x: 0, y: 2, w: 16, h: 3 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
        data: {
          title: 'System Metrics',
          stats: [
            { label: 'Active Users', value: '1,234', change: '+12%', status: 'positive' },
            { label: 'API Requests', value: '45.2K', change: '+8%', status: 'positive' },
            { label: 'Error Rate', value: '0.02%', change: '-15%', status: 'positive' },
            { label: 'Uptime', value: '99.98%', change: '+0.01%', status: 'positive' },
          ],
          columns: 2,
          backgroundColor: '#ffffff',
          borderColor: '#e2e8f0',
        }
      },
      {
        id: 'widget-list-1',
        type: 'list',
        gridArea: { x: 16, y: 2, w: 8, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          title: 'Recent Activity',
          items: [
            { label: 'Database backup completed', description: '2 min ago', icon: 'check', iconColor: '#10b981' },
            { label: 'New deployment successful', description: '15 min ago', icon: 'check', iconColor: '#10b981' },
            { label: 'Security scan completed', description: '1 hour ago', icon: 'check', iconColor: '#3b82f6' },
            { label: 'Cache cleared', description: '2 hours ago', icon: 'info', iconColor: '#6b7280' },
            { label: 'SSL certificate renewed', description: '3 hours ago', icon: 'check', iconColor: '#10b981' },
          ],
          showIcons: true,
          showDividers: true,
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-status-1',
        type: 'statusBoard',
        gridArea: { x: 0, y: 5, w: 12, h: 4 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 4,
        data: {
          title: 'Project Pipeline',
          items: [
            { name: 'API v2 Migration', status: 'in-progress', progress: 65, dueDate: 'Aug 15' },
            { name: 'Mobile App Update', status: 'in-progress', progress: 40, dueDate: 'Aug 30' },
            { name: 'Security Audit', status: 'completed', progress: 100, dueDate: 'Jul 31' },
            { name: 'Database Optimization', status: 'pending', progress: 0, dueDate: 'Sep 15' },
          ],
          showProgress: true,
          statusColors: {
            completed: '#10b981',
            'in-progress': '#3b82f6',
            pending: '#6b7280',
            blocked: '#ef4444',
          },
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-table-1',
        type: 'table',
        gridArea: { x: 12, y: 7, w: 12, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 5,
        data: {
          title: 'Server Status',
          columns: [
            { key: 'server', label: 'Server', width: '40%' },
            { key: 'status', label: 'Status', width: '20%' },
            { key: 'load', label: 'Load', width: '20%' },
            { key: 'memory', label: 'Memory', width: '20%' },
          ],
          data: [
            { server: 'Web-01', status: 'Online', load: '45%', memory: '62%' },
            { server: 'Web-02', status: 'Online', load: '38%', memory: '58%' },
            { server: 'DB-01', status: 'Online', load: '72%', memory: '81%' },
          ],
          striped: true,
          showHeader: true,
          backgroundColor: '#ffffff',
          headerColor: '#f8fafc',
          borderColor: '#e2e8f0',
        }
      },
    ]
  },

  sales: {
    id: 'sales',
    name: 'Sales Dashboard',
    description: 'Track sales performance and pipeline',
    category: 'sales',
    thumbnail: '💰',
    icon: 'DollarSign',
    widgets: [
      {
        id: 'widget-heading-1',
        type: 'heading',
        gridArea: { x: 0, y: 0, w: 24, h: 1 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          text: 'Sales Performance',
          level: 'h2',
          align: 'left',
          color: '#1e293b',
          backgroundColor: 'transparent',
        }
      },
      {
        id: 'widget-metric-1',
        type: 'metric',
        gridArea: { x: 0, y: 1, w: 8, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
        data: {
          label: 'Total Sales',
          value: '€850K',
          trend: '+24.5%',
          trendDirection: 'up',
          comparison: 'vs last month',
          showSparkline: false,
          primaryColor: '#10b981',
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-metric-2',
        type: 'metric',
        gridArea: { x: 8, y: 1, w: 8, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
        data: {
          label: 'New Deals',
          value: '142',
          trend: '+18.2%',
          trendDirection: 'up',
          comparison: 'vs last month',
          showSparkline: false,
          primaryColor: '#3b82f6',
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-metric-3',
        type: 'metric',
        gridArea: { x: 16, y: 1, w: 8, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          label: 'Win Rate',
          value: '68%',
          trend: '+5.2%',
          trendDirection: 'up',
          comparison: 'vs last month',
          showSparkline: false,
          primaryColor: '#8b5cf6',
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-bar-1',
        type: 'barChart',
        gridArea: { x: 0, y: 3, w: 12, h: 6 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 4,
        data: {
          title: 'Sales by Product',
          subtitle: 'Current month',
          data: [
            { category: 'Enterprise', value: 285000 },
            { category: 'Professional', value: 195000 },
            { category: 'Standard', value: 145000 },
            { category: 'Starter', value: 125000 },
            { category: 'Free Trial', value: 100000 },
          ],
          xAxisKey: 'category',
          yAxisKey: 'value',
          barColor: '#10b981',
          showGrid: true,
          horizontal: false,
          backgroundColor: '#ffffff',
        }
      },
      {
        id: 'widget-table-1',
        type: 'table',
        gridArea: { x: 12, y: 3, w: 12, h: 6 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 5,
        data: {
          title: 'Top Deals',
          columns: [
            { key: 'company', label: 'Company', width: '40%' },
            { key: 'value', label: 'Value', width: '25%' },
            { key: 'stage', label: 'Stage', width: '35%' },
          ],
          data: [
            { company: 'Acme Corp', value: '€125K', stage: 'Negotiation' },
            { company: 'TechStart Inc', value: '€98K', stage: 'Proposal' },
            { company: 'Global Solutions', value: '€87K', stage: 'Demo' },
            { company: 'Innovation Labs', value: '€76K', stage: 'Negotiation' },
            { company: 'Future Systems', value: '€65K', stage: 'Qualified' },
          ],
          striped: true,
          showHeader: true,
          backgroundColor: '#ffffff',
          headerColor: '#f8fafc',
          borderColor: '#e2e8f0',
        }
      },
    ]
  },
};

async function main() {
  console.log('🌱 Starting database seed...');

  await prisma.dashboard.deleteMany({});
  await prisma.template.deleteMany({});
  console.log('🗑️ Cleared existing data');

  console.log('📝 Seeding templates...');
  const templates = Object.values(DASHBOARD_TEMPLATES);
  
  for (const template of templates) {
    await prisma.template.create({
      data: {
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        thumbnail: template.thumbnail,
        icon: template.icon,
        widgets: template.widgets,
      },
    });
  }
  console.log(`✅ Seeded ${templates.length} templates`);

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });