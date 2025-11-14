import { useEffect } from "react";

/**
 * Hook personnalisé pour gérer le titre de la page
 * Met automatiquement à jour document.title et nettoie à la sortie
 */
export function usePageTitle(title: string, suffix: string = " - Shu-no") {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title + suffix;

    return () => {
      document.title = previousTitle;
    };
  }, [title, suffix]);
}
