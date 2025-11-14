/**
 * Classes d'erreurs personnalisées pour l'application
 */

/**
 * Interface pour la réponse d'erreur standardisée
 */
interface ErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  statusCode: number;
  details?: unknown;
  stack?: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: unknown
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintenir la pile d'appels
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erreur de validation (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: unknown) {
    super(message, 400, true, context);
  }
}

/**
 * Erreur d'authentification (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentification requise', context?: unknown) {
    super(message, 401, true, context);
  }
}

/**
 * Erreur d'autorisation (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Accès non autorisé', context?: unknown) {
    super(message, 403, true, context);
  }
}

/**
 * Erreur de ressource non trouvée (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Ressource', context?: unknown) {
    super(`${resource} non trouvé(e)`, 404, true, context);
  }
}

/**
 * Erreur de conflit (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: unknown) {
    super(message, 409, true, context);
  }
}

/**
 * Erreur de limite de taux dépassée (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Trop de requêtes, réessayez plus tard', context?: unknown) {
    super(message, 429, true, context);
  }
}

/**
 * Erreur de base de données
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: unknown) {
    super(message, 500, true, context);
  }
}

/**
 * Erreur de service externe
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string, context?: unknown) {
    super(message || `Erreur du service externe: ${service}`, 502, true, context);
  }
}

/**
 * Fonction utilitaire pour créer des erreurs rapidement
 */
export const createError = {
  validation: (message: string, context?: unknown) => new ValidationError(message, context),
  authentication: (message?: string, context?: unknown) =>
    new AuthenticationError(message, context),
  authorization: (message?: string, context?: unknown) => new AuthorizationError(message, context),
  notFound: (resource?: string, context?: unknown) => new NotFoundError(resource, context),
  conflict: (message: string, context?: unknown) => new ConflictError(message, context),
  rateLimit: (message?: string, context?: unknown) => new RateLimitError(message, context),
  database: (message: string, context?: unknown) => new DatabaseError(message, context),
  externalService: (service: string, message?: string, context?: unknown) =>
    new ExternalServiceError(service, message, context),
};

/**
 * Utilitaires pour la gestion d'erreurs
 */
export const errorUtils = {
  /**
   * Vérifie si une erreur est opérationnelle (doit être loggée comme avertissement)
   */
  isOperationalError: (error: Error): boolean => {
    return error instanceof AppError && error.isOperational;
  },

  /**
   * Vérifie si une erreur doit être rapportée (erreurs non opérationnelles)
   */
  shouldReportError: (error: Error): boolean => {
    return !(error instanceof AppError) || !error.isOperational;
  },

  /**
   * Extrait le message d'erreur pour les logs
   */
  getErrorMessage: (error: Error): string => {
    if (error instanceof AppError) {
      return `${error.constructor.name}: ${error.message}`;
    }
    return error.message || 'Unknown error';
  },

  /**
   * Crée une réponse d'erreur standardisée
   */
  createErrorResponse: (error: Error | AppError, includeStack: boolean = false): ErrorResponse => {
    const baseResponse = {
      success: false as const,
      error: error.message,
      timestamp: new Date().toISOString(),
    };

    if (error instanceof AppError) {
      const response: ErrorResponse = {
        ...baseResponse,
        statusCode: error.statusCode,
      };

      // Ajouter le contexte s'il existe et si c'est un objet valide
      if (error.context && typeof error.context === 'object' && error.context !== null) {
        response.details = error.context;
      }

      if (includeStack && error.stack) {
        response.stack = error.stack;
      }

      return response;
    }

    return {
      ...baseResponse,
      statusCode: 500,
      ...(includeStack && error.stack && { stack: error.stack }),
    };
  },
};
