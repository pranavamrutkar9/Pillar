import { NextFunction, Request, Response } from 'express';
import { getToken } from 'next-auth/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Make sure your Express server has access to the NEXTAUTH_SECRET env variable
    // It should match the secret used in your Next.js application
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
    
    // next-auth/jwt's getToken handles both cookies and Bearer tokens in headers
    const token = await getToken({ 
      req: req as any, 
      secret 
    });

    if (!token || !token.sub) {
       res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
       return;
    }

    // Attach user id to the request object
    req.user = { id: token.sub };
    
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    res.status(401).json({ error: 'Unauthorized: Authentication failed' });
    return;
  }
};
