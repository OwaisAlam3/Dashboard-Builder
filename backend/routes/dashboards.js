import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

const validateWidget = (widget) => {
  if (!widget.id || typeof widget.id !== 'string') return false;
  if (!widget.type || typeof widget.type !== 'string') return false;
  if (!widget.gridArea || typeof widget.gridArea !== 'object') return false;
  
  const { x, y, w, h } = widget.gridArea;
  if (typeof x !== 'number' || typeof y !== 'number' || 
      typeof w !== 'number' || typeof h !== 'number') return false;
  
  return true;
};

router.get('/', async (req, res, next) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const dashboards = await prisma.dashboard.findMany({
      orderBy: { updatedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });
    
    res.json(dashboards);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const dashboard = await prisma.dashboard.findUnique({
      where: { id }
    });

    if (!dashboard) {
      return res.status(404).json({ 
        error: 'Dashboard not found',
        id 
      });
    }

    // Public dashboards are always accessible
    if (!dashboard.isPublic) {
      // Private dashboards require a valid embed token
      const embedToken = req.headers['x-embed-token'];

      if (!embedToken) {
        return res.status(403).json({
          error: 'Access denied: dashboard is private and no embed token was provided'
        });
      }

      const storedToken = await prisma.embedToken.findFirst({
        where: {
          token: embedToken,
          dashboardId: id
        }
      });

      if (!storedToken) {
        return res.status(403).json({
          error: 'Access denied: invalid embed token'
        });
      }

      if (new Date() > new Date(storedToken.expiresAt)) {
        // Clean up the expired token while we're here
        await prisma.embedToken.delete({ where: { id: storedToken.id } });
        return res.status(403).json({
          error: 'Access denied: embed token has expired'
        });
      }

      // Token is valid — update lastUsedAt
      await prisma.embedToken.update({
        where: { id: storedToken.id },
        data: { lastUsedAt: new Date() }
      });
    }

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, widgets } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ 
        error: 'Invalid name: must be a non-empty string' 
      });
    }

    if (!Array.isArray(widgets)) {
      return res.status(400).json({ 
        error: 'Invalid widgets: must be an array' 
      });
    }

    for (let i = 0; i < widgets.length; i++) {
      if (!validateWidget(widgets[i])) {
        return res.status(400).json({ 
          error: `Invalid widget at index ${i}`,
          widget: widgets[i]
        });
      }
    }

    const dashboard = await prisma.dashboard.create({
      data: { 
        name: name.trim(), 
        widgets 
      }
    });

    res.status(201).json(dashboard);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, widgets } = req.body;

    const updateData = {};
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Invalid name: must be a non-empty string' 
        });
      }
      updateData.name = name.trim();
    }
    
    if (widgets !== undefined) {
      if (!Array.isArray(widgets)) {
        return res.status(400).json({ 
          error: 'Invalid widgets: must be an array' 
        });
      }
      
      for (let i = 0; i < widgets.length; i++) {
        if (!validateWidget(widgets[i])) {
          return res.status(400).json({ 
            error: `Invalid widget at index ${i}`,
            widget: widgets[i]
          });
        }
      }
      
      updateData.widgets = widgets;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields to update' 
      });
    }

    const dashboard = await prisma.dashboard.update({
      where: { id },
      data: updateData
    });

    res.json(dashboard);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Dashboard not found',
        id: req.params.id 
      });
    }
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.dashboard.delete({
      where: { id }
    });

    res.json({ 
      success: true,
      message: 'Dashboard deleted successfully',
      id 
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Dashboard not found',
        id: req.params.id 
      });
    }
    next(error);
  }
});

export default router;