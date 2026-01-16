import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all dashboards
router.get('/', async (req, res) => {
  const dashboards = await prisma.dashboard.findMany();
  res.json(dashboards);
});

// Get one dashboard
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const dashboard = await prisma.dashboard.findUnique({ where: { id: Number(id) } });
  res.json(dashboard);
});

// Create dashboard
router.post('/', async (req, res) => {
  const { name, widgets } = req.body;
  const newDashboard = await prisma.dashboard.create({
    data: { name, widgets: JSON.stringify(widgets) },
  });
  res.json(newDashboard);
});

export default router;
