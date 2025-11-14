import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import PropertyForm from "./PropertyForm";

// Mock React Router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Note: lucide-react mocked globally in setup.ts

// Mock authentication hook
vi.mock("../hooks/use-authenticated-api", () => ({
  useAuthenticatedApi: () => ({
    user: {
      id: 1,
      username: "admin",
      role: "admin",
    },
  }),
}));

// Mock localStorage pour le token
const mockLocalStorage = (() => {
  let store: Record<string, string> = {
    adminToken: "fake-admin-token-for-tests",
  };

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
});

// Mock API
globalThis.fetch = vi.fn();

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

describe("PropertyForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Réinitialiser le token dans localStorage
    mockLocalStorage.setItem("adminToken", "fake-admin-token-for-tests");
    
    (globalThis.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ message: "Success" }),
    });
  });

  it("renders property form correctly", () => {
    renderWithProviders(<PropertyForm />);

    expect(screen.getByText("Créer une nouvelle annonce")).toBeInTheDocument();
  });

  it("displays form navigation elements", () => {
    renderWithProviders(<PropertyForm />);

    // Vérifier que le composant se rend sans erreur
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("displays form fields", () => {
    renderWithProviders(<PropertyForm />);

    // Vérifier que les champs de formulaire principaux sont présents
    expect(screen.getByLabelText(/nom de la propriété/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/localisation/i)).toBeInTheDocument();
  });

  it("displays correct form title", () => {
    renderWithProviders(<PropertyForm />);

    // En mode création, devrait afficher "Créer une nouvelle annonce"
    expect(screen.getByText(/créer une nouvelle annonce/i)).toBeInTheDocument();
  });

  it("shows form description sections", () => {
    renderWithProviders(<PropertyForm />);

    // Vérifier que les sections du formulaire sont présentes
    expect(screen.getByText(/informations principales/i)).toBeInTheDocument();
    expect(screen.getByText(/les informations de base/i)).toBeInTheDocument();
  });

  it("displays return button", () => {
    renderWithProviders(<PropertyForm />);

    // Vérifier que le bouton de retour est présent
    expect(screen.getByText(/retour à la liste/i)).toBeInTheDocument();
  });

  it("maintains proper page structure", () => {
    renderWithProviders(<PropertyForm />);

    // Vérifier la structure de la page
    const mainSection = screen.getByRole("main");
    expect(mainSection).toBeInTheDocument();
    expect(mainSection).toHaveAttribute("id", "main-content");
  });
});
