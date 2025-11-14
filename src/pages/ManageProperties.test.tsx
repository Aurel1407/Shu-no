import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ManageProperties from "./ManageProperties";

// Mock hooks
vi.mock("../hooks/use-authenticated-api", () => ({
  useAuthenticatedApi: () => ({
    user: { id: 1, username: "admin", role: "admin" },
    logout: vi.fn(),
    apiCall: vi.fn(),
  }),
}));

vi.mock("../hooks/use-async-operation", () => ({
  useAsyncOperation: () => ({
    execute: vi.fn(),
    loading: false,
    error: null,
    data: null,
  }),
}));

vi.mock("../hooks/use-page-focus", () => ({
  usePageFocus: () => vi.fn(),
}));

vi.mock("../hooks/use-success-message", () => ({
  useSuccessMessage: () => vi.fn(),
}));

vi.mock("../hooks/use-page-title", () => ({
  usePageTitle: vi.fn(),
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => ({
  Home: () => <span>Home Icon</span>,
  Calendar: () => <span>Calendar Icon</span>,
  Users: () => <span>Users Icon</span>,
  User: () => <span>User Icon</span>,
  Settings: () => <span>Settings Icon</span>,
  Building: () => <span>Building Icon</span>,
  MapPin: () => <span>MapPin Icon</span>,
  Bed: () => <span>Bed Icon</span>,
  Bath: () => <span>Bath Icon</span>,
  Car: () => <span>Car Icon</span>,
  Plus: () => <span>Plus Icon</span>,
  Edit: () => <span>Edit Icon</span>,
  Trash2: () => <span>Trash2 Icon</span>,
  Eye: () => <span>Eye Icon</span>,
  Save: () => <span>Save Icon</span>,
  X: () => <span>X Icon</span>,
  Check: () => <span>Check Icon</span>,
  AlertCircle: () => <span>AlertCircle Icon</span>,
  CheckCircle: () => <span>CheckCircle Icon</span>,
  RefreshCw: () => <span>RefreshCw Icon</span>,
  Upload: () => <span>Upload Icon</span>,
  Image: () => <span>Image Icon</span>,
  DollarSign: () => <span>DollarSign Icon</span>,
  Star: () => <span>Star Icon</span>,
  Menu: () => <span>Menu Icon</span>,
  ChevronDown: () => <span>ChevronDown Icon</span>,
  ChevronLeft: () => <span>ChevronLeft Icon</span>,
  ChevronRight: () => <span>ChevronRight Icon</span>,
  ChevronUp: () => <span>ChevronUp Icon</span>,
  Facebook: () => <span>Facebook Icon</span>,
  Instagram: () => <span>Instagram Icon</span>,
  Phone: () => <span>Phone Icon</span>,
  Sun: () => <span>Sun Icon</span>,
  Moon: () => <span>Moon Icon</span>,
  Mail: () => <span>Mail Icon</span>,
}));

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

describe("ManageProperties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render page title correctly", () => {
    renderWithProviders(<ManageProperties />);
    expect(screen.getByText("Gestion des Propriétés")).toBeInTheDocument();
  });

  it("should display basic page structure", () => {
    renderWithProviders(<ManageProperties />);
    const mainContent = screen.getByText("Gestion des Propriétés").closest("main, div");
    expect(mainContent).toBeInTheDocument();
  });

  it("should show site branding", () => {
    renderWithProviders(<ManageProperties />);
    const brandingElements = screen.getAllByText("Shu no");
    expect(brandingElements.length).toBeGreaterThan(0);
  });

  it("should display navigation links", () => {
    renderWithProviders(<ManageProperties />);
    const accueilElements = screen.getAllByText("Accueil");
    expect(accueilElements.length).toBeGreaterThan(0);
    const reserverElements = screen.getAllByText("Réserver");
    expect(reserverElements.length).toBeGreaterThan(0);
  });

  it("should not crash when rendering", () => {
    expect(() => renderWithProviders(<ManageProperties />)).not.toThrow();
  });
});
