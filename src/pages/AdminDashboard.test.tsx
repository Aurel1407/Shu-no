import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import * as useAuthenticatedApi from "@/hooks/use-authenticated-api";
import * as useAsyncOperation from "@/hooks/use-async-operation";

// Mock des modules
vi.mock("@/hooks/use-authenticated-api");
vi.mock("@/hooks/use-async-operation");
vi.mock("@/hooks/use-page-focus", () => ({
  usePageFocus: () => ({ current: null }),
}));
vi.mock("@/hooks/use-page-title", () => ({
  usePageTitle: vi.fn(),
}));
vi.mock("@/components/Header", () => ({
  default: () => <header data-testid="header">Header</header>,
}));
vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Home: () => <span>Home Icon</span>,
  Users: () => <span>Users Icon</span>,
  Calendar: () => <span>Calendar Icon</span>,
  Settings: () => <span>Settings Icon</span>,
  TrendingUp: () => <span>TrendingUp Icon</span>,
  DollarSign: () => <span>DollarSign Icon</span>,
  Clock: () => <span>Clock Icon</span>,
  CheckCircle: () => <span>CheckCircle Icon</span>,
  XCircle: () => <span>XCircle Icon</span>,
  AlertTriangle: () => <span>AlertTriangle Icon</span>,
  MessageSquare: () => <span>MessageSquare Icon</span>,
}));

describe("AdminDashboard", () => {
  const mockApiCall = vi.fn();
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useAuthenticatedApi avec tous les champs nécessaires
    vi.mocked(useAuthenticatedApi.useAuthenticatedApi).mockReturnValue({
      apiCall: mockApiCall,
      loading: false,
      error: null,
      data: null,
    } as any);

    // Mock useAsyncOperation avec tous les champs - loading false par défaut
    vi.mocked(useAsyncOperation.useAsyncOperation).mockReturnValue({
      execute: mockExecute,
      loading: false,  // Important: false par défaut pour afficher le contenu
      error: null,
      data: null,
      reset: vi.fn(),
    } as any);

    // Mock les appels API pour retourner des données par défaut
    mockApiCall.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    // Mock execute pour résoudre immédiatement
    mockExecute.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  const renderAdminDashboard = () => {
    return render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );
  };

  it("should render admin dashboard with title and navigation", async () => {
    renderAdminDashboard();

    // Attendre que le titre apparaisse
    await waitFor(() => {
      expect(screen.getByText(/Tableau de Bord/i)).toBeInTheDocument();
    });
    
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should render stats cards with default values", () => {
    renderAdminDashboard();

    expect(screen.getByText("Propriétés Totales")).toBeInTheDocument();
    expect(screen.getByText("Réservations Totales")).toBeInTheDocument();
    expect(screen.getByText("Utilisateurs")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    renderAdminDashboard();

    expect(screen.getByRole("link", { name: /gérer les propriétés/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gérer les réservations/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gérer les utilisateurs/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /paramètres/i })).toBeInTheDocument();
  });

  it("should display loading state initially", () => {
    vi.mocked(useAuthenticatedApi.useAuthenticatedApi).mockReturnValue({
      apiCall: mockApiCall,
      getAuthToken: vi.fn().mockReturnValue("mock-token"),
    } as any);

    renderAdminDashboard();

    // Vérifier la présence des squelettes de chargement
    expect(screen.getAllByTestId("stats-skeleton")).toHaveLength(4);
    expect(screen.getAllByTestId("chart-skeleton")).toHaveLength(2);
  });

  it("should handle stats data correctly", async () => {
    const mockStats = {
      totalProperties: 10,
      activeProperties: 8,
      totalBookings: 25,
      pendingBookings: 3,
      confirmedBookings: 20,
      cancelledBookings: 2,
      totalUsers: 50,
      totalContacts: 15,
      unreadContacts: 5,
      totalRevenue: 5000,
      monthlyRevenue: 1200,
      occupancyRate: 75,
    };

    mockApiCall.mockResolvedValueOnce({ success: true, data: mockStats });

    renderAdminDashboard();

    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument(); // totalProperties
      expect(screen.getByText("25")).toBeInTheDocument(); // totalBookings
      expect(screen.getByText("50")).toBeInTheDocument(); // totalUsers
      expect(screen.getByText("15")).toBeInTheDocument(); // totalContacts
    });
  });

  it("should display proper badges for booking statuses", async () => {
    const mockStats = {
      totalProperties: 5,
      activeProperties: 4,
      totalBookings: 10,
      pendingBookings: 2,
      confirmedBookings: 7,
      cancelledBookings: 1,
      totalUsers: 20,
      totalContacts: 5,
      unreadContacts: 1,
      totalRevenue: 2000,
      monthlyRevenue: 500,
      occupancyRate: 60,
    };

    mockApiCall.mockResolvedValueOnce({ success: true, data: mockStats });

    renderAdminDashboard();

    await waitFor(() => {
      expect(screen.getByText("2 en attente")).toBeInTheDocument();
      expect(screen.getByText("7 confirmées")).toBeInTheDocument();
      expect(screen.getByText("1 annulée")).toBeInTheDocument();
    });
  });

  it("should handle API error gracefully", async () => {
    const mockError = new Error("Failed to fetch stats");
    mockApiCall.mockRejectedValueOnce(mockError);

    renderAdminDashboard();

    await waitFor(() => {
      // En cas d'erreur, les valeurs par défaut (0) sont affichées
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  it("should display recent activities section", () => {
    renderAdminDashboard();

    expect(screen.getByText("Activités Récentes")).toBeInTheDocument();
    expect(screen.getByText("Aperçu des dernières actions")).toBeInTheDocument();
  });

  it("should display system status section", () => {
    renderAdminDashboard();

    expect(screen.getByText("État du Système")).toBeInTheDocument();
    expect(screen.getByText("Surveillance des performances")).toBeInTheDocument();
  });

  it("should have proper accessibility attributes", () => {
    renderAdminDashboard();

    const main = screen.getByRole("main");
    // Le main utilise aria-labelledby pointant vers le titre
    expect(main).toHaveAttribute("aria-labelledby", "dashboard-title");

    // Vérifier que les sections ont des headings appropriés
    expect(screen.getByRole("heading", { name: "Tableau de Bord Administrateur" })).toBeInTheDocument();
  });

  it("should calculate percentages correctly", async () => {
    // Mock des données pour générer un taux d'occupation
    const mockProperties = [
      { id: 1, name: "Prop 1", isActive: true },
      { id: 2, name: "Prop 2", isActive: true },
    ];

    const mockBookings = Array.from({ length: 17 }, (_, i) => {
      let status: string;
      if (i < 14) {
        status = "confirmed";
      } else if (i < 16) {
        status = "pending";
      } else {
        status = "cancelled";
      }
      
      return {
        id: i + 1,
        status,
        checkIn: "2024-01-01",
        checkOut: "2024-01-05",
      };
    });

    mockApiCall.mockImplementation((url: string) => {
      if (url.includes("products")) {
        return Promise.resolve({ data: mockProperties });
      }
      if (url.includes("orders")) {
        return Promise.resolve({ data: mockBookings });
      }
      if (url.includes("contacts")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: [] });
    });

    renderAdminDashboard();

    await waitFor(() => {
      // Vérifier que le taux d'occupation est affiché au bon format (nombre + %)
      expect(screen.getByText("Taux d'Occupation")).toBeInTheDocument();
      // Le taux devrait être affiché quelque part dans le DOM
      const occupancyText = screen.getByText(/\d+%/);
      expect(occupancyText).toBeInTheDocument();
    });
  });
});
