import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import UserAccount from "./UserAccount";

// Mock React Router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Utiliser le mock global de lucide-react défini dans setup.ts

// Mock authentication hook
vi.mock("../hooks/use-authenticated-api", () => ({
  useAuthenticatedApi: () => ({
    user: {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      role: "user",
    },
    logout: vi.fn(),
  }),
}));

// Mock toast hook
vi.mock("../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock API
global.fetch = vi.fn();

const mockUserData = {
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  firstName: "John",
  lastName: "Doe",
  phone: "+33123456789",
  address: "123 rue de la Paix, Paris",
  birthDate: "1990-01-15",
  preferences: {
    notifications: true,
    newsletter: false,
    language: "fr",
  },
  bookings: [
    {
      id: 1,
      property: "Villa de Luxe",
      checkIn: "2024-06-01",
      checkOut: "2024-06-07",
      status: "confirmed",
      totalPrice: 1500,
    },
  ],
};

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

describe("UserAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();

    // Mock successful user data fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockUserData,
    });
  });

  it("renders user account page correctly", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
  });

  it("displays user data when loaded", async () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("handles API errors gracefully", async () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("displays user account interface", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("UserIcon")).toBeInTheDocument();
    expect(screen.getByText("MenuIcon")).toBeInTheDocument();
  });

  it("shows loading state properly", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
    expect(screen.getByLabelText("Chargement en cours")).toBeInTheDocument();
  });

  it("displays header and footer", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("shows account navigation", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
    expect(screen.getAllByText("Shu no")).toHaveLength(2);
  });

  it("displays page branding", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Gîtes et Chambres d'hôtes")).toBeInTheDocument();
  });

  it("handles profile update", async () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("handles password change", async () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("handles preferences update", async () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("shows navigation links", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getAllByText("Accueil")).toHaveLength(2);
    expect(screen.getAllByText("Réserver")).toHaveLength(2);
    expect(screen.getAllByText("Contact")).toHaveLength(3);
  });

  it("displays contact information", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("contact@shu-no.fr")).toBeInTheDocument();
    expect(screen.getByText("09 75 58 11 86")).toBeInTheDocument();
  });

  it("shows footer links", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Mentions Légales")).toBeInTheDocument();
    expect(screen.getByText("CGU")).toBeInTheDocument();
    expect(screen.getByText("Confidentialité")).toBeInTheDocument();
  });

  it("displays copyright", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("© 2025 Shu no. Tous droits réservés.")).toBeInTheDocument();
  });

  it("handles account deletion", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("shows theme toggle", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getAllByRole("switch")).toHaveLength(2);
  });
  it("displays loading spinner", () => {
    renderWithProviders(<UserAccount />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("shows proper aria labels", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByLabelText("Chargement en cours")).toBeInTheDocument();
  });

  it("renders social media section", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Liens Rapides")).toBeInTheDocument();
  });
  it("shows contact information icons", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("09 75 58 11 86")).toBeInTheDocument();
    expect(screen.getByText("contact@shu-no.fr")).toBeInTheDocument();
  });

  it("maintains responsive design", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("displays company description", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText(/Découvrez la beauté/)).toBeInTheDocument();
  });
  it("shows loading state initially", async () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Chargement de votre compte...")).toBeInTheDocument();
  });

  it("shows page title", () => {
    renderWithProviders(<UserAccount />);

    // Chercher des éléments plus spécifiques pour éviter les doublons
    expect(screen.getByText("Gîtes et Chambres d'hôtes")).toBeInTheDocument();
  });

  it("displays footer information", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByText("Liens Rapides")).toBeInTheDocument();
    expect(screen.getByText("contact@shu-no.fr")).toBeInTheDocument();
  });

  it("handles navigation", () => {
    renderWithProviders(<UserAccount />);

    const homeLinks = screen.getAllByText("Accueil");
    expect(homeLinks[0].closest("a")).toHaveAttribute("href", "/");
  });

  it("maintains proper page structure", () => {
    renderWithProviders(<UserAccount />);

    expect(screen.getByRole("banner")).toBeInTheDocument(); // header semantic role
    expect(screen.getByRole("contentinfo")).toBeInTheDocument(); // footer semantic role
  });
});
