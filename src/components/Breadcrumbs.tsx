import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  ariaLabel?: string;
}

/**
 * Composant Breadcrumbs accessible (WCAG 2.4.8 Location)
 * 
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: 'Accueil', href: '/' },
 *     { label: 'Propriétés', href: '/properties' },
 *     { label: 'Modifier', current: true }
 *   ]}
 * />
 * 
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
 */
export function Breadcrumbs({
  items,
  className,
  ariaLabel = 'Fil d\'Ariane',
}: Readonly<BreadcrumbsProps>) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      <ol className="flex items-center space-x-1 list-none">
        {items.map((item, index) => (
          <React.Fragment key={`breadcrumb-${item.href || item.label}-${index}`}>
            <li className="flex items-center">
              {item.current ? (
                <span
                  aria-current="page"
                  className="font-medium text-slate-900 dark:text-white"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.href || '#'}
                  className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
            {index < items.length - 1 && (
              <li aria-hidden="true">
                <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

/**
 * Hook pour générer automatiquement des breadcrumbs depuis le path
 * 
 * @example
 * const breadcrumbs = useBreadcrumbs();
 */
export function useBreadcrumbs(): BreadcrumbItem[] {
  const path = globalThis.location.pathname;
  const segments = path.split('/').filter(Boolean);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Accueil', href: '/' },
  ];

  // Mapping des segments vers labels lisibles
  const segmentLabels: Record<string, string> = {
    'admin': 'Administration',
    'properties': 'Propriétés',
    'users': 'Utilisateurs',
    'bookings': 'Réservations',
    'orders': 'Commandes',
    'contacts': 'Contacts',
    'settings': 'Paramètres',
    'dashboard': 'Tableau de bord',
    'revenue': 'Revenus',
    'occupancy': 'Taux d\'occupation',
    'periods': 'Périodes',
    'new': 'Nouveau',
    'edit': 'Modifier',
    'account': 'Mon Compte',
  };

  let currentPath = '';
  for (const [index, segment] of segments.entries()) {
    currentPath += `/${segment}`;
    const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === segments.length - 1;

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast,
    });
  }

  return breadcrumbs;
}
