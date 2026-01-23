// backend/routes/templates.js
import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET all templates
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;
    
    const where = category ? { category } : {};
    
    const templates = await prisma.template.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    
    res.json(templates);
  } catch (error) {
    next(error);
  }
});

// GET single template
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);
  } catch (error) {
    next(error);
  }
});

export default router;
