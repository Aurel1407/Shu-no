import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logError, logDebug, logWarn } from '../config/logger';

interface AuthRequest extends Request {
  user?: any;
}

// Vérification de la présence du JWT_SECRET au démarrage
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for security');
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  logDebug('Auth middleware validation attempt', { 
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  if (!token) {
    logWarn('Authentication failed: missing token', { ip: req.ip });
    return res.status(401).json({ success: false, error: 'Token d\'authentification requis' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) {
      logWarn('Authentication failed: invalid token', { 
        error: err.message,
        ip: req.ip 
      });
      return res.status(401).json({ success: false, error: 'Token invalide' });
    }

    logDebug('Authentication successful', { 
      userId: user?.id,
      userRole: user?.role 
    });
    req.user = user;
    next();
  });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  logDebug('Admin authorization check', { 
    userId: req.user?.id,
    userRole: req.user?.role 
  });

  if (req.user?.role !== 'admin') {
    logWarn('Admin access denied: insufficient privileges', { 
      userId: req.user?.id,
      userRole: req.user?.role,
      ip: req.ip 
    });
    return res.status(403).json({ success: false, error: 'Accès refusé : rôle admin requis' });
  }

  logDebug('Admin access granted', { userId: req.user?.id });
  next();
};
