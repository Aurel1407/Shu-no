import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ManagePricePeriods from "./ManagePricePeriods";

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
  DollarSign: () => <span>DollarSign Icon</span>,
  Search: () => <span>Search Icon</span>,
  Filter: () => <span>Filter Icon</span>,
  Plus: () => <span>Plus Icon</span>,
  Edit: () => <span>Edit Icon</span>,
  Trash2: () => <span>Trash2 Icon</span>,
  Eye: () => <span>Eye Icon</span>,
  Mail: () => <span>Mail Icon</span>,
  Phone: () => <span>Phone Icon</span>,
  CheckCircle: () => <span>CheckCircle Icon</span>,
  AlertCircle: () => <span>AlertCircle Icon</span>,
  Circle: () => <span>Circle Icon</span>,
  RefreshCw: () => <span>RefreshCw Icon</span>,
  ChevronDown: () => <span>ChevronDown Icon</span>,
  ChevronLeft: () => <span>ChevronLeft Icon</span>,
  ChevronRight: () => <span>ChevronRight Icon</span>,
  ChevronUp: () => <span>ChevronUp Icon</span>,
  Facebook: () => <span>Facebook Icon</span>,
  Instagram: () => <span>Instagram Icon</span>,
  Sun: () => <span>Sun Icon</span>,
  Moon: () => <span>Moon Icon</span>,
  Menu: () => <span>Menu Icon</span>,
  X: () => <span>X Icon</span>,
  MapPin: () => <span>MapPin Icon</span>,
  Check: () => <span>Check Icon</span>,
  Save: () => <span>Save Icon</span>,
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

describe("ManagePricePeriods", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render page title correctly", () => {
    renderWithProviders(<ManagePricePeriods />);
    expect(screen.getByText("Gestion des périodes de prix")).toBeInTheDocument();
  });

  it("should display basic page structure", () => {
    renderWithProviders(<ManagePricePeriods />);
    const mainContent = screen.getByRole("main");
    expect(mainContent).toBeInTheDocument();
  });

  it("should show price period management tools", () => {
    renderWithProviders(<ManagePricePeriods />);
    expect(screen.getByText("Périodes de prix")).toBeInTheDocument();
    expect(
      screen.getByText("Définissez des prix différents selon les périodes pour chaque propriété")
    ).toBeInTheDocument();
  });

  it("should display management functionality", () => {
    renderWithProviders(<ManagePricePeriods />);
    expect(screen.getByText("Mon Compte")).toBeInTheDocument();
  });

  it("should not crash when rendering", () => {
    expect(() => renderWithProviders(<ManagePricePeriods />)).not.toThrow();
  });
});
