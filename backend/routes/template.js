import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all templates
router.get('/', async (req, res) => {
  const templates = await prisma.template.findMany();
  res.json(templates);
});

export default router;
