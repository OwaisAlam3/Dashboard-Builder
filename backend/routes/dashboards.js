// backend/routes/dashboards.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Validate widget structure
const validateWidget = (widget) => {
  if (!widget.id || typeof widget.id !== 'string') return false;
  if (!widget.type || typeof widget.type !== 'string') return false;
  if (!widget.gridArea || typeof widget.gridArea !== 'object') return false;
  
  const { x, y, w, h } = widget.gridArea;
  if (typeof x !== 'number' || typeof y !== 'number' || 
      typeof w !== 'number' || typeof h !== 'number') return false;
  
  return true;
};

// GET all dashboards
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

// GET single dashboard
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

    res.json(dashboard);
  } catch (error) {
    next(error);
  }
});

// POST create dashboard
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

    // Validate each widget
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

// PUT update dashboard
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
      
      // Validate each widget
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

// DELETE dashboard
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