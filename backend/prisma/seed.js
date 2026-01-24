// backend/prisma/seed.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dashboard templates data - FIXED to match frontend expectations
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
  
  analytics: {
    id: 'analytics',
    name: 'Analytics Dashboard',
    description: 'Perfect for tracking KPIs and data metrics',
    category: 'data',
    thumbnail: '📊',
    icon: 'BarChart3',
    widgets: [
      {
        id: 'widget-stats-1',
        type: 'stats',
        gridArea: { x: 0, y: 0, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
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
        id: 'widget-stats-2',
        type: 'stats',
        gridArea: { x: 6, y: 0, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
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
        id: 'widget-stats-3',
        type: 'stats',
        gridArea: { x: 12, y: 0, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
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
        id: 'widget-stats-4',
        type: 'stats',
        gridArea: { x: 18, y: 0, w: 6, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
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
        id: 'widget-chart-1',
        type: 'chart',
        gridArea: { x: 0, y: 2, w: 16, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 4,
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
        id: 'widget-chart-2',
        type: 'chart',
        gridArea: { x: 16, y: 2, w: 8, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 5,
        data: {
          title: 'Sales by Category',
          chartType: 'bar',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6',
          showLegend: true,
          showGrid: true
        }
      }
    ]
  },
  
  portfolio: {
    id: 'portfolio',
    name: 'Portfolio Showcase',
    description: 'Showcase your work with images and descriptions',
    category: 'content',
    thumbnail: '🎭',
    icon: 'FileText',
    widgets: [
      {
        id: 'widget-card-1',
        type: 'card',
        gridArea: { x: 0, y: 0, w: 24, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          title: 'Welcome to My Portfolio',
          content: 'Designer & Developer passionate about creating beautiful digital experiences.',
          bgColor: '#3b82f6',
          titleSize: 'xl',
          titleColor: '#ffffff',
          textColor: '#e0e7ff'
        }
      },
      {
        id: 'widget-image-1',
        type: 'image',
        gridArea: { x: 0, y: 2, w: 8, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
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
        id: 'widget-image-2',
        type: 'image',
        gridArea: { x: 8, y: 2, w: 8, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
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
        id: 'widget-image-3',
        type: 'image',
        gridArea: { x: 16, y: 2, w: 8, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          url: 'https://images.unsplash.com/photo-1618005198920-f0cb2d8d9a7e?w=800',
          alt: 'Project 3',
          objectFit: 'cover',
          borderRadius: 8,
          showCaption: true,
          caption: 'Brand Identity'
        }
      }
    ]
  },
  
  personal: {
    id: 'personal',
    name: 'Personal Dashboard',
    description: 'Your daily planner and life organizer',
    category: 'productivity',
    thumbnail: '📅',
    icon: 'Calendar',
    widgets: [
      {
        id: 'widget-card-welcome',
        type: 'card',
        gridArea: { x: 0, y: 0, w: 16, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 0,
        data: {
          title: 'Good Morning! 👋',
          content: 'Today is your day to shine. You have 5 tasks scheduled.',
          bgColor: '#3b82f6',
          titleSize: 'xl',
          titleColor: '#ffffff',
          textColor: '#e0e7ff'
        }
      },
      {
        id: 'widget-stats-progress',
        type: 'stats',
        gridArea: { x: 16, y: 0, w: 8, h: 2 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 1,
        data: {
          title: 'Weekly Progress',
          value: '12/18',
          change: '67%',
          description: 'Tasks completed',
          bgColor: '#10b981',
          icon: 'trending-up'
        }
      },
      {
        id: 'widget-calendar-1',
        type: 'calendar',
        gridArea: { x: 0, y: 2, w: 12, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 2,
        data: {
          title: 'My Calendar',
          bgColor: '#ffffff',
          primaryColor: '#3b82f6'
        }
      },
      {
        id: 'widget-card-agenda',
        type: 'card',
        gridArea: { x: 12, y: 2, w: 12, h: 5 },
        rotation: 0,
        locked: false,
        visible: true,
        opacity: 1,
        zIndex: 3,
        data: {
          title: 'Today\'s Agenda',
          content: '🏃 6:30 AM - Morning workout\n☕ 8:00 AM - Breakfast\n💼 10:00 AM - Team meeting\n📝 2:00 PM - Project work\n✅ 5:00 PM - Review & wrap up',
          bgColor: '#ffffff',
          titleColor: '#1e293b',
          textColor: '#475569'
        }
      }
    ]
  }
};

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.dashboard.deleteMany({});
  await prisma.template.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Seed templates
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