import { Request, Response, NextFunction } from 'express';
import { AppError, errorUtils } from '../utils/errors';
import { logger, logError } from '../config/logger';

/**
 * Interface pour les réponses d'erreur standardisées
 */
interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

/**
 * Middleware de gestion d'erreurs centralisée
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Générer un ID unique pour la requête (pour traçabilité)
  const requestId = req.headers['x-request-id'] as string || generateRequestId();

  // Gestion spéciale des erreurs SQLite
  if (err.name === 'QueryFailedError' && err.message.includes('SQLITE_CONSTRAINT')) {
    let statusCode = 400;
    let message = 'Les données fournies ne respectent pas les contraintes.';
    
    if (err.message.includes('UNIQUE constraint failed')) {
      statusCode = 409;
      if (err.message.includes('user.email')) {
        message = 'Un utilisateur avec cet email existe déjà.';
      } else {
        message = 'Cette ressource existe déjà.';
      }
    } else if (err.message.includes('NOT NULL constraint failed')) {
      statusCode = 400;
      if (err.message.includes('product.description')) {
        message = 'La description du produit est obligatoire.';
      } else {
        message = 'Un champ obligatoire est manquant.';
      }
    }

    const errorResponse = {
      success: false,
      error: 'ValidationError',
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      requestId
    };

    logError(err, {
      requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: (req as any).user?.id,
      body: sanitizeBody(req.body),
      query: req.query,
      params: req.params,
      statusCode,
      isOperational: true,
      context: {}
    });

    res.status(statusCode).json(errorResponse);
    return;
  }

  // Déterminer le statut HTTP et si l'erreur est opérationnelle
  let statusCode = 500;
  let isOperational = false;
  let context: Record<string, unknown> = {};

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    isOperational = err.isOperational;
    context = (err.context as Record<string, unknown>) || {};
  }

  // Construire les métadonnées pour les logs
  const errorMetadata = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as Request & { user?: { id: string } }).user?.id,
    body: sanitizeBody(req.body),
    query: req.query,
    params: req.params,
    statusCode,
    isOperational,
    context
  };

  // Logger l'erreur
  logError(err, errorMetadata);

  // Construire la réponse d'erreur
  const errorResponse: ErrorResponse = {
    success: false,
    error: getErrorType(err),
    message: getErrorMessage(err, isOperational),
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    requestId
  };

  // Ajouter des détails en développement
  if (process.env.NODE_ENV === 'development') {
    errorResponse.details = {
      stack: err.stack,
      context,
      originalMessage: err.message
    };
  }

  // Envoyer la réponse
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware pour capturer les erreurs des routes async
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware pour les routes non trouvées (404)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} non trouvée`,
    404,
    true,
    {
      method: req.method,
      url: req.originalUrl,
      availableRoutes: getAvailableRoutes()
    }
  );

  next(error);
};

/**
 * Gestionnaire d'erreurs pour les promises non gérées
 */
export const setupGlobalErrorHandlers = (): void => {
  // Promises rejetées non gérées
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled Promise Rejection', {
      reason: error.message,
      stack: error.stack,
      promise: promise.toString()
    });

    // Fermer le serveur gracieusement
    if (!isOperational(reason)) {
      logger.error('Non-operational error detected. Shutting down...');
      process.exit(1);
    }
  });

  // Exceptions non gérées
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', {
      message: error.message,
      stack: error.stack
    });

    // Toujours arrêter pour les exceptions non gérées
    logger.error('Uncaught exception detected. Shutting down...');
    process.exit(1);
  });
};

/**
 * Fonctions utilitaires
 */

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getErrorType(err: Error): string {
  if (err instanceof AppError) {
    return err.constructor.name.replace('Error', '');
  }
  
  // Erreurs TypeORM
  if (err.name === 'QueryFailedError') return 'DatabaseQuery';
  if (err.name === 'EntityNotFoundError') return 'EntityNotFound';
  if (err.name === 'CannotCreateEntityIdMapError') return 'DatabaseMapping';
  
  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') return 'InvalidToken';
  if (err.name === 'TokenExpiredError') return 'ExpiredToken';
  
  // Erreurs Express/Validation
  if (err.name === 'ValidationError') return 'Validation';
  if (err.name === 'CastError') return 'InvalidFormat';
  
  return 'Internal';
}

function getErrorMessage(err: Error, isOperational: boolean): string {
  // En production, ne pas exposer les détails des erreurs non opérationnelles
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    return 'Une erreur inattendue s\'est produite. Nos équipes ont été notifiées et travaillent à résoudre le problème.';
  }

  // Messages user-friendly pour les erreurs communes
  if (err instanceof AppError) {
    // Les AppError ont déjà des messages appropriés
    return err.message;
  }

  // Erreurs de base de données
  if (err.name === 'QueryFailedError') {
    if (err.message.includes('duplicate key')) {
      return 'Ces informations existent déjà dans notre système.';
    }
    if (err.message.includes('foreign key')) {
      return 'Impossible de supprimer cette ressource car elle est utilisée ailleurs.';
    }
    return 'Erreur lors de l\'accès aux données. Veuillez réessayer.';
  }

  if (err.name === 'EntityNotFoundError') {
    return 'Les informations demandées n\'existent pas.';
  }

  // Erreurs d'authentification
  if (err.name === 'JsonWebTokenError') {
    return 'Session invalide. Veuillez vous reconnecter.';
  }

  if (err.name === 'TokenExpiredError') {
    return 'Votre session a expiré. Veuillez vous reconnecter.';
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return 'Les informations fournies ne sont pas valides. Veuillez vérifier vos données.';
  }

  // Erreurs réseau/service externe
  if (err.message.includes('ECONNREFUSED') || err.message.includes('ENOTFOUND')) {
    return 'Service temporairement indisponible. Veuillez réessayer dans quelques instants.';
  }

  // Erreur par défaut
  return 'Une erreur inattendue s\'est produite. Veuillez réessayer ou contacter le support si le problème persiste.';
}

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== 'object') return body;

  // Supprimer les champs sensibles des logs
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
  const sanitized = { ...(body as Record<string, unknown>) };

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });

  return sanitized;
}

function isOperational(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

function getAvailableRoutes(): string[] {
  // Retourner une liste des routes principales disponibles
  return [
    'GET /api/health',
    'GET /api/users',
  'POST /api/auth/login',
    'GET /api/products',
    'GET /api/orders',
    'GET /api/price-periods'
  ];
}
