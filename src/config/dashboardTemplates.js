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
        gridArea: { x: 0, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 6, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 12, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 18, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 0, y: 2, w: 16, h: 5 },
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
        gridArea: { x: 16, y: 2, w: 8, h: 5 },
        data: {
          title: 'Sales by Category',
          chartType: 'pie',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6',
          showLegend: true
        }
      },
      {
        type: 'chart',
        gridArea: { x: 0, y: 7, w: 12, h: 5 },
        data: {
          title: 'Monthly Performance',
          chartType: 'bar',
          bgColor: '#ffffff',
          primaryColor: '#10b981',
          showGrid: true,
          showLegend: false
        }
      },
      {
        type: 'card',
        gridArea: { x: 12, y: 7, w: 12, h: 5 },
        data: {
          title: 'Key Insights',
          content: '📈 Revenue up 20% month-over-month\n\n👥 User engagement increased by 12.5%\n\n🎯 Conversion rate improved by 0.17pp\n\n🚀 Mobile traffic grew 45% this quarter\n\n💡 Top performing product: Premium Plan',
          bgColor: '#f8fafc',
          titleColor: '#1e293b',
          textColor: '#475569'
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
        gridArea: { x: 0, y: 0, w: 24, h: 2 },
        data: {
          title: 'Welcome to My Portfolio',
          content: 'Designer & Developer passionate about creating beautiful digital experiences that combine form and function.',
          bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          titleSize: 'xl',
          titleColor: '#ffffff',
          textColor: '#e0e7ff'
        }
      },
      {
        type: 'image',
        gridArea: { x: 0, y: 2, w: 8, h: 5 },
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
        gridArea: { x: 8, y: 2, w: 8, h: 5 },
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
        gridArea: { x: 16, y: 2, w: 8, h: 5 },
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
        gridArea: { x: 0, y: 7, w: 12, h: 5 },
        data: {
          title: 'About Me',
          content: 'With over 5 years of experience in design and development, I specialize in creating user-centered digital products.\n\n✨ User Experience Design\n🎨 Visual Design & Branding\n💻 Front-end Development\n📱 Responsive & Mobile-First',
          bgColor: '#ffffff',
          titleColor: '#1e293b',
          textColor: '#475569'
        }
      },
      {
        type: 'card',
        gridArea: { x: 12, y: 7, w: 12, h: 5 },
        data: {
          title: 'Skills & Expertise',
          content: '🎯 UI/UX Design\n⚛️ React & TypeScript\n🎨 Figma & Adobe Suite\n📐 Responsive Design\n🚀 Performance Optimization\n♿ Accessibility Standards\n🔧 Design Systems',
          bgColor: '#f8fafc',
          titleColor: '#1e293b',
          textColor: '#475569'
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
        gridArea: { x: 0, y: 0, w: 14, h: 2 },
        data: {
          title: 'Current Sprint - Sprint 23',
          content: '⏱️ Ends in 5 days  •  ✅ 12 completed  •  ⏳ 8 in progress  •  📝 4 pending',
          bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          titleColor: '#ffffff',
          textColor: '#e0e7ff'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 14, y: 0, w: 5, h: 2 },
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
        type: 'stats',
        gridArea: { x: 19, y: 0, w: 5, h: 2 },
        data: {
          title: 'Sprint Progress',
          value: '66%',
          change: 'On track',
          description: '20 of 30 tasks',
          bgColor: '#10b981',
          icon: 'trending-up'
        }
      },
      {
        type: 'calendar',
        gridArea: { x: 0, y: 2, w: 12, h: 5 },
        data: {
          title: 'Project Timeline',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6'
        }
      },
      {
        type: 'chart',
        gridArea: { x: 12, y: 2, w: 12, h: 5 },
        data: {
          title: 'Task Completion Trend',
          chartType: 'bar',
          bgColor: '#ffffff',
          primaryColor: '#10b981',
          showGrid: true,
          showLegend: false
        }
      },
      {
        type: 'card',
        gridArea: { x: 0, y: 7, w: 8, h: 5 },
        data: {
          title: 'Upcoming Deadlines',
          content: '🎯 Website Redesign - Jan 15\n📱 Mobile App Launch - Jan 20\n📊 Q1 Report - Jan 31\n🚀 Feature Release - Feb 5\n📝 Documentation Update - Feb 10',
          bgColor: '#fef3c7',
          titleColor: '#92400e',
          textColor: '#78350f'
        }
      },
      {
        type: 'card',
        gridArea: { x: 8, y: 7, w: 8, h: 5 },
        data: {
          title: 'Team Updates',
          content: '💬 Daily standup at 9 AM\n🎨 Design review Friday 2 PM\n👥 Client presentation next week\n📚 Sprint planning on Monday\n🎉 Team lunch on Thursday',
          bgColor: '#dbeafe',
          titleColor: '#1e40af',
          textColor: '#1e3a8a'
        }
      },
      {
        type: 'card',
        gridArea: { x: 16, y: 7, w: 8, h: 5 },
        data: {
          title: 'Blockers & Risks',
          content: '⚠️ API integration pending approval\n⚠️ Design assets needed by Friday\n⚠️ Database migration scheduled\n⚠️ Third-party dependency issue\n⚠️ Testing environment setup',
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
        gridArea: { x: 0, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 6, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 12, y: 0, w: 6, h: 2 },
        data: {
          title: 'New Customers',
          value: '892',
          change: '+12%',
          description: 'This month',
          bgColor: '#8b5cf6',
          icon: 'users'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 18, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 0, y: 2, w: 14, h: 5 },
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
        gridArea: { x: 14, y: 2, w: 10, h: 5 },
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
        gridArea: { x: 0, y: 7, w: 12, h: 5 },
        data: {
          title: 'Recent Orders',
          content: '📦 #1234 - $129.99 - Processing\n🚚 #1235 - $89.50 - Shipped\n✅ #1236 - $249.00 - Delivered\n📦 #1237 - $65.25 - Processing\n🚚 #1238 - $159.00 - Shipped\n✅ #1239 - $79.99 - Delivered',
          bgColor: '#ffffff',
          titleColor: '#1e293b',
          textColor: '#475569'
        }
      },
      {
        type: 'card',
        gridArea: { x: 12, y: 7, w: 12, h: 5 },
        data: {
          title: 'Inventory Alerts',
          content: '⚠️ Premium Headphones - 5 units left\n⚠️ Wireless Mouse - 3 units left\n⚠️ USB-C Cable - 8 units left\n⚠️ Laptop Stand - 4 units left\n✅ Keyboard - 45 units (Good)\n✅ Monitor - 28 units (Good)',
          bgColor: '#fef3c7',
          titleColor: '#92400e',
          textColor: '#78350f'
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
        gridArea: { x: 0, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 6, y: 0, w: 6, h: 2 },
        data: {
          title: 'Engagement Rate',
          value: '4.8%',
          change: '+0.3%',
          description: 'This week',
          bgColor: '#8b5cf6',
          icon: 'heart'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 12, y: 0, w: 6, h: 2 },
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
        type: 'stats',
        gridArea: { x: 18, y: 0, w: 6, h: 2 },
        data: {
          title: 'Reach',
          value: '128K',
          change: '+23%',
          description: 'This week',
          bgColor: '#10b981',
          icon: 'trending-up'
        }
      },
      {
        type: 'chart',
        gridArea: { x: 0, y: 2, w: 16, h: 5 },
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
        gridArea: { x: 16, y: 2, w: 8, h: 5 },
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
        gridArea: { x: 0, y: 7, w: 12, h: 5 },
        data: {
          title: 'Top Performing Posts',
          content: '🔥 "Summer Sale Announcement"\n   2.4K likes • 180 comments • 450 shares\n\n📸 "Behind the Scenes"\n   1.8K likes • 142 comments • 320 shares\n\n💡 "Customer Spotlight"\n   1.5K likes • 96 comments • 210 shares',
          bgColor: '#ffffff',
          titleColor: '#1e293b',
          textColor: '#475569'
        }
      },
      {
        type: 'card',
        gridArea: { x: 12, y: 7, w: 12, h: 5 },
        data: {
          title: 'Upcoming Content',
          content: '📅 Product Launch - Tomorrow\n📅 Tutorial Video - Jan 16\n📅 Community Q&A - Jan 18\n📅 Feature Highlight - Jan 20\n📅 Behind the Scenes - Jan 22\n📅 User Testimonial - Jan 24',
          bgColor: '#f8fafc',
          titleColor: '#1e293b',
          textColor: '#475569'
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
        gridArea: { x: 0, y: 0, w: 12, h: 2 },
        data: {
          title: 'Good Morning! 👋',
          content: 'Today is Wednesday, January 14, 2026\n\nYou have 5 tasks scheduled and 2 meetings today. Let\'s make it productive!',
          bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          titleSize: 'xl',
          titleColor: '#ffffff',
          textColor: '#e0e7ff'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 12, y: 0, w: 6, h: 2 },
        data: {
          title: 'Weekly Progress',
          value: '12/18',
          change: '67%',
          description: 'Tasks completed',
          bgColor: '#10b981',
          icon: 'check-circle'
        }
      },
      {
        type: 'stats',
        gridArea: { x: 18, y: 0, w: 6, h: 2 },
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
        gridArea: { x: 0, y: 2, w: 12, h: 5 },
        data: {
          title: 'My Calendar',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6'
        }
      },
      {
        type: 'card',
        gridArea: { x: 12, y: 2, w: 12, h: 5 },
        data: {
          title: 'Today\'s Agenda',
          content: '🏃 6:30 AM - Morning workout\n☕ 8:00 AM - Breakfast & review emails\n💼 10:00 AM - Team standup meeting\n📝 11:00 AM - Work on project proposal\n🍽️ 1:00 PM - Lunch break\n👥 2:30 PM - Client call\n✅ 4:00 PM - Review & wrap up\n🛒 6:00 PM - Grocery shopping',
          bgColor: '#ffffff',
          titleColor: '#1e293b',
          textColor: '#475569'
        }
      },
      {
        type: 'card',
        gridArea: { x: 0, y: 7, w: 8, h: 5 },
        data: {
          title: 'This Week\'s Goals',
          content: '✅ Complete Q1 presentation\n⏳ Finish course module 3\n⏳ Update portfolio website\n☐ Plan weekend trip\n☐ Organize workspace\n☐ Schedule dentist appointment',
          bgColor: '#f8fafc',
          titleColor: '#1e293b',
          textColor: '#475569'
        }
      },
      {
        type: 'card',
        gridArea: { x: 8, y: 7, w: 8, h: 5 },
        data: {
          title: 'Quick Notes & Reminders',
          content: '💡 Call dentist for checkup\n💡 Sarah\'s birthday on Jan 20\n💡 Book flight tickets for vacation\n💡 Review insurance policy\n💡 Update LinkedIn profile\n💡 Water the plants',
          bgColor: '#fef3c7',
          titleColor: '#92400e',
          textColor: '#78350f'
        }
      },
      {
        type: 'card',
        gridArea: { x: 16, y: 7, w: 8, h: 5 },
        data: {
          title: 'Habit Tracker',
          content: '💪 Exercise: 4/7 days\n📚 Reading: 3/7 days\n💧 Water intake: 6/7 days\n🧘 Meditation: 5/7 days\n😴 Sleep 8hrs: 5/7 days\n🥗 Healthy eating: 6/7 days',
          bgColor: '#dbeafe',
          titleColor: '#1e40af',
          textColor: '#1e3a8a'
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