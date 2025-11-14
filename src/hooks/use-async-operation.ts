import { useState, useCallback } from "react";
import { errorService } from "@/lib/error-service";

/**
 * Options pour le hook useAsyncOperation
 */
export interface AsyncOperationOptions {
  /** Nombre maximum de tentatives */
  maxRetries?: number;
  /** Délai entre les tentatives (en ms) */
  retryDelay?: number;
  /** Fonction appelée en cas de succès */
  onSuccess?: () => void;
  /** Fonction appelée en cas d'erreur */
  onError?: (error: Error) => void;
  /** Contexte pour les logs d'erreur */
  context?: string;
  /** Afficher automatiquement les erreurs */
  showErrorToast?: boolean;
}

/**
 * Hook personnalisé amélioré pour gérer les opérations asynchrones
 * Inclut retry automatique, gestion d'erreurs centralisée et notifications
 */
export function useAsyncOperation<T extends any[]>(
  operation: (...args: T) => Promise<void>,
  options: AsyncOperationOptions = {}
) {
  const {
    maxRetries = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
    context = "AsyncOperation",
    showErrorToast = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(
    async (...args: T): Promise<{ success: boolean; error?: Error }> => {
      try {
        setLoading(true);
        setError(null);

        await operation(...args);
        onSuccess?.();
        return { success: true }; // Succès
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));

        // Préserver les propriétés de l'erreur originale
        if (typeof err === "object" && err !== null) {
          Object.assign(errorObj, err);
        }

        const errorMessage = errorObj.message;

        setError(errorMessage);

        // Gestion centralisée des erreurs
        if (showErrorToast) {
          errorService.handleError(errorObj, context);
        }

        onError?.(errorObj);

        // Log détaillé pour le debugging
        console.error(`[${context}] Operation failed:`, {
          error: errorObj.message,
          stack: errorObj.stack,
          retryCount,
          args,
        });

        return { success: false, error: errorObj }; // Échec
      } finally {
        setLoading(false);
      }
    },
    [operation, onSuccess, onError, context, showErrorToast, retryCount]
  );

  const executeWithRetry = useCallback(
    async (...args: T) => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        setRetryCount(attempt);
        const result = await execute(...args);

        if (result.success) {
          return; // Succès, sortir de la boucle
        }

        // Récupérer l'erreur
        lastError = result.error || null;

        // Ne pas retry pour les erreurs 4xx (erreurs client)
        if (lastError && isClientError(lastError)) {
          // Remettre l'erreur dans l'état pour que l'utilisateur la voie
          setError(lastError.message);
          return; // Ne pas relancer, mais marquer comme erreur finale
        }

        // Si ce n'est pas la dernière tentative, attendre avant de retry
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }

      // Toutes les tentatives ont échoué - remettre la dernière erreur
      if (lastError) {
        setError(lastError.message);
      }
    },
    [execute, maxRetries, retryDelay]
  );

  const resetError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const isClientError = (error: Error): boolean => {
    // Vérifier si c'est une erreur API avec status code
    const apiError = error as any;
    if (apiError.statusCode && apiError.statusCode >= 400 && apiError.statusCode < 500) {
      return true;
    }

    // Erreurs qui ne devraient pas être retentées
    const clientErrorMessages = [
      "authentification",
      "autorisation",
      "non trouvé",
      "invalide",
      "requise",
    ];

    const message = error.message.toLowerCase();
    return clientErrorMessages.some((keyword) => message.includes(keyword));
  };

  return {
    loading,
    error,
    retryCount,
    execute: maxRetries > 0 ? executeWithRetry : execute,
    executeOnce: execute, // Version sans retry
    resetError,
    setError,
    get canRetry() {
      return retryCount < maxRetries;
    },
  };
}
