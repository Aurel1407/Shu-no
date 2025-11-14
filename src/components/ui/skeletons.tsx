import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Skeleton pour une carte de propriété
export const PropertyCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      data-testid="property-card-skeleton"
      aria-label="Chargement de la propriété..."
      role="status"
      className={cn(
        "bg-card rounded-xl shadow-lg border border-border overflow-hidden w-full max-w-sm animate-pulse",
        className
      )}
    >
      <Skeleton className="w-full h-48" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
};

// Skeleton pour une liste de propriétés
export const PropertyListSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 3,
  className,
}) => {
  const skeletons = [];
  for (let i = 0; i < count; i++) {
    skeletons.push(<PropertyCardSkeleton key={`skeleton-${i}`} />);
  }
  return <div className={cn("flex flex-wrap justify-center gap-8", className)}>{skeletons}</div>;
};

// Skeleton pour un tableau
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => {
  const headers = [];
  for (let i = 0; i < columns; i++) {
    headers.push(
      <th key={`header-${i}`} role="columnheader" className="p-2">
        <Skeleton className="h-6 w-full" />
      </th>
    );
  }

  const tableRows = [];
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    const cells = [];
    for (let colIndex = 0; colIndex < columns; colIndex++) {
      cells.push(
        <td key={`cell-${rowIndex}-${colIndex}`} className="p-2">
          <Skeleton className="h-4 w-full" />
        </td>
      );
    }
    tableRows.push(
      <tr key={`row-${rowIndex}`} role="row">
        {cells}
      </tr>
    );
  }

  return (
    <div
      data-testid="table-skeleton"
      aria-label="Chargement du tableau..."
      role="status"
      className={cn("animate-pulse", className)}
    >
      <table className="w-full">
        <thead>
          <tr role="row">{headers}</tr>
        </thead>
        <tbody>{tableRows}</tbody>
      </table>
    </div>
  );
};

// Skeleton pour un formulaire
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({
  fields = 4,
  className,
}) => {
  const formFields = [];
  for (let i = 0; i < fields; i++) {
    formFields.push(
      <div key={`field-${i}`} className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div
      data-testid="form-skeleton"
      aria-label="Chargement..."
      role="status"
      className={cn("space-y-6 animate-pulse", className)}
    >
      {formFields}
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};

// Skeleton pour les statistiques
export const StatsSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 4,
  className,
}) => {
  const statCards = [];
  for (let i = 0; i < count; i++) {
    statCards.push(
      <div key={`stat-${i}`} className="bg-card p-6 rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="stats-skeleton"
      aria-label="Chargement des statistiques..."
      role="status"
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse",
        className
      )}
    >
      {statCards}
    </div>
  );
};

// Skeleton pour un graphique
export const ChartSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  const chartLines = [];
  for (let i = 0; i < 5; i++) {
    chartLines.push(<Skeleton key={`chart-line-${i}`} className="h-4 w-full" />);
  }

  return (
    <div
      data-testid="chart-skeleton"
      aria-label="Chargement du graphique..."
      role="status"
      className={cn("bg-card p-6 rounded-lg border border-border animate-pulse", className)}
    >
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-2">{chartLines}</div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
};

// Skeleton pour une carte de contact
export const ContactCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn("bg-card p-6 rounded-lg border border-border", className)}>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="h-16 w-full" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
};
