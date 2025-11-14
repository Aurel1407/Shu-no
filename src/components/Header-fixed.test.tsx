import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";

// Wrapper pour Router
const HeaderWithRouter = () => (
  <BrowserRouter>
    <Header />
  </BrowserRouter>
);

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  it("should render header with logo and navigation", () => {
    render(<HeaderWithRouter />);

    expect(screen.getByText("Shu no")).toBeInTheDocument();
    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Réserver")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("should render user account button when not authenticated", () => {
    // Mock localStorage to return null (not authenticated)
    window.localStorage.getItem = vi.fn().mockReturnValue(null);

    render(<HeaderWithRouter />);

    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
  });

  it("should render user account button when authenticated", () => {
    // Mock localStorage to return valid user data
    window.localStorage.getItem = vi.fn().mockReturnValue(
      JSON.stringify({
        id: 1,
        email: "test@example.com",
        role: "user",
      })
    );

    render(<HeaderWithRouter />);

    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
  });

  it("should render mobile menu button on mobile", () => {
    render(<HeaderWithRouter />);

    // Le bouton menu mobile doit être présent (sans nom accessible spécifique)
    const menuButtons = screen.getAllByRole("button");
    // Il y a plusieurs boutons : theme toggle et menu mobile
    expect(menuButtons.length).toBeGreaterThan(1);
  });

  it("should handle corrupted localStorage data gracefully", () => {
    // Mock localStorage to return invalid JSON
    window.localStorage.getItem = vi.fn().mockReturnValue("invalid-json");

    // Should still render without crashing
    render(<HeaderWithRouter />);
    expect(screen.getByText("Shu no")).toBeInTheDocument();
    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    render(<HeaderWithRouter />);

    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();

    // Vérifier que les liens sont accessibles
    expect(screen.getByRole("link", { name: /accueil/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /réserver/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
  });
});
