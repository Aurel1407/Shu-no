import { useCallback } from "react";
import { authenticatedApiCall } from "@/lib/api-utils";

/**
 * Hook personnalisé pour les appels API authentifiés
 * Gère automatiquement la récupération du token depuis le localStorage
 */
export function useAuthenticatedApi() {
  const getAuthToken = useCallback(() => {
    return localStorage.getItem("adminToken") || localStorage.getItem("userToken");
  }, []);

  const apiCall = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }

      return authenticatedApiCall(url, options, token);
    },
    [getAuthToken]
  );

  return { apiCall, getAuthToken };
}
