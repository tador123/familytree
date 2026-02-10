/**
 * Authentication Middleware
 * Extracts userId from Bearer token via session lookup.
 */

import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Require authentication — rejects with 401 if no valid session.
 * Use on write operations (POST, PUT, PATCH, DELETE).
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const session = await prisma.session.findFirst({
      where: { token, expiresAt: { gt: new Date() } },
    });

    if (!session) {
      res.status(401).json({ success: false, error: 'Invalid or expired session' });
      return;
    }

    req.userId = session.userId;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ success: false, error: 'Authentication check failed' });
  }
}

/**
 * Optional authentication — sets req.userId if valid session exists, otherwise continues.
 * Use on read operations where guests get empty data and users get their own data.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      const session = await prisma.session.findFirst({
        where: { token, expiresAt: { gt: new Date() } },
      });

      if (session) {
        req.userId = session.userId;
      }
    }

    next();
  } catch (error) {
    // Don't block request on auth failure for optional auth
    console.error('Optional auth middleware error:', error);
    next();
  }
}
