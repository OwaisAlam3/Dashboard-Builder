import express from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

const generateEmbedToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

router.post('/generate-token/:dashboardId', async (req, res, next) => {
  try {
    const { dashboardId } = req.params;
    const { expiresIn = 86400000, permissions = {} } = req.body;

    const dashboard = await prisma.dashboard.findUnique({
      where: { id: dashboardId }
    });

    if (!dashboard) {
      return res.status(404).json({ 
        error: 'Dashboard not found',
        dashboardId 
      });
    }

    const token = generateEmbedToken();
    const expiresAt = new Date(Date.now() + expiresIn);

    const embedToken = await prisma.embedToken.create({
      data: {
        token,
        dashboardId,
        expiresAt,
        permissions: JSON.stringify(permissions),
        createdAt: new Date()
      }
    });

    res.json({
      token: embedToken.token,
      dashboardId: embedToken.dashboardId,
      expiresAt: embedToken.expiresAt,
      embedUrl: `${req.protocol}://${req.get('host')}/embed?id=${dashboardId}&token=${token}`
    });
  } catch (error) {
    console.error('Error generating embed token:', error);
    next(error);
  }
});

router.post('/validate-token', async (req, res, next) => {
  try {
    const { token, dashboardId } = req.body;
    const embedToken = req.headers['x-embed-token'];

    const tokenToValidate = token || embedToken;

    if (!tokenToValidate) {
      return res.status(400).json({ 
        error: 'Token is required',
        valid: false 
      });
    }

    const storedToken = await prisma.embedToken.findFirst({
      where: {
        token: tokenToValidate,
        dashboardId: dashboardId || undefined
      }
    });

    if (!storedToken) {
      return res.json({ 
        valid: false, 
        reason: 'Token not found' 
      });
    }

    if (new Date() > new Date(storedToken.expiresAt)) {
      await prisma.embedToken.delete({
        where: { id: storedToken.id }
      });

      return res.json({ 
        valid: false, 
        reason: 'Token expired' 
      });
    }

    await prisma.embedToken.update({
      where: { id: storedToken.id },
      data: { lastUsedAt: new Date() }
    });

    res.json({
      valid: true,
      dashboardId: storedToken.dashboardId,
      permissions: JSON.parse(storedToken.permissions || '{}'),
      expiresAt: storedToken.expiresAt
    });
  } catch (error) {
    console.error('Error validating token:', error);
    next(error);
  }
});

router.get('/tokens/:dashboardId', async (req, res, next) => {
  try {
    const { dashboardId } = req.params;

    const tokens = await prisma.embedToken.findMany({
      where: { dashboardId },
      orderBy: { createdAt: 'desc' }
    });

    const sanitizedTokens = tokens.map(t => ({
      id: t.id,
      dashboardId: t.dashboardId,
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
      lastUsedAt: t.lastUsedAt,
      permissions: JSON.parse(t.permissions || '{}'),
      tokenPreview: `${t.token.substring(0, 8)}...${t.token.substring(t.token.length - 4)}`
    }));

    res.json(sanitizedTokens);
  } catch (error) {
    console.error('Error fetching embed tokens:', error);
    next(error);
  }
});

router.delete('/tokens/:tokenId', async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    await prisma.embedToken.delete({
      where: { id: tokenId }
    });

    res.json({ 
      success: true,
      message: 'Token revoked successfully',
      tokenId 
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Token not found',
        tokenId: req.params.tokenId 
      });
    }
    console.error('Error revoking token:', error);
    next(error);
  }
});

router.delete('/tokens/cleanup/expired', async (req, res, next) => {
  try {
    const result = await prisma.embedToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: `Cleaned up ${result.count} expired tokens`,
      count: result.count
    });
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
    next(error);
  }
});

router.put('/dashboard/:dashboardId/public-status', async (req, res, next) => {
  try {
    const { dashboardId } = req.params;
    const { isPublic } = req.body;

    if (typeof isPublic !== 'boolean') {
      return res.status(400).json({ 
        error: 'isPublic must be a boolean' 
      });
    }

    const dashboard = await prisma.dashboard.update({
      where: { id: dashboardId },
      data: { isPublic }
    });

    res.json({
      dashboardId: dashboard.id,
      isPublic: dashboard.isPublic,
      embedUrl: isPublic 
        ? `${req.protocol}://${req.get('host')}/embed?id=${dashboardId}`
        : null
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Dashboard not found',
        dashboardId: req.params.dashboardId 
      });
    }
    console.error('Error updating public status:', error);
    next(error);
  }
});

router.get('/dashboard/:dashboardId/public-status', async (req, res, next) => {
  try {
    const { dashboardId } = req.params;

    const dashboard = await prisma.dashboard.findUnique({
      where: { id: dashboardId },
      select: { isPublic: true }
    });

    if (!dashboard) {
      return res.status(404).json({ 
        error: 'Dashboard not found',
        dashboardId 
      });
    }

    res.json({
      dashboardId,
      isPublic: dashboard.isPublic || false
    });
  } catch (error) {
    console.error('Error fetching public status:', error);
    next(error);
  }
});

export default router;