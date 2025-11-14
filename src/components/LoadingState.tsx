import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props pour le composant LoadingState
 */
export interface LoadingStateProps {
  /**
   * Message descriptif du chargement en cours
   * @example "Chargement des utilisateurs"
   * @example "Sauvegarde en cours"
   */
  message?: string;

  /**
   * Taille du spinner
   * @default 'md'
   */
  size?: "sm" | "md" | "lg" | "xl";

  /**
   * Masquer le texte visuellement (sr-only) mais le garder pour les lecteurs d'écran
   * @default false
   */
  srOnly?: boolean;

  /**
   * Classes CSS supplémentaires
   */
  className?: string;

  /**
   * aria-live: contrôle l'urgence de l'annonce
   * - 'polite': Annonce à la fin de la lecture en cours (par défaut)
   * - 'assertive': Interrompt la lecture en cours
   * @default 'polite'
   */
  ariaLive?: "polite" | "assertive";
}

/**
 * Composant d'état de chargement accessible
 *
 * Conforme WCAG 2.1 - 4.1.3 Status Messages (Level AA)
 *
 * Features:
 * - role="status" pour les lecteurs d'écran
 * - aria-live="polite" (configurable)
 * - aria-busy="true" sur le conteneur
 * - Spinner animé avec aria-hidden="true"
 * - Texte descriptif obligatoire pour accessibilité
 *
 * @example
 * ```tsx
 * // Loading simple
 * <LoadingState message="Chargement des données" />
 *
 * // Loading avec spinner petit
 * <LoadingState message="Envoi en cours" size="sm" />
 *
 * // Loading sr-only (pour boutons)
 * <LoadingState message="Connexion en cours" srOnly />
 *
 * // Loading urgent (erreur critique)
 * <LoadingState
 *   message="Erreur de connexion, reconnexion..."
 *   ariaLive="assertive"
 * />
 * ```
 */
export function LoadingState({
  message = "Chargement en cours",
  size = "md",
  srOnly = false,
  className,
  ariaLive = "polite",
}: Readonly<LoadingStateProps>) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <output
      aria-live={ariaLive}
      aria-busy="true"
      className={cn("flex items-center gap-3", className)}
    >
      {/* Spinner animé, masqué pour les lecteurs d'écran */}
      <Loader2
        className={cn(sizeClasses[size], "animate-spin text-primary", srOnly && "sr-only")}
        aria-hidden="true"
      />

      {/* Message descriptif */}
      <span className={cn(textSizeClasses[size], "text-muted-foreground", srOnly && "sr-only")}>
        {message}
      </span>
    </output>
  );
}

/**
 * Composant d'état de chargement pleine page
 *
 * Utilisé pour les pages entières en chargement
 *
 */
export interface LoadingStatePageProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LoadingStatePage({
  message = "Chargement de la page",
  size = "lg",
}: Readonly<LoadingStatePageProps>) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingState message={message} size={size} />
    </div>
  );
}

/**
 * Composant d'état de chargement inline (pour boutons)
 *
 * Utilisé dans les boutons pendant les actions
 *
 */
export interface LoadingStateInlineProps {
  message: string;
}

export function LoadingStateInline({ message }: Readonly<LoadingStateInlineProps>) {
  return (
    <output aria-live="polite" className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      <span>{message}</span>
    </output>
  );
}

export default LoadingState;
