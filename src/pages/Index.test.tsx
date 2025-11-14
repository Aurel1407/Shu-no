import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Index from "./Index";

const mockUseProductsQuery = vi.fn();

vi.mock("../components/Header", () => ({
  default: () => <div data-testid="header">Header Mock</div>,
}));

vi.mock("../components/Footer", () => ({
  default: () => <div data-testid="footer">Footer Mock</div>,
}));

// Mock du hook use-route-preloader
vi.mock("../hooks/use-route-preloader", () => ({
  useRoutePreloader: () => ({
    preloadPropertyRoutes: vi.fn(),
  }),
}));

vi.mock("@/hooks/api/products", () => ({
  useProductsQuery: (options?: unknown) => mockUseProductsQuery(options),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Index", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseProductsQuery.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: null,
    });
  });

  it('should render main heading "Shu no"', () => {
    renderWithRouter(<Index />);

    expect(screen.getByRole("heading", { name: /shu no/i })).toBeInTheDocument();
  });

  it("should render hero section with description", () => {
    renderWithRouter(<Index />);

    expect(screen.getByText(/gîtes et chambres d'hôtes/i)).toBeInTheDocument();
    // "Côte de Goëlo" apparaît plusieurs fois dans la page
    const coteDeGoeloElements = screen.getAllByText(/Côte de Goëlo/i);
    expect(coteDeGoeloElements.length).toBeGreaterThan(0);
  });

  it("should render call-to-action buttons", () => {
    renderWithRouter(<Index />);

    expect(screen.getByRole("button", { name: /voir nos gîtes/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /accéder à la page de contact/i })).toHaveLength(2);
  });

  it("should render header and footer components", () => {
    renderWithRouter(<Index />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should have proper semantic structure", () => {
    renderWithRouter(<Index />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("should have skip link for accessibility", () => {
    renderWithRouter(<Index />);

    const skipLink = screen.getByText(/aller au contenu principal/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("should have proper ARIA attributes", () => {
    renderWithRouter(<Index />);

    // Vérifier que la section hero a un aria-labelledby
    const heroSection = screen.getByText(/découvrez la beauté/i).closest("section");
    expect(heroSection).toHaveAttribute("aria-labelledby", "hero-title");
  });
});
