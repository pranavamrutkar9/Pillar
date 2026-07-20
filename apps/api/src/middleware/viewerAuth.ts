import { NextFunction, Request, Response } from 'express';
import { getToken } from 'next-auth/jwt';
import { prisma } from '../db/client.js';

declare global {
  namespace Express {
    interface Request {
      viewer?: {
        projectId: string;
        role: string;
      };
    }
  }
}

export const viewerAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check JWT (Standard User Auth via Next-Auth)
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
    
    const token = await getToken({ 
      req: req as any, 
      secret 
    });

    if (token && token.sub) {
      req.user = { id: token.sub };
      return next();
    }

    // 2. Check Viewer Token (Public Read-Only Auth)
    const viewerToken = req.headers['x-viewer-token'] || req.query.viewerToken;
    
    if (viewerToken && typeof viewerToken === 'string') {
      const share = await prisma.projectShare.findUnique({
        where: { token: viewerToken },
        include: { project: true }
      });
      
      if (share && (!share.expiresAt || share.expiresAt > new Date())) {
        req.viewer = {
          projectId: share.projectId,
          role: 'VIEWER'
        };
        return next();
      }
    }

    // 3. Neither valid JWT nor valid Viewer Token
    res.status(401).json({ error: 'Unauthorized' });
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
