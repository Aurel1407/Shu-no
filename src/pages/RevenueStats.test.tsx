import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import RevenueStats from "./RevenueStats";

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

const mockRevenueData = {
  totalRevenue: 150000,
  monthlyRevenue: 25000,
  revenueGrowth: 15.5,
  averageBookingValue: 850,
  monthlyStats: [
    { month: "2024-01", revenue: 20000, bookings: 25 },
    { month: "2024-02", revenue: 22000, bookings: 28 },
    { month: "2024-03", revenue: 25000, bookings: 30 },
  ],
  propertyRevenue: [
    { propertyId: 1, name: "Villa de Luxe", revenue: 45000 },
    { propertyId: 2, name: "Appartement Centre", revenue: 35000 },
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

describe("RevenueStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockRevenueData,
    });
  });

  it("renders revenue stats page correctly", () => {
    renderWithProviders(<RevenueStats />);

    expect(screen.getByText("Statistiques de Revenus")).toBeInTheDocument();
  });

  it("displays page title and description", () => {
    renderWithProviders(<RevenueStats />);

    expect(screen.getByText("Statistiques de Revenus")).toBeInTheDocument();
    expect(screen.getByText("Gîtes et Chambres d'hôtes")).toBeInTheDocument();
  });

  it("renders page structure correctly", () => {
    const { container } = renderWithProviders(<RevenueStats />);

    expect(container.querySelector("header")).toBeInTheDocument();
    expect(container.querySelector(".min-h-screen")).toBeInTheDocument();
    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
  });

  it("renders user account functionality", () => {
    renderWithProviders(<RevenueStats />);

    expect(screen.getByText("UserIcon")).toBeInTheDocument();
    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
  });

  it("renders footer component", () => {
    const { container } = renderWithProviders(<RevenueStats />);

    expect(container.querySelector("footer")).toBeInTheDocument();
  });

  it("sets correct document title", () => {
    renderWithProviders(<RevenueStats />);

    expect(document.title).toBe("Statistiques de Revenus - Administration Shu-no");
  });

  it("maintains proper page structure", () => {
    renderWithProviders(<RevenueStats />);

    const container = screen.getByText("Statistiques de Revenus").closest("div");
    expect(container).toBeInTheDocument();
  });
});
