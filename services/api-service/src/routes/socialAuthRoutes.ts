/**
 * Social Authentication Routes
 * Handles Google Sign-In token verification
 */

import { Router, Request, Response } from 'express';
import { randomBytes } from 'crypto';
import prisma from '../lib/prisma';

const router = Router();

// ==================== STATUS CHECK ====================

/**
 * Check which social auth providers are configured
 * GET /api/v1/social-auth/status
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    google: !!(process.env.GOOGLE_CLIENT_ID),
  });
});

// ==================== GOOGLE SIGN-IN ====================

/**
 * Google Sign-In - Verify ID token from frontend
 * POST /api/v1/social-auth/google/verify
 * 
 * Uses Google's client-side "Sign In With Google" button.
 * Frontend gets a credential JWT and sends it here for verification.
 */
router.post('/google/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      res.status(503).json({ 
        error: 'Google Sign-In not configured',
        message: 'Set GOOGLE_CLIENT_ID in docker-compose.yml',
      });
      return;
    }

    if (!credential) {
      res.status(400).json({ error: 'Missing credential token' });
      return;
    }

    // Verify the Google ID token via Google's tokeninfo endpoint
    const verifyResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!verifyResponse.ok) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    const payload = await verifyResponse.json();

    if (payload.aud !== clientId) {
      res.status(401).json({ error: 'Token not intended for this app' });
      return;
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const profilePicture = payload.picture;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(googleId ? [{ googleId }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (user && !user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId, name: user.name || name,
          profilePicture: profilePicture || user.profilePicture,
          authProvider: 'google', isVerified: true, lastLogin: new Date(),
        },
      });
    } else if (!user) {
      user = await prisma.user.create({
        data: {
          googleId, email, name, profilePicture,
          authProvider: 'google', isVerified: true, isActive: true, lastLogin: new Date(),
        },
      });
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date(), profilePicture: profilePicture || user.profilePicture },
      });
    }

    // Create session
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.session.create({ data: { userId: user.id, token, expiresAt } });

    console.log(`✅ Google login successful for: ${email || name || user.id}`);

    res.json({
      success: true, token,
      user: { id: user.id, email: user.email, name: user.name, profilePicture: user.profilePicture, authProvider: 'google' },
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ==================== USER INFO ====================

router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'No authorization header' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const session = await prisma.session.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
      include: { user: true },
    });

    if (!session) {
      res.status(401).json({ error: 'Invalid or expired session' });
      return;
    }

    const { user } = session;
    res.json({
      id: user.id, email: user.email, name: user.name,
      profilePicture: user.profilePicture, authProvider: user.authProvider,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
