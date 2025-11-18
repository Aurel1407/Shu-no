import { toast } from "sonner";

/**
 * Types d'erreurs supportés
 */
export type ErrorType = "error" | "warning" | "info";

/**
 * Interface pour les erreurs API
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
  details?: Record<string, unknown>;
  requestId?: string;
}

/**
 * Métriques d'erreur pour le monitoring
 */
interface ErrorMetrics {
  total: number;
  byType: Record<ErrorType, number>;
  byStatusCode: Record<number, number>;
  byContext: Record<string, number>;
  recent: Array<{
    timestamp: Date;
    type: ErrorType;
    context: string;
    message: string;
  }>;
}

/**
 * Service centralisé de gestion d'erreurs avec métriques
 */
export class ErrorService {
  private static instance: ErrorService;
  private metrics: ErrorMetrics;
  private readonly maxRecentErrors = 50;

  private constructor() {
    this.metrics = {
      total: 0,
      byType: { error: 0, warning: 0, info: 0 },
      byStatusCode: {},
      byContext: {},
      recent: [],
    };
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  /**
   * Traite une erreur et affiche une notification appropriée
   */
  handleError(error: Error | ApiError | string, context?: string): void {
    const errorInfo = this.parseError(error);

    // Mettre à jour les métriques
    this.updateMetrics(errorInfo, context);

    // Logger l'erreur pour le debugging
    console.error(`[${context || "App"}]`, errorInfo);

    // Afficher la notification utilisateur
    this.showErrorNotification(errorInfo.message);
  }

  /**
   * Traite une erreur API spécifiquement
   */
  handleApiError(error: ApiError, context?: string): void {
    // Mettre à jour les métriques spécifiques API
    this.updateApiMetrics(error, context);

    // Logger l'erreur détaillée
    console.error(`[API Error - ${context || "Unknown"}]`, {
      statusCode: error.statusCode,
      path: error.path,
      requestId: error.requestId,
      details: error.details,
      timestamp: error.timestamp,
    });

    // Pour les erreurs 5xx, suggérer de réessayer
    if (error.statusCode >= 500) {
      this.showRetryNotification(error.message);
      return;
    }

    // Pour les erreurs 4xx, afficher le message directement
    this.showErrorNotification(error.message);
  }

  /**
   * Affiche une notification d'erreur générique
   */
  private showErrorNotification(message: string): void {
    toast.error(message, {
      duration: 5000,
      action: {
        label: "Fermer",
        onClick: () => {},
      },
    });
  }

  /**
   * Affiche une notification avec option de retry
   */
  private showRetryNotification(message: string): void {
    toast.error(message, {
      duration: 7000,
      action: {
        label: "Réessayer",
        onClick: () => window.location.reload(),
      },
    });
  }

  /**
   * Affiche une notification de succès
   */
  showSuccess(message: string): void {
    toast.success(message, {
      duration: 3000,
    });
  }

  /**
   * Affiche une notification d'information
   */
  showInfo(message: string): void {
    toast.info(message, {
      duration: 4000,
    });
  }

  /**
   * Affiche une notification d'avertissement
   */
  showWarning(message: string): void {
    toast.warning(message, {
      duration: 4000,
    });
  }

  /**
   * Parse différents types d'erreurs
   */
  private parseError(error: Error | ApiError | string): {
    message: string;
    type: ErrorType;
    originalError?: Error | ApiError;
  } {
    if (typeof error === "string") {
      return {
        message: error,
        type: "error",
      };
    }

    if (this.isApiError(error)) {
      return {
        message: error.message,
        type: this.getErrorTypeFromStatus(error.statusCode),
        originalError: error,
      };
    }

    // Erreur JavaScript standard
    return {
      message: error.message || "Une erreur inattendue s'est produite",
      type: "error",
      originalError: error,
    };
  }

  /**
   * Vérifie si l'erreur est une ApiError
   */
  private isApiError(error: unknown): error is ApiError {
    return error !== null && typeof error === "object" && "statusCode" in error && "message" in error;
  }

  /**
   * Détermine le type d'erreur basé sur le status code
   */
  private getErrorTypeFromStatus(statusCode: number): ErrorType {
    if (statusCode >= 500) return "error";
    if (statusCode >= 400) return "warning";
    return "info";
  }

  /**
   * Met à jour les métriques générales
   */
  private updateMetrics(errorInfo: ReturnType<typeof this.parseError>, context?: string): void {
    this.metrics.total++;
    this.metrics.byType[errorInfo.type]++;

    if (context) {
      this.metrics.byContext[context] = (this.metrics.byContext[context] || 0) + 1;
    }

    // Ajouter aux erreurs récentes
    this.metrics.recent.unshift({
      timestamp: new Date(),
      type: errorInfo.type,
      context: context || "Unknown",
      message: errorInfo.message,
    });

    // Limiter le nombre d'erreurs récentes
    if (this.metrics.recent.length > this.maxRecentErrors) {
      this.metrics.recent = this.metrics.recent.slice(0, this.maxRecentErrors);
    }
  }

  /**
   * Met à jour les métriques spécifiques aux API
   */
  private updateApiMetrics(error: ApiError, context?: string): void {
    this.metrics.byStatusCode[error.statusCode] =
      (this.metrics.byStatusCode[error.statusCode] || 0) + 1;
    this.updateMetrics(
      {
        message: error.message,
        type: this.getErrorTypeFromStatus(error.statusCode),
      },
      context || "API"
    );
  }

  /**
   * Récupère les métriques d'erreur
   */
  getMetrics(): ErrorMetrics {
    return { ...this.metrics };
  }

  /**
   * Réinitialise les métriques
   */
  resetMetrics(): void {
    this.metrics = {
      total: 0,
      byType: { error: 0, warning: 0, info: 0 },
      byStatusCode: {},
      byContext: {},
      recent: [],
    };
  }

  /**
   * Exporte les métriques pour le monitoring externe
   */
  exportMetrics(): {
    timestamp: string;
    total: number;
    byType: Record<ErrorType, number>;
    byStatusCode: Record<number, number>;
    byContext: Record<string, number>;
    recent: Array<{ timestamp: Date; message: string; type: ErrorType; context?: string }>;
  } {
    return {
      timestamp: new Date().toISOString(),
      ...this.metrics,
      recent: this.metrics.recent.slice(0, 10), // Dernières 10 erreurs seulement
    };
  }

  /**
   * Crée un message d'erreur formaté pour les logs
   */
  formatLogMessage(error: Error | ApiError | string | unknown, context?: string): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}] ` : "";
    const message = 
      typeof error === "string" 
        ? error 
        : (error as Error | ApiError)?.message || "Unknown error";

    return `${timestamp} ${contextStr}${message}`;
  }
}

// Instance globale
export const errorService = ErrorService.getInstance();
