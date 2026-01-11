// src/config/dashboardTemplates.js
import { 
  BarChart3, 
  TrendingUp,
  FileText,
  Calendar,
  Map,
  Image as ImageIcon,
  LayoutDashboard,
  PieChart,
  Users
} from 'lucide-react';

export const DASHBOARD_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty dashboard',
    icon: LayoutDashboard,
    category: 'basic',
    thumbnail: '🎨',
    widgets: []
  },
  
  analytics: {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Perfect for tracking KPIs and data metrics',
    icon: BarChart3,
    category: 'business',
    thumbnail: '📊',
    widgets: [
      {
        type: 'stats',
        gridArea: { x: 0, y: 0, w: 3, h: 2 },
        data: {
          title: 'Total Revenue',
          value: '$45,231',
          change: '+20.1%',
          description: 'From last month',
          bgColor: '#3b82f6',
          icon: 'dollar-sign'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 3, y: 0, w: 3, h: 2 },
        data: {
          title: 'Active Users',
          value: '2,845',
          change: '+12.5%',
          description: 'From last month',
          bgColor: '#10b981',
          icon: 'users'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 6, y: 0, w: 3, h: 2 },
        data: {
          title: 'Conversion Rate',
          value: '3.24%',
          change: '+5.4%',
          description: 'From last month',
          bgColor: '#8b5cf6',
          icon: 'trending-up'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 9, y: 0, w: 3, h: 2 },
        data: {
          title: 'Total Orders',
          value: '1,234',
          change: '+8.2%',
          description: 'From last month',
          bgColor: '#f59e0b',
          icon: 'shopping-cart'
        }
      },
      {
        type: 'chart',
        gridArea: { x: 0, y: 2, w: 8, h: 4 },
        data: {
          title: 'Revenue Overview',
          chartType: 'line',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          showGrid: true,
          showLegend: true
        }
      },
      {
        type: 'chart',
        gridArea: { x: 8, y: 2, w: 4, h: 4 },
        data: {
          title: 'Sales by Category',
          chartType: 'pie',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6',
          showLegend: true
        }
      }
    ]
  },
  
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio Showcase',
    description: 'Showcase your work with images and descriptions',
    icon: ImageIcon,
    category: 'creative',
    thumbnail: '🎭',
    widgets: [
      {
        type: 'card',
        gridArea: { x: 0, y: 0, w: 12, h: 2 },
        data: {
          title: 'Welcome to My Portfolio',
          content: 'I\'m a designer and developer passionate about creating beautiful digital experiences.',
          bgColor: '#ffffff',
          titleSize: 'xl',
          titleColor: '#1e293b',
          textColor: '#64748b'
        }
      },
      {
        type: 'image',
        gridArea: { x: 0, y: 2, w: 4, h: 3 },
        data: {
          url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=800',
          alt: 'Project 1',
          objectFit: 'cover',
          borderRadius: 8,
          showCaption: true,
          caption: 'Modern Website Design'
        }
      },
      {
        type: 'image',
        gridArea: { x: 4, y: 2, w: 4, h: 3 },
        data: {
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
          alt: 'Project 2',
          objectFit: 'cover',
          borderRadius: 8,
          showCaption: true,
          caption: 'Mobile App Interface'
        }
      },
      {
        type: 'image',
        gridArea: { x: 8, y: 2, w: 4, h: 3 },
        data: {
          url: 'https://images.unsplash.com/photo-1618005198920-f0cb2d8d9a7e?w=800',
          alt: 'Project 3',
          objectFit: 'cover',
          borderRadius: 8,
          showCaption: true,
          caption: 'Brand Identity'
        }
      },
      {
        type: 'card',
        gridArea: { x: 0, y: 5, w: 6, h: 3 },
        data: {
          title: 'About Me',
          content: 'With over 5 years of experience in design and development, I specialize in creating user-centered digital products that combine aesthetics with functionality.',
          bgColor: '#f8fafc',
          titleColor: '#1e293b',
          textColor: '#64748b'
        }
      },
      {
        type: 'card',
        gridArea: { x: 6, y: 5, w: 6, h: 3 },
        data: {
          title: 'Skills',
          content: 'UI/UX Design • React • TypeScript • Figma • Adobe Creative Suite • Responsive Design • Prototyping',
          bgColor: '#f8fafc',
          titleColor: '#1e293b',
          textColor: '#64748b'
        }
      }
    ]
  },
  
  projectManagement: {
    id: 'projectManagement',
    name: 'Project Manager',
    description: 'Track projects, tasks, and team progress',
    icon: Users,
    category: 'productivity',
    thumbnail: '📋',
    widgets: [
      {
        type: 'card',
        gridArea: { x: 0, y: 0, w: 8, h: 2 },
        data: {
          title: 'Current Sprint',
          content: 'Sprint 23 - Ends in 5 days\n\n✅ 12 tasks completed\n⏳ 8 tasks in progress\n📝 4 tasks pending',
          bgColor: '#ffffff',
          titleColor: '#1e293b',
          textColor: '#64748b'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 8, y: 0, w: 4, h: 2 },
        data: {
          title: 'Team Velocity',
          value: '42',
          change: '+15%',
          description: 'Story points',
          bgColor: '#3b82f6',
          icon: 'activity'
        }
      },
      {
        type: 'calendar',
        gridArea: { x: 0, y: 2, w: 6, h: 4 },
        data: {
          title: 'Project Timeline',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6'
        }
      },
      {
        type: 'chart',
        gridArea: { x: 6, y: 2, w: 6, h: 4 },
        data: {
          title: 'Task Completion Rate',
          chartType: 'bar',
          bgColor: '#ffffff',
          primaryColor: '#10b981',
          showGrid: true,
          showLegend: false
        }
      },
      {
        type: 'card',
        gridArea: { x: 0, y: 6, w: 4, h: 2 },
        data: {
          title: 'Upcoming Deadlines',
          content: '• Website Redesign - Jan 15\n• Mobile App Launch - Jan 20\n• Q1 Report - Jan 31',
          bgColor: '#fef3c7',
          titleColor: '#92400e',
          textColor: '#78350f'
        }
      },
      {
        type: 'card',
        gridArea: { x: 4, y: 6, w: 4, h: 2 },
        data: {
          title: 'Team Notes',
          content: 'Remember: Daily standup at 9 AM\nDesign review on Friday\nClient presentation next week',
          bgColor: '#dbeafe',
          titleColor: '#1e40af',
          textColor: '#1e3a8a'
        }
      },
      {
        type: 'card',
        gridArea: { x: 8, y: 6, w: 4, h: 2 },
        data: {
          title: 'Blockers',
          content: '⚠️ API integration pending\n⚠️ Design assets needed\n⚠️ Database migration',
          bgColor: '#fee2e2',
          titleColor: '#991b1b',
          textColor: '#7f1d1d'
        }
      }
    ]
  },
  
  ecommerce: {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Monitor sales, orders, and store performance',
    icon: TrendingUp,
    category: 'business',
    thumbnail: '🛍️',
    widgets: [
      {
        type: 'stats',
        gridArea: { x: 0, y: 0, w: 3, h: 2 },
        data: {
          title: 'Total Sales',
          value: '$128K',
          change: '+32%',
          description: 'This month',
          bgColor: '#10b981',
          icon: 'dollar-sign'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 3, y: 0, w: 3, h: 2 },
        data: {
          title: 'Orders',
          value: '1,847',
          change: '+18%',
          description: 'This month',
          bgColor: '#3b82f6',
          icon: 'shopping-cart'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 6, y: 0, w: 3, h: 2 },
        data: {
          title: 'Customers',
          value: '892',
          change: '+12%',
          description: 'New this month',
          bgColor: '#8b5cf6',
          icon: 'users'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 9, y: 0, w: 3, h: 2 },
        data: {
          title: 'Avg Order Value',
          value: '$69',
          change: '+8%',
          description: 'This month',
          bgColor: '#f59e0b',
          icon: 'trending-up'
        }
      },
      {
        type: 'chart',
        gridArea: { x: 0, y: 2, w: 7, h: 4 },
        data: {
          title: 'Sales Trend',
          chartType: 'area',
          bgColor: '#ffffff',
          primaryColor: '#10b981',
          showGrid: true,
          showLegend: true
        }
      },
      {
        type: 'chart',
        gridArea: { x: 7, y: 2, w: 5, h: 4 },
        data: {
          title: 'Top Products',
          chartType: 'bar',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6',
          showGrid: true
        }
      },
      {
        type: 'card',
        gridArea: { x: 0, y: 6, w: 6, h: 2 },
        data: {
          title: 'Recent Orders',
          content: '#1234 - $129.99 - Processing\n#1235 - $89.50 - Shipped\n#1236 - $249.00 - Delivered\n#1237 - $65.25 - Processing',
          bgColor: '#ffffff',
          titleColor: '#1e293b'
        }
      },
      {
        type: 'card',
        gridArea: { x: 6, y: 6, w: 6, h: 2 },
        data: {
          title: 'Low Stock Alert',
          content: '⚠️ Product A - 5 units left\n⚠️ Product B - 3 units left\n⚠️ Product C - 8 units left',
          bgColor: '#fef3c7',
          titleColor: '#92400e'
        }
      }
    ]
  },
  
  social: {
    id: 'social',
    name: 'Social Media',
    description: 'Track engagement and content performance',
    icon: PieChart,
    category: 'marketing',
    thumbnail: '📱',
    widgets: [
      {
        type: 'stats',
        gridArea: { x: 0, y: 0, w: 4, h: 2 },
        data: {
          title: 'Total Followers',
          value: '45.2K',
          change: '+1,234',
          description: 'This week',
          bgColor: '#ec4899',
          icon: 'users'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 4, y: 0, w: 4, h: 2 },
        data: {
          title: 'Engagement Rate',
          value: '4.8%',
          change: '+0.3%',
          description: 'This week',
          bgColor: '#8b5cf6',
          icon: 'trending-up'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 8, y: 0, w: 4, h: 2 },
        data: {
          title: 'Posts Published',
          value: '28',
          change: '+7',
          description: 'This week',
          bgColor: '#3b82f6',
          icon: 'activity'
        }
      },
      {
        type: 'chart',
        gridArea: { x: 0, y: 2, w: 8, h: 4 },
        data: {
          title: 'Follower Growth',
          chartType: 'line',
          bgColor: '#ffffff',
          primaryColor: '#ec4899',
          secondaryColor: '#8b5cf6',
          showGrid: true,
          showLegend: true
        }
      },
      {
        type: 'chart',
        gridArea: { x: 8, y: 2, w: 4, h: 4 },
        data: {
          title: 'Content Performance',
          chartType: 'pie',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6',
          showLegend: true
        }
      },
      {
        type: 'card',
        gridArea: { x: 0, y: 6, w: 12, h: 2 },
        data: {
          title: 'Top Performing Posts',
          content: '1. "Summer Sale Announcement" - 2.4K likes, 180 comments\n2. "Behind the Scenes" - 1.8K likes, 142 comments\n3. "Customer Spotlight" - 1.5K likes, 96 comments',
          bgColor: '#f8fafc',
          titleColor: '#1e293b'
        }
      }
    ]
  },

  personal: {
    id: 'personal',
    name: 'Personal Dashboard',
    description: 'Your daily planner and life organizer',
    icon: Calendar,
    category: 'productivity',
    thumbnail: '📅',
    widgets: [
      {
        type: 'card',
        gridArea: { x: 0, y: 0, w: 6, h: 2 },
        data: {
          title: 'Good Morning! 👋',
          content: 'Today is Sunday, January 11, 2026\n\nYou have 3 tasks scheduled and 1 meeting.',
          bgColor: '#dbeafe',
          titleSize: 'lg',
          titleColor: '#1e40af',
          textColor: '#1e3a8a'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 6, y: 0, w: 3, h: 2 },
        data: {
          title: 'Tasks Done',
          value: '12/18',
          change: '67%',
          description: 'This week',
          bgColor: '#10b981',
          icon: 'activity'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 9, y: 0, w: 3, h: 2 },
        data: {
          title: 'Productivity',
          value: '85%',
          change: '+5%',
          description: 'vs last week',
          bgColor: '#8b5cf6',
          icon: 'trending-up'
        }
      },
      {
        type: 'calendar',
        gridArea: { x: 0, y: 2, w: 6, h: 4 },
        data: {
          title: 'My Calendar',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6'
        }
      },
      {
        type: 'card',
        gridArea: { x: 6, y: 2, w: 6, h: 2 },
        data: {
          title: 'Today\'s Tasks',
          content: '☐ Morning workout\n☐ Team meeting at 10 AM\n☐ Finish project proposal\n☑ Email client updates\n☐ Grocery shopping',
          bgColor: '#ffffff',
          titleColor: '#1e293b'
        }
      },
      {
        type: 'card',
        gridArea: { x: 6, y: 4, w: 6, h: 2 },
        data: {
          title: 'Quick Notes',
          content: '💡 Remember to call dentist\n💡 Birthday gift for Sarah\n💡 Book flight tickets',
          bgColor: '#fef3c7',
          titleColor: '#92400e'
        }
      }
    ]
  }
};

export const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: LayoutDashboard },
  { id: 'business', name: 'Business', icon: BarChart3 },
  { id: 'creative', name: 'Creative', icon: ImageIcon },
  { id: 'productivity', name: 'Productivity', icon: Calendar },
  { id: 'marketing', name: 'Marketing', icon: TrendingUp },
];