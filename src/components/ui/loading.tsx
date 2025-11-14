import { Loader2 } from "lucide-react";

interface SpinnerProps {
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
      aria-label="Chargement en cours"
    />
  );
}

interface LoadingProps {
  readonly message?: string;
  readonly fullScreen?: boolean;
}

export function Loading({ message = "Chargement...", fullScreen = false }: LoadingProps) {
  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" className="text-primary" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

interface SkeletonProps {
  readonly className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-muted rounded ${className}`}
      aria-label="Chargement du contenu"
    />
  );
}

// Skeleton pour une carte de propriété
export function PropertyCardSkeleton() {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}

interface PropertyGridSkeletonProps {
  readonly count?: number;
}

// Skeleton pour une grille de propriétés
export function PropertyGridSkeleton({ count = 6 }: PropertyGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={`skeleton-${i}`} />
      ))}
    </div>
  );
}

// Skeleton pour les détails d'une propriété
export function PropertyDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Images */}
      <Skeleton className="h-96 w-full rounded-lg" />
      
      {/* Titre et prix */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/4" />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Caractéristiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={`feature-${i}`} className="h-20 w-full" />
        ))}
      </div>

      {/* Calendrier et réservation */}
      <div className="grid md:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
