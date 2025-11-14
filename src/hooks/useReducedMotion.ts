import { useState, useEffect } from 'react';

/**
 * Hook qui détecte la préférence "Réduire le mouvement" de l'utilisateur
 * Conforme WCAG 2.3.3 Animation from Interactions (Level AAA)
 * 
 * @returns {boolean} true si l'utilisateur préfère réduire les animations
 * 
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * <div className={prefersReducedMotion ? '' : 'animate-pulse'}>
 *   Contenu
 * </div>
 */
export const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Vérifier le support de prefers-reduced-motion
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)');
    
    // Définir l'état initial
    setPrefersReducedMotion(mediaQuery.matches);

    // Écouter les changements (si l'utilisateur modifie les paramètres système)
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Ajouter l'écouteur d'événement
    mediaQuery.addEventListener('change', handleChange);

    // Nettoyer l'écouteur lors du démontage
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
};
