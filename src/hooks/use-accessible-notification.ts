import { useCallback } from "react";

type NotificationType = "success" | "error" | "info" | "warning";

/**
 * Hook pour annoncer des messages via aria-live
 * Complément aux notifications visuelles pour l'accessibilité
 */
export const useAccessibleNotification = () => {
  const announce = useCallback((message: string, type: NotificationType = "info") => {
    try {
      const liveRegion = document.getElementById("aria-live-region");
      if (liveRegion) {
        // Définir le rôle approprié
        liveRegion.setAttribute("role", type === "error" ? "alert" : "status");

        // Attendre un tick pour que le lecteur d'écran détecte le changement
        setTimeout(() => {
          liveRegion.textContent = message;
        }, 100);

        // Réinitialiser après 5 secondes
        setTimeout(() => {
          liveRegion.textContent = "";
        }, 5000);
      }
    } catch (error) {
      console.warn("Could not announce notification:", error);
    }
  }, []);

  return { announce };
};
