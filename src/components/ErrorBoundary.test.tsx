import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import React from "react";
import { ErrorBoundary } from "./ErrorBoundary";

// Composant qui lance une erreur pour tester l'ErrorBoundary
const ThrowingComponent = ({ shouldThrow = false, errorMessage = "Test error" }: { shouldThrow?: boolean; errorMessage?: string }) => {
  if (shouldThrow) {
    throw new Error(errorMessage);
  }
  return <div>Normal component</div>;
};

// Wrapper avec Router pour les tests
function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("ErrorBoundary", () => {
  // Supprimer les logs d'erreur pendant les tests pour éviter le bruit
  const originalConsoleError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("should render children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal component")).toBeInTheDocument();
  });

  it("should render default error UI when an error occurs", () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Une erreur s'est produite/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Réessayer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Retour à l'accueil/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Recharger la page/i })).toBeInTheDocument();
  });

  it("should render custom fallback when provided", () => {
    const customFallback = <div>Custom error message</div>;

    renderWithRouter(
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("should call onError callback when error occurs", () => {
    const onErrorMock = vi.fn();

    renderWithRouter(
      <ErrorBoundary onError={onErrorMock}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("should call onReset callback when retry button is clicked", () => {
    const onResetMock = vi.fn();

    renderWithRouter(
      <ErrorBoundary onReset={onResetMock}>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    const retryButton = screen.getByRole("button", { name: /Réessayer/i });
    fireEvent.click(retryButton);

    expect(onResetMock).toHaveBeenCalled();
  });

  it("should toggle technical details on click", () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} errorMessage="Test error message" />
      </ErrorBoundary>
    );

    const detailsButton = screen.getByText(/Détails techniques/i);

    // Détails masqués initialement
    expect(screen.queryByText(/Stack trace/i)).not.toBeInTheDocument();

    // Cliquer pour afficher
    fireEvent.click(detailsButton);
    expect(screen.getByText(/Message d'erreur/i)).toBeInTheDocument();

    // Cliquer pour masquer
    fireEvent.click(detailsButton);
    expect(screen.queryByText(/Stack trace/i)).not.toBeInTheDocument();
  });

  it("should display network error message", () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} errorMessage="fetch failed: network error" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Erreur de connexion/i)).toBeInTheDocument();
    expect(screen.getByText(/Vérifiez votre connexion internet/i)).toBeInTheDocument();
  });

  it("should display authentication error message", () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} errorMessage="401 unauthorized" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Session expirée/i)).toBeInTheDocument();
  });

  it("should display server error message", () => {
    renderWithRouter(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} errorMessage="500 internal server error" />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Erreur serveur/i)).toBeInTheDocument();
  });
});
