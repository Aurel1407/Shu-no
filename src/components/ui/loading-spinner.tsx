import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
  variant?: "default" | "primary" | "secondary" | "muted";
  showText?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const variantClasses = {
  default: "text-foreground",
  primary: "text-primary",
  secondary: "text-secondary",
  muted: "text-muted-foreground",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
  variant = "default",
  showText = true,
}) => {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loader2
        className={cn("animate-spin", sizeClasses[size], variantClasses[variant])}
        aria-hidden="true"
      />
      {showText && text && <span className={cn("text-sm", variantClasses[variant])}>{text}</span>}
    </div>
  );
};

// Composant spécialisé pour les boutons
interface ButtonLoadingSpinnerProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const ButtonLoadingSpinner: React.FC<ButtonLoadingSpinnerProps> = ({
  loading,
  children,
  loadingText,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      <span>{loading ? loadingText || "Chargement..." : children}</span>
    </div>
  );
};

// Composant pour les états de chargement de page entière
interface PageLoadingProps {
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = "Chargement en cours...",
  className,
}) => {
  return (
    <div
      className={cn("flex flex-col items-center justify-center min-h-[200px] space-y-4", className)}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <LoadingSpinner size="lg" variant="primary" />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
};

// Composant pour les états de chargement inline
interface InlineLoadingProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = "Chargement...",
  className,
  size = "md",
}) => {
  return (
    <div className={cn("flex items-center space-x-2", className)} role="status" aria-live="polite">
      <LoadingSpinner size={size} variant="muted" showText={false} />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
};
