import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import OccupancyCharts from "./OccupancyCharts";

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
      username: "admin",
      role: "admin",
    },
  }),
}));

// Mock API
global.fetch = vi.fn();

const mockOccupancyData = {
  overall: 78.5,
  properties: [
    { id: 1, name: "Villa de Luxe", occupancy: 85.2 },
    { id: 2, name: "Appartement Centre", occupancy: 72.8 },
  ],
  monthly: [
    { month: "2024-01", occupancy: 75 },
    { month: "2024-02", occupancy: 80 },
    { month: "2024-03", occupancy: 78.5 },
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

describe("OccupancyCharts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockOccupancyData,
    });
  });

  it("renders occupancy charts page correctly", () => {
    renderWithProviders(<OccupancyCharts />);

    expect(screen.getByText("Graphiques d'Occupation")).toBeInTheDocument();
  });

  it("renders page with proper HTML structure", () => {
    const { container } = renderWithProviders(<OccupancyCharts />);

    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector("footer")).toBeInTheDocument();
    expect(screen.getByText("Gîtes et Chambres d'hôtes")).toBeInTheDocument();
  });

  it("shows user account button", () => {
    renderWithProviders(<OccupancyCharts />);

    expect(screen.getByText("UserIcon")).toBeInTheDocument();
    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
  });

  it("renders footer component", () => {
    renderWithProviders(<OccupancyCharts />);

    // Le footer devrait être présent même en état de loading
    const footer = document.querySelector("footer");
    expect(footer).toBeInTheDocument();
  });

  it("sets document title correctly", () => {
    renderWithProviders(<OccupancyCharts />);

    expect(document.title).toBe("Graphiques d'Occupation - Administration Shu-no");
  });

  it("shows loading state on mount", () => {
    renderWithProviders(<OccupancyCharts />);

    // Le composant devrait être en loading au début et afficher le titre
    expect(screen.getByText("Graphiques d'Occupation")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = renderWithProviders(<OccupancyCharts />);

    expect(container.firstChild).toBeInTheDocument();
    expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
  });

  it("maintains proper page structure", () => {
    renderWithProviders(<OccupancyCharts />);

    const container = screen.getByText("Graphiques d'Occupation").closest("div");
    expect(container).toBeInTheDocument();
  });
});
