import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingState, LoadingStatePage, LoadingStateInline } from './LoadingState';

describe('LoadingState', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<LoadingState />);
      
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('Chargement en cours');
    });

    it('renders with custom message', () => {
      render(<LoadingState message="Chargement des utilisateurs" />);
      
      expect(screen.getByText('Chargement des utilisateurs')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<LoadingState message="Test" className="custom-class" />);
      
      const status = screen.getByRole('status');
      expect(status).toHaveClass('custom-class');
    });
  });

  describe('ARIA Attributes', () => {
    it('has role="status"', () => {
      render(<LoadingState message="Test" />);
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('role', 'status');
    });

    it('has aria-live="polite" by default', () => {
      render(<LoadingState message="Test" />);
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('can use aria-live="assertive"', () => {
      render(<LoadingState message="Test" ariaLive="assertive" />);
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'assertive');
    });

    it('has aria-busy="true"', () => {
      render(<LoadingState message="Test" />);
      
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-busy', 'true');
    });

    it('spinner has aria-hidden="true"', () => {
      const { container } = render(<LoadingState message="Test" />);
      
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Sizes', () => {
    it('renders small size', () => {
      const { container } = render(<LoadingState message="Test" size="sm" />);
      
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('renders medium size (default)', () => {
      const { container } = render(<LoadingState message="Test" size="md" />);
      
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('h-6', 'w-6');
    });

    it('renders large size', () => {
      const { container } = render(<LoadingState message="Test" size="lg" />);
      
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('renders extra large size', () => {
      const { container } = render(<LoadingState message="Test" size="xl" />);
      
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });
  });

  describe('Screen Reader Only Mode', () => {
    it('hides spinner visually with srOnly', () => {
      const { container } = render(<LoadingState message="Test" srOnly />);
      
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('sr-only');
    });

    it('hides text visually with srOnly', () => {
      render(<LoadingState message="Test" srOnly />);
      
      const text = screen.getByText('Test');
      expect(text).toHaveClass('sr-only');
    });

    it('keeps role="status" with srOnly', () => {
      render(<LoadingState message="Test" srOnly />);
      
      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('spinner has animate-spin class', () => {
      const { container } = render(<LoadingState message="Test" />);
      
      const spinner = container.querySelector('svg');
      expect(spinner).toHaveClass('animate-spin');
    });
  });
});

describe('LoadingStatePage', () => {
  it('renders full page loading state', () => {
    const { container } = render(<LoadingStatePage message="Chargement de la page" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Chargement de la page')).toBeInTheDocument();
    
    // Vérifie le conteneur de centrage
    const wrapper = container.querySelector(String.raw`.min-h-\[400px\]`);
    expect(wrapper).toBeInTheDocument();
  });

  it('uses large size by default', () => {
    const { container } = render(<LoadingStatePage />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-8', 'w-8'); // lg size
  });

  it('accepts custom size', () => {
    const { container } = render(<LoadingStatePage size="xl" />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });
});

describe('LoadingStateInline', () => {
  it('renders inline loading state', () => {
    render(<LoadingStateInline message="Envoi en cours" />);
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Envoi en cours')).toBeInTheDocument();
  });

  it('has aria-live="polite"', () => {
    render(<LoadingStateInline message="Test" />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('spinner has aria-hidden="true"', () => {
    const { container } = render(<LoadingStateInline message="Test" />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses small spinner (h-4 w-4)', () => {
    const { container } = render(<LoadingStateInline message="Test" />);
    
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });
});

describe('Accessibility Integration', () => {
  it('announces loading to screen readers', () => {
    render(<LoadingState message="Chargement des données" />);
    
    // role="status" avec aria-live="polite" annonce automatiquement
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Chargement des données');
  });

  it('supports urgent announcements with assertive', () => {
    render(<LoadingState message="Reconnexion..." ariaLive="assertive" />);
    
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'assertive');
  });

  it('does not announce spinner icon', () => {
    const { container } = render(<LoadingState message="Test" />);
    
    // Le spinner a aria-hidden="true" donc pas annoncé
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  it('works in button context', () => {
    render(
      <button disabled>
        <LoadingStateInline message="Envoi..." />
      </button>
    );
    
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Envoi...')).toBeInTheDocument();
  });
});

describe('WCAG 2.1 Compliance', () => {
  it('satisfies 4.1.3 Status Messages (Level AA)', () => {
    render(<LoadingState message="Chargement" />);
    
    const status = screen.getByRole('status');
    
    // 4.1.3 requiert role="status" ou aria-live
    expect(status).toHaveAttribute('role', 'status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('satisfies 1.1.1 Non-text Content (Level A)', () => {
    const { container } = render(<LoadingState message="Chargement" />);
    
    // Le spinner (contenu non-textuel) a aria-hidden="true"
    // Le message textuel décrit l'action
    const spinner = container.querySelector('svg');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Chargement')).toBeInTheDocument();
  });

  it('satisfies 2.2.4 Interruptions (Level AAA)', () => {
    render(<LoadingState message="Chargement" ariaLive="polite" />);
    
    // aria-live="polite" évite d'interrompre l'utilisateur
    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });
});
