import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface AccessibleModalProps {
  /** Contrôle l'état ouvert/fermé du modal */
  open: boolean;
  /** Callback appelé quand le modal change d'état */
  onOpenChange: (open: boolean) => void;
  /** Titre du modal (obligatoire pour accessibilité) */
  title: string;
  /** Description optionnelle du modal */
  description?: string;
  /** Contenu du modal */
  children: ReactNode;
  /** Taille du modal */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Désactiver la fermeture au clic sur le backdrop */
  disableBackdropClose?: boolean;
  /** Désactiver la fermeture avec Escape */
  disableEscapeClose?: boolean;
  /** Classe CSS supplémentaire pour le contenu */
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Composant Modal Accessible avec Radix UI Dialog
 * 
 * Fonctionnalités accessibilité:
 * - Focus trap automatique
 * - Retour du focus après fermeture
 * - aria-modal="true" automatique
 * - Fermeture avec Escape
 * - aria-labelledby et aria-describedby
 * - Navigation clavier complète
 * 
 * @example
 * ```tsx
 * <AccessibleModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Confirmer la suppression"
 *   description="Cette action est irréversible."
 * >
 *   <div className="flex gap-4">
 *     <Button onClick={handleConfirm}>Confirmer</Button>
 *     <Button onClick={() => setIsOpen(false)}>Annuler</Button>
 *   </div>
 * </AccessibleModal>
 * ```
 */
export function AccessibleModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = 'md',
  disableBackdropClose = false,
  disableEscapeClose = false,
  className = '',
}: Readonly<AccessibleModalProps>) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop avec animation fade-in */}
        <Dialog.Overlay
          className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-200 z-50"
          onClick={disableBackdropClose ? undefined : () => onOpenChange(false)}
        />

        {/* Modal Content */}
        <Dialog.Content
          className={`
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-background border border-border rounded-lg shadow-xl
            p-6 w-[90vw] ${sizeClasses[size]}
            animate-in fade-in-0 zoom-in-95 duration-200
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
            z-50
            ${className}
          `}
          onEscapeKeyDown={disableEscapeClose ? (e) => e.preventDefault() : undefined}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Header avec titre et bouton fermer */}
          <div className="flex items-start justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-foreground pr-8">
              {title}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 p-3 rounded-md hover:bg-accent transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label="Fermer la fenêtre"
              >
                <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          {/* Description optionnelle */}
          {description && (
            <Dialog.Description
              id="modal-description"
              className="text-sm text-muted-foreground mb-4"
            >
              {description}
            </Dialog.Description>
          )}

          {/* Contenu du modal */}
          <div className="text-foreground">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/**
 * Composant Modal de Confirmation
 * 
 * Variante spécialisée pour les dialogues de confirmation
 * avec boutons pré-configurés.
 * 
 * @example
 * ```tsx
 * <ConfirmationModal
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="Supprimer la propriété"
 *   description="Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action ne peut pas être annulée."
 *   confirmLabel="Supprimer"
 *   cancelLabel="Annuler"
 *   onConfirm={handleDelete}
 *   variant="destructive"
 * />
 * ```
 */
interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export function ConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  variant = 'default',
  loading = false,
}: Readonly<ConfirmationModalProps>) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AccessibleModal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="sm"
    >
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleConfirm}
          disabled={loading}
          className={`
            flex-1 px-4 py-2 rounded-md font-medium transition-colors
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${
              variant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary'
            }
          `}
        >
          {loading ? 'Chargement...' : confirmLabel}
        </button>
        <button
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className="
            flex-1 px-4 py-2 rounded-md font-medium
            border border-input bg-background hover:bg-accent hover:text-accent-foreground
            transition-colors
            focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {cancelLabel}
        </button>
      </div>
    </AccessibleModal>
  );
}

export default AccessibleModal;
