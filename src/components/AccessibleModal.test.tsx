import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccessibleModal, ConfirmationModal } from './AccessibleModal';
import { describe, it, expect, vi } from 'vitest';

describe('AccessibleModal', () => {
  it('renders modal with title and content when open', () => {
    render(
      <AccessibleModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
      >
        <p>Modal content</p>
      </AccessibleModal>
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <AccessibleModal
        open={false}
        onOpenChange={() => {}}
        title="Test Modal"
      >
        <p>Modal content</p>
      </AccessibleModal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <AccessibleModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        description="This is a test description"
      >
        <p>Content</p>
      </AccessibleModal>
    );

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <AccessibleModal
        open={true}
        onOpenChange={onOpenChange}
        title="Test Modal"
      >
        <p>Content</p>
      </AccessibleModal>
    );

    const closeButton = screen.getByRole('button', { name: /fermer la fenêtre/i });
    await user.click(closeButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <AccessibleModal
        open={true}
        onOpenChange={onOpenChange}
        title="Test Modal"
      >
        <p>Content</p>
      </AccessibleModal>
    );

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('does not close on Escape when disableEscapeClose is true', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <AccessibleModal
        open={true}
        onOpenChange={onOpenChange}
        title="Test Modal"
        disableEscapeClose={true}
      >
        <p>Content</p>
      </AccessibleModal>
    );

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  it('has correct ARIA attributes', () => {
    render(
      <AccessibleModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        description="Test description"
      >
        <p>Content</p>
      </AccessibleModal>
    );

    const dialog = screen.getByRole('dialog');
    
    // aria-modal is added by Radix automatically
    expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
  });

  it('applies correct size class', () => {
    const { rerender } = render(
      <AccessibleModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        size="sm"
      >
        <p>Content</p>
      </AccessibleModal>
    );

    let dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-sm');

    rerender(
      <AccessibleModal
        open={true}
        onOpenChange={() => {}}
        title="Test Modal"
        size="lg"
      >
        <p>Content</p>
      </AccessibleModal>
    );

    dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-lg');
  });
});

describe('ConfirmationModal', () => {
  it('renders with confirm and cancel buttons', () => {
    render(
      <ConfirmationModal
        open={true}
        onOpenChange={() => {}}
        title="Confirm Action"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  it('calls onConfirm and closes modal when confirm is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <ConfirmationModal
        open={true}
        onOpenChange={onOpenChange}
        title="Confirm"
        description="Are you sure?"
        onConfirm={onConfirm}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirmer/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalled();
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('closes modal when cancel is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <ConfirmationModal
        open={true}
        onOpenChange={onOpenChange}
        title="Confirm"
        description="Are you sure?"
        onConfirm={() => {}}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    await user.click(cancelButton);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows loading state when loading prop is true', () => {
    render(
      <ConfirmationModal
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Are you sure?"
        onConfirm={() => {}}
        loading={true}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /chargement/i });
    expect(confirmButton).toBeDisabled();
    
    const cancelButton = screen.getByRole('button', { name: /annuler/i });
    expect(cancelButton).toBeDisabled();
  });

  it('applies destructive variant styles', () => {
    render(
      <ConfirmationModal
        open={true}
        onOpenChange={() => {}}
        title="Delete Item"
        description="Are you sure?"
        onConfirm={() => {}}
        variant="destructive"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /confirmer/i });
    expect(confirmButton).toHaveClass('bg-destructive');
  });

  it('uses custom button labels', () => {
    render(
      <ConfirmationModal
        open={true}
        onOpenChange={() => {}}
        title="Confirm"
        description="Are you sure?"
        onConfirm={() => {}}
        confirmLabel="Supprimer"
        cancelLabel="Garder"
      />
    );

    expect(screen.getByRole('button', { name: /supprimer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /garder/i })).toBeInTheDocument();
  });
});
