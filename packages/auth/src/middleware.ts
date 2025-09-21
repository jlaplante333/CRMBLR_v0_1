import { Request, Response, NextFunction } from 'express';
import { cognitoAuth } from './cognito';
import { JWTPayload } from '@crmblr/types';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
  tenantId?: string;
}

export function authMiddleware() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
      }

      const token = authHeader.substring(7);
      const payload = await cognitoAuth.verifyToken(token);
      
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      req.user = payload;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({ error: 'Authentication failed' });
    }
  };
}

export function tenantMiddleware() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.headers['x-tenant-id'] as string;
      
      if (!tenantId) {
        return res.status(400).json({ error: 'Missing tenant ID' });
      }

      // TODO: Verify user has access to this tenant
      req.tenantId = tenantId;
      next();
    } catch (error) {
      console.error('Tenant middleware error:', error);
      return res.status(400).json({ error: 'Invalid tenant ID' });
    }
  };
}
