import { getApiUrl } from "../config/api";
import { errorService, ApiError } from "./error-service";

/**
 * Options pour les appels API
 */
export interface ApiCallOptions extends RequestInit {
  /** Afficher automatiquement les erreurs */
  showErrorToast?: boolean;
  /** Contexte pour les logs d'erreur */
  context?: string;
  /** Nombre maximum de tentatives */
  maxRetries?: number;
  /** Délai entre les tentatives (en ms) */
  retryDelay?: number;
}

/**
 * Fonction utilitaire centralisée pour les appels API avec gestion d'erreurs améliorée
 */
export const apiCall = async <T = unknown>(url: string, options: ApiCallOptions = {}): Promise<T> => {
  const {
    showErrorToast = true,
    context = "API Call",
    maxRetries = 0,
    retryDelay = 1000,
    ...fetchOptions
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Si l'URL ne commence pas par http, on la considère comme un endpoint relatif
      const fullUrl = url && url.startsWith("http") ? url : getApiUrl(url || "");

      const response = await fetch(fullUrl, {
        headers: {
          "Content-Type": "application/json",
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });

      if (!response.ok) {
        // Essayer de parser l'erreur JSON du serveur
        let errorData: ApiError;
        try {
          errorData = await response.json();
        } catch {
          // Si pas de JSON, créer une erreur générique
          errorData = {
            error: "API",
            message: `Erreur API: ${response.status} ${response.statusText}`,
            statusCode: response.status,
            timestamp: new Date().toISOString(),
            path: fullUrl,
          };
        }

        const apiError = new Error(errorData.message) as Error & {
          statusCode: number;
          details: ApiError;
        };
        apiError.statusCode = response.status;
        apiError.details = errorData;

        // Pour les erreurs serveur (5xx), retry si ce n'est pas la dernière tentative
        if (response.status >= 500 && attempt < maxRetries) {
          lastError = apiError;
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }

        // Pour les erreurs client (4xx) ou dernière tentative, lever l'erreur
        if (showErrorToast) {
          errorService.handleApiError(errorData, context);
        }

        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Pour les erreurs réseau, retry si configuré
      if (isNetworkError(lastError) && attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }

      // Erreur finale - logger et afficher si demandé
      if (showErrorToast && !isApiError(lastError)) {
        errorService.handleError(lastError, context);
      }

      break; // Sortir de la boucle de retry
    }
  }

  throw lastError;
};

/**
 * Fonction pour les appels API avec gestion d'authentification
 */
export const authenticatedApiCall = async <T = unknown>(
  url: string,
  options: ApiCallOptions = {},
  token?: string
): Promise<T> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Pour les opérations qui modifient les données, ajouter le token CSRF
  const method = options.method?.toUpperCase();
  if (method && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    try {
      const csrfResponse = await fetch(getApiUrl("/api/csrf-token"), {
        credentials: "include",
        headers: { Authorization: headers.Authorization },
      });

      if (csrfResponse.ok) {
        const csrfData = await csrfResponse.json();

        // Récupérer le token CSRF selon la structure de réponse
        let token = null;
        if (csrfData.data && csrfData.data.csrfToken) {
          token = csrfData.data.csrfToken;
        } else if (csrfData.data && csrfData.data.token) {
          token = csrfData.data.token;
        } else if (csrfData.token) {
          token = csrfData.token;
        } else if (csrfData.csrfToken) {
          token = csrfData.csrfToken;
        }

        if (token) {
          headers["X-Csrf-Token"] = token;
        }
      }
    } catch (error) {
      console.warn("⚠️ Impossible de récupérer le token CSRF:", error);
    }
  }

  return apiCall(url, {
    ...options,
    headers,
  });
};

/**
 * Vérifie si l'erreur est une erreur réseau
 */
function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    "fetch",
    "network",
    "connection",
    "timeout",
    "ECONNREFUSED",
    "ENOTFOUND",
  ];

  const message = error.message.toLowerCase();
  return networkErrorMessages.some((keyword) => message.includes(keyword));
}

/**
 * Vérifie si l'erreur est déjà une ApiError traitée
 */
function isApiError(error: unknown): boolean {
  return error !== null && typeof error === "object" && "statusCode" in error && "details" in error;
}
