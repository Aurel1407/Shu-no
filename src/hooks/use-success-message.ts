import { useCallback } from "react";

/**
 * Hook personnalisé pour afficher des messages de succès temporaires
 * Crée automatiquement un élément DOM temporaire qui se supprime après un délai
 */
export function useSuccessMessage() {
  const showSuccessMessage = useCallback((message: string, duration: number = 3000) => {
    const successMessage = document.createElement("div");
    successMessage.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300";
    successMessage.textContent = message;
    successMessage.style.opacity = "0";

    document.body.appendChild(successMessage);

    // Animation d'apparition
    requestAnimationFrame(() => {
      successMessage.style.opacity = "1";
    });

    // Suppression automatique
    setTimeout(() => {
      successMessage.style.opacity = "0";
      setTimeout(() => {
        if (successMessage.parentNode) {
          successMessage.parentNode.removeChild(successMessage);
        }
      }, 300);
    }, duration);
  }, []);

  return { showSuccessMessage };
}
