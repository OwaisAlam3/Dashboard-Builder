import { 
  TrendingUp,
  BarChart3,
  PieChart,
  Table2,
  Type,
  Image as ImageIcon,
  CheckSquare,
  AlertCircle,
  Minus,
  Activity,
  List,
  Layers
} from 'lucide-react';

export const WIDGET_TYPES = {
  // ==================== METRICS ====================
  metric: {
    id: 'metric',
    name: 'Metric Card',
    category: 'metrics',
    description: 'Display a single KPI with trend and comparison',
    icon: TrendingUp,
    minW: 3,
    minH: 2,
    defaultWidth: 6,
    defaultHeight: 2,
    defaultProps: {
      label: 'Total Revenue',
      value: '€45,231',
      trend: '+12.5%',
      trendDirection: 'up', // up, down, neutral
      comparison: 'vs last month',
      showSparkline: false,
      sparklineData: [],
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      accentColor: '#10b981',
    },
  },

  statGrid: {
    id: 'statGrid',
    name: 'Stat Grid',
    category: 'metrics',
    description: 'Multiple metrics in a compact grid layout',
    icon: Layers,
    minW: 6,
    minH: 3,
    defaultWidth: 12,
    defaultHeight: 3,
    defaultProps: {
      title: 'Key Metrics',
      stats: [
        { label: 'Revenue', value: '€45.2K', change: '+12%', status: 'positive' },
        { label: 'Users', value: '1,234', change: '+8%', status: 'positive' },
        { label: 'Orders', value: '567', change: '-3%', status: 'negative' },
        { label: 'Conversion', value: '3.2%', change: '+0.5%', status: 'positive' },
      ],
      columns: 2,
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
    },
  },

  // ==================== CHARTS ====================
  lineChart: {
    id: 'lineChart',
    name: 'Line Chart',
    category: 'charts',
    description: 'Time-series and trend visualization',
    icon: Activity,
    minW: 6,
    minH: 4,
    defaultWidth: 12,
    defaultHeight: 6,
    defaultProps: {
      title: 'Revenue Trend',
      subtitle: 'Last 12 months',
      data: [
        { month: 'Jan', value: 4000 },
        { month: 'Feb', value: 3000 },
        { month: 'Mar', value: 5000 },
        { month: 'Apr', value: 4500 },
        { month: 'May', value: 6000 },
        { month: 'Jun', value: 5500 },
        { month: 'Jul', value: 7000 },
        { month: 'Aug', value: 6500 },
      ],
      xAxisKey: 'month',
      yAxisKey: 'value',
      lineColor: '#3b82f6',
      showGrid: true,
      showDots: true,
      smooth: true,
      backgroundColor: '#ffffff',
    },
  },

  barChart: {
    id: 'barChart',
    name: 'Bar Chart',
    category: 'charts',
    description: 'Compare categories and values',
    icon: BarChart3,
    minW: 6,
    minH: 4,
    defaultWidth: 12,
    defaultHeight: 6,
    defaultProps: {
      title: 'Sales by Category',
      subtitle: 'Current quarter',
      data: [
        { category: 'Electronics', value: 8500 },
        { category: 'Clothing', value: 6200 },
        { category: 'Home', value: 4800 },
        { category: 'Sports', value: 3900 },
        { category: 'Books', value: 2100 },
      ],
      xAxisKey: 'category',
      yAxisKey: 'value',
      barColor: '#3b82f6',
      showGrid: true,
      horizontal: false,
      backgroundColor: '#ffffff',
    },
  },

  pieChart: {
    id: 'pieChart',
    name: 'Pie Chart',
    category: 'charts',
    description: 'Show proportions and distributions',
    icon: PieChart,
    minW: 4,
    minH: 4,
    defaultWidth: 8,
    defaultHeight: 6,
    defaultProps: {
      title: 'Traffic Sources',
      subtitle: 'Last 30 days',
      data: [
        { name: 'Organic', value: 4500, color: '#3b82f6' },
        { name: 'Direct', value: 2800, color: '#8b5cf6' },
        { name: 'Social', value: 1900, color: '#10b981' },
        { name: 'Referral', value: 1200, color: '#f59e0b' },
        { name: 'Other', value: 600, color: '#6b7280' },
      ],
      showLegend: true,
      showLabels: true,
      backgroundColor: '#ffffff',
    },
  },

  // ==================== DATA DISPLAY ====================
  table: {
    id: 'table',
    name: 'Data Table',
    category: 'data',
    description: 'Display structured data in rows and columns',
    icon: Table2,
    minW: 8,
    minH: 4,
    defaultWidth: 16,
    defaultHeight: 6,
    defaultProps: {
      title: 'Recent Orders',
      columns: [
        { key: 'id', label: 'Order ID', width: '20%' },
        { key: 'customer', label: 'Customer', width: '30%' },
        { key: 'amount', label: 'Amount', width: '20%' },
        { key: 'status', label: 'Status', width: '30%' },
      ],
      data: [
        { id: '#12345', customer: 'John Doe', amount: '€234.00', status: 'Completed' },
        { id: '#12346', customer: 'Jane Smith', amount: '€156.00', status: 'Processing' },
        { id: '#12347', customer: 'Bob Johnson', amount: '€89.00', status: 'Pending' },
        { id: '#12348', customer: 'Alice Brown', amount: '€445.00', status: 'Completed' },
        { id: '#12349', customer: 'Charlie Davis', amount: '€321.00', status: 'Shipped' },
      ],
      striped: true,
      showHeader: true,
      backgroundColor: '#ffffff',
      headerColor: '#f8fafc',
      borderColor: '#e2e8f0',
    },
  },

  list: {
    id: 'list',
    name: 'List',
    category: 'data',
    description: 'Simple list of items with icons and descriptions',
    icon: List,
    minW: 4,
    minH: 3,
    defaultWidth: 8,
    defaultHeight: 5,
    defaultProps: {
      title: 'Recent Activity',
      items: [
        { label: 'New order received', description: '2 minutes ago', icon: 'check', iconColor: '#10b981' },
        { label: 'Payment processed', description: '15 minutes ago', icon: 'check', iconColor: '#10b981' },
        { label: 'Shipment dispatched', description: '1 hour ago', icon: 'check', iconColor: '#3b82f6' },
        { label: 'Customer inquiry', description: '3 hours ago', icon: 'alert', iconColor: '#f59e0b' },
      ],
      showIcons: true,
      showDividers: true,
      backgroundColor: '#ffffff',
    },
  },

  statusBoard: {
    id: 'statusBoard',
    name: 'Status Board',
    category: 'data',
    description: 'Track status of multiple items or projects',
    icon: CheckSquare,
    minW: 6,
    minH: 4,
    defaultWidth: 12,
    defaultHeight: 5,
    defaultProps: {
      title: 'Project Status',
      items: [
        { name: 'Website Redesign', status: 'in-progress', progress: 65, dueDate: 'Mar 15' },
        { name: 'Mobile App', status: 'in-progress', progress: 40, dueDate: 'Apr 1' },
        { name: 'API Integration', status: 'completed', progress: 100, dueDate: 'Feb 28' },
        { name: 'User Testing', status: 'pending', progress: 0, dueDate: 'Mar 30' },
      ],
      showProgress: true,
      statusColors: {
        completed: '#10b981',
        'in-progress': '#3b82f6',
        pending: '#6b7280',
        blocked: '#ef4444',
      },
      backgroundColor: '#ffffff',
    },
  },

  // ==================== CONTENT ====================
  heading: {
    id: 'heading',
    name: 'Heading',
    category: 'content',
    description: 'Large text for section titles',
    icon: Type,
    minW: 2,
    minH: 1,
    defaultWidth: 12,
    defaultHeight: 1,
    defaultProps: {
      text: 'Dashboard Overview',
      level: 'h2', // h1, h2, h3
      align: 'left', // left, center, right
      color: '#1e293b',
      backgroundColor: 'transparent',
    },
  },

  textBlock: {
    id: 'textBlock',
    name: 'Text Block',
    category: 'content',
    description: 'Paragraph text with formatting',
    icon: Type,
    minW: 3,
    minH: 2,
    defaultWidth: 12,
    defaultHeight: 3,
    defaultProps: {
      title: 'About This Dashboard',
      content: 'This dashboard provides a comprehensive overview of your key metrics and performance indicators. Use the controls above to filter by date range or export data.',
      titleSize: 'md',
      textSize: 'sm',
      titleColor: '#1e293b',
      textColor: '#64748b',
      backgroundColor: '#ffffff',
      padding: 'md', // sm, md, lg
    },
  },

  divider: {
    id: 'divider',
    name: 'Divider',
    category: 'content',
    description: 'Visual separator between sections',
    icon: Minus,
    minW: 2,
    minH: 1,
    defaultWidth: 24,
    defaultHeight: 1,
    defaultProps: {
      style: 'solid', // solid, dashed, dotted
      thickness: 1,
      color: '#e2e8f0',
      margin: 'md', // sm, md, lg
    },
  },

  // ==================== MEDIA ====================
  image: {
    id: 'image',
    name: 'Image',
    category: 'media',
    description: 'Display images with captions',
    icon: ImageIcon,
    minW: 3,
    minH: 3,
    defaultWidth: 8,
    defaultHeight: 6,
    defaultProps: {
      url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      alt: 'Analytics Dashboard',
      objectFit: 'cover', // cover, contain, fill
      borderRadius: 8,
      caption: '',
      showCaption: false,
      backgroundColor: '#f8fafc',
    },
  },

  alert: {
    id: 'alert',
    name: 'Alert',
    category: 'feedback',
    description: 'Important notifications and messages',
    icon: AlertCircle,
    minW: 4,
    minH: 2,
    defaultWidth: 12,
    defaultHeight: 2,
    defaultProps: {
      title: 'Important Notice',
      message: 'Your subscription will expire in 7 days. Please renew to continue using premium features.',
      variant: 'warning', // info, success, warning, error
      dismissible: false,
      icon: true,
    },
  },
};

// Category metadata for filtering
export const WIDGET_CATEGORIES = {
  metrics: { label: 'Metrics', icon: TrendingUp, order: 1 },
  charts: { label: 'Charts', icon: BarChart3, order: 2 },
  data: { label: 'Data', icon: Table2, order: 3 },
  content: { label: 'Content', icon: Type, order: 4 },
  media: { label: 'Media', icon: ImageIcon, order: 5 },
  feedback: { label: 'Feedback', icon: AlertCircle, order: 6 },
};