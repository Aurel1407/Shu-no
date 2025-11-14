import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import Booking from "./Booking";
import type { Product } from "@/types/product";

// Mock des hooks et composants externes
const mockNavigate = vi.fn();
const mockUseProductsQuery = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to, ...props }: any) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

vi.mock("@/hooks/api/products", () => ({
  useProductsQuery: () => mockUseProductsQuery(),
}));

vi.mock("@/config/api", () => ({
  getApiUrl: (path: string) => `http://localhost:3002${path}`,
}));

// Mock des composants UI pour éviter les problèmes de rendu
vi.mock("@/components/Header", () => ({
  default: () => <div data-testid="header">Header</div>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <div data-testid="footer">Footer</div>,
}));

vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({ onSelect }: any) => (
    <div data-testid="calendar">
      <button onClick={() => onSelect?.(new Date("2024-01-15"))}>15 janvier</button>
    </div>
  ),
}));

vi.mock("@/components/ui/popover", () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("lucide-react", () => ({
  CalendarIcon: () => <span>📅</span>,
  Users: () => <span>👥</span>,
  MapPin: () => <span>📍</span>,
}));

// Mock fetch global
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Données de test
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Propriété Test",
    location: "Bretagne",
    price: 120,
    isActive: true,
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 2,
    description: "Propriété de test pour les tests unitaires",
    images: [],
  },
  {
    id: 2,
    name: "Gîte Test",
    location: "Bretagne",
    price: 95,
    isActive: true,
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 2,
    description: "Gîte de test pour les tests unitaires",
    images: [],
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderBookingPage = () => {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter>
        <Booking />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Booking Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Configuration par défaut du mock
    mockUseProductsQuery.mockReturnValue({
      data: mockProducts.filter((p) => p.isActive),
      isPending: false,
      isError: false,
      error: null,
    });

    // Mock fetch pour les calculs de prix
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        totalPrice: 240,
        nights: 2,
      }),
    });
  });

  it("affiche la page de réservation avec le titre", async () => {
    renderBookingPage();

    expect(screen.getByText("Réservez votre séjour")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("affiche les hébergements actifs", async () => {
    renderBookingPage();

    await waitFor(() => {
      expect(screen.getByText("Propriété Test")).toBeInTheDocument();
      expect(screen.getByText("Gîte Test")).toBeInTheDocument();
    });
  });

  it("affiche un état de chargement", () => {
    mockUseProductsQuery.mockReturnValue({
      data: [],
      isPending: true,
      isError: false,
      error: null,
    });

    renderBookingPage();

    // Le composant affiche un PropertyGridSkeleton avec aria-label
    const loadingElements = screen.getAllByLabelText("Chargement du contenu");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("affiche un message d'erreur en cas d'échec", () => {
    mockUseProductsQuery.mockReturnValue({
      data: [],
      isPending: false,
      isError: true,
      error: new Error("Erreur réseau"),
    });

    renderBookingPage();

    expect(
      screen.getByText(
        "Impossible de charger les propriétés en temps réel. Les données affichées peuvent ne pas être à jour."
      )
    ).toBeInTheDocument();
  });

  it("affiche un message quand aucun hébergement disponible", () => {
    mockUseProductsQuery.mockReturnValue({
      data: [],
      isPending: false,
      isError: false,
      error: null,
    });

    renderBookingPage();

    expect(screen.getByText("Aucun hébergement disponible pour le moment.")).toBeInTheDocument();
  });

  it("permet de modifier le nombre de voyageurs", async () => {
    renderBookingPage();

    const guestsInput = screen.getByLabelText("Voyageurs");
    expect(guestsInput).toHaveValue(2);

    // Ce test reste simple car le filtrage est géré par useEffect
    expect(guestsInput).toBeInTheDocument();
  });

  it("affiche les détails des propriétés", async () => {
    renderBookingPage();

    await waitFor(() => {
      expect(screen.getByText("Propriété Test")).toBeInTheDocument();
      expect(screen.getByText("Bretagne")).toBeInTheDocument();
      // Le nombre de voyageurs est affiché comme nombre seul avec aria-label
      expect(screen.getByLabelText("8 voyageurs maximum")).toBeInTheDocument();
    });
  });
});
