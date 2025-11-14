import { useRef, useEffect } from "react";

/**
 * Hook personnalisé pour gérer le focus automatique sur le contenu principal
 * Utilise un délai pour s'assurer que le DOM est prêt
 */
export function usePageFocus(delay: number = 0) {
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusTimer = setTimeout(() => {
      if (mainContentRef.current) {
        mainContentRef.current.focus();
      }
    }, delay);

    return () => clearTimeout(focusTimer);
  }, [delay]);

  return mainContentRef;
}
