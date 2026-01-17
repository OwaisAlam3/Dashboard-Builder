import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all dashboards
router.get('/', async (req, res, next) => {
  try {
    const dashboards = await prisma.dashboard.findMany({
      orderBy: { updatedAt: 'desc' }
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
      where: { id: parseInt(id) }
    });

    if (!dashboard) {
      return res.status(404).json({ error: 'Dashboard not found' });
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

    if (!name || !widgets) {
      return res.status(400).json({ 
        error: 'Missing required fields: name and widgets are required' 
      });
    }

    if (!Array.isArray(widgets)) {
      return res.status(400).json({ 
        error: 'Invalid widgets format: must be an array' 
      });
    }

    const dashboard = await prisma.dashboard.create({
      data: { name, widgets }
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
    if (name !== undefined) updateData.name = name;
    if (widgets !== undefined) {
      if (!Array.isArray(widgets)) {
        return res.status(400).json({ 
          error: 'Invalid widgets format: must be an array' 
        });
      }
      updateData.widgets = widgets;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'No valid fields to update' 
      });
    }

    const dashboard = await prisma.dashboard.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json(dashboard);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    next(error);
  }
});

// DELETE dashboard
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.dashboard.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Dashboard not found' });
    }
    next(error);
  }
});

export default router;
