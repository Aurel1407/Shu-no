import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logWarn, logError } from '../config/logger';

/**
 * Interface étendue pour les requêtes avec token CSRF
 */
interface CSRFRequest extends Request {
  csrfToken?: string;
}

/**
 * Génère un token CSRF pour une session utilisateur
 */
export const generateCSRFToken = (userId: number, sessionId: string): string => {
  try {
    const payload = {
      userId,
      sessionId,
      type: 'csrf',
      iat: Math.floor(Date.now() / 1000),
    };

    // Token CSRF avec expiration courte (15 minutes)
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
  } catch (error) {
    logError(new Error('Failed to generate CSRF token'), { error: (error as Error).message, userId });
    throw error;
  }
};

/**
 * Vérifie un token CSRF
 */
export const verifyCSRFToken = (token: string, userId: number, sessionId: string): boolean => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Vérifier que le token est de type CSRF
    if (decoded.type !== 'csrf') {
      logWarn('Invalid CSRF token type', { tokenType: decoded.type });
      return false;
    }

    // Vérifier que l'utilisateur correspond
    if (decoded.userId !== userId) {
      logWarn('CSRF token user mismatch', { tokenUserId: decoded.userId, requestUserId: userId });
      return false;
    }

    // Vérifier que la session correspond
    if (decoded.sessionId !== sessionId) {
      logWarn('CSRF token session mismatch', { tokenSessionId: decoded.sessionId, requestSessionId: sessionId });
      return false;
    }

    return true;
  } catch (error) {
    logWarn('CSRF token verification failed', { error: (error as Error).message });
    return false;
  }
};

/**
 * Middleware pour vérifier les tokens CSRF sur les requêtes state-changing
 */
const resolveUserFromRequest = (req: Request): { user: any | null; invalidToken: boolean } => {
  const existingUser = (req as any).user;
  if (existingUser) {
    return { user: existingUser, invalidToken: false };
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return { user: null, invalidToken: false };
  }

  const [scheme, token] = authHeader.split(' ');
  if (!token || (scheme && scheme.toLowerCase() !== 'bearer')) {
    return { user: null, invalidToken: true };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (req as any).user = decoded;
    return { user: decoded, invalidToken: false };
  } catch (error) {
    logWarn('CSRF token auth verification failed', { error: (error as Error).message });
    return { user: null, invalidToken: true };
  }
};

export const csrfProtection = (req: CSRFRequest, res: Response, next: NextFunction): void => {
  // Ne pas appliquer la protection CSRF aux requêtes GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Vérifier si l'utilisateur est authentifié
  const { user, invalidToken } = resolveUserFromRequest(req);

  if (invalidToken) {
    res.status(401).json({
      success: false,
      error: 'Token invalide',
      message: 'Le token d\'authentification fourni n\'est pas valide'
    });
    return;
  }

  if (!user) {
    return next();
  }

  // Récupérer le token CSRF depuis les headers ou le body
  const csrfToken = req.headers['x-csrf-token'] as string ||
                   req.body?._csrf ||
                   req.query._csrf as string;

  if (!csrfToken) {
    logWarn('Missing CSRF token', {
      method: req.method,
      url: req.originalUrl,
      userId: user.id,
      ip: req.ip
    });
    res.status(403).json({
      success: false,
      error: 'Token CSRF manquant',
      message: 'Un token CSRF est requis pour cette requête'
    });
    return;
  }

  // Générer un ID de session basé sur l'IP et l'user agent
  // En production, utiliser un vrai ID de session
  const sessionId = generateSessionId(req);

  // Vérifier le token CSRF
  if (!verifyCSRFToken(csrfToken, user.id, sessionId)) {
    logWarn('Invalid CSRF token', {
      method: req.method,
      url: req.originalUrl,
      userId: user.id,
      ip: req.ip
    });
    res.status(403).json({
      success: false,
      error: 'Token CSRF invalide',
      message: 'Le token CSRF fourni n\'est pas valide'
    });
    return;
  }

  // Stocker le token dans la requête pour usage ultérieur si nécessaire
  req.csrfToken = csrfToken;

  next();
};

/**
 * Génère un ID de session simple basé sur l'IP et l'user agent
 * En production, utiliser un vrai système de sessions
 */
const generateSessionId = (req: Request): string => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Créer un hash simple de l'IP et user agent
  // En production, utiliser une vraie session gérée par express-session ou similaire
  return Buffer.from(`${ip}:${userAgent}`).toString('base64').substring(0, 32);
};

/**
 * Middleware pour ajouter un token CSRF aux réponses
 * Utile pour les applications SPA qui ont besoin de récupérer un token CSRF
 */
export const csrfTokenMiddleware = (req: CSRFRequest, res: Response, next: NextFunction): void => {
  const { user } = resolveUserFromRequest(req);
  if (user) {
    const sessionId = generateSessionId(req);
    const csrfToken = generateCSRFToken(user.id, sessionId);

    // Ajouter le token CSRF dans les headers de réponse
    res.setHeader('X-CSRF-Token', csrfToken);

    // Stocker aussi dans la requête pour usage dans les contrôleurs
    req.csrfToken = csrfToken;
  }

  next();
};

/**
 * Route utilitaire pour obtenir un token CSRF
 * Utile pour les applications frontend qui ont besoin de récupérer un token
 */
export const getCSRFToken = (req: CSRFRequest, res: Response): void => {
  const { user, invalidToken } = resolveUserFromRequest(req);
  if (invalidToken) {
    res.status(401).json({
      success: false,
      error: 'Token invalide',
      message: 'Le token d\'authentification fourni n\'est pas valide'
    });
    return;
  }

  if (!user) {
    res.status(401).json({
      success: false,
      error: 'Non autorisé',
      message: 'Vous devez être connecté pour obtenir un token CSRF'
    });
    return;
  }

  const sessionId = generateSessionId(req);
  const csrfToken = generateCSRFToken(user.id, sessionId);

  res.json({
    success: true,
    data: {
      csrfToken
    }
  });
};
