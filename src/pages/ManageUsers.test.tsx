import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ManageUsers from "./ManageUsers";

// Mock React Router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock lucide-react icons - exhaustive list
vi.mock("lucide-react", () => ({
  RefreshCw: () => <span>RefreshCw Icon</span>,
  Home: () => <span>Home Icon</span>,
  AlertCircle: () => <span>AlertCircle Icon</span>,
  Calendar: () => <span>Calendar Icon</span>,
  DollarSign: () => <span>DollarSign Icon</span>,
  Trash2: () => <span>Trash2 Icon</span>,
  User: () => <span>User Icon</span>,
  Sun: () => <span>Sun Icon</span>,
  Moon: () => <span>Moon Icon</span>,
  Menu: () => <span>Menu Icon</span>,
  X: () => <span>X Icon</span>,
  Facebook: () => <span>Facebook Icon</span>,
  Instagram: () => <span>Instagram Icon</span>,
  Phone: () => <span>Phone Icon</span>,
  Mail: () => <span>Mail Icon</span>,
  MapPin: () => <span>MapPin Icon</span>,
  Users: () => <span>Users Icon</span>,
  Settings: () => <span>Settings Icon</span>,
  Plus: () => <span>Plus Icon</span>,
  Edit: () => <span>Edit Icon</span>,
  Eye: () => <span>Eye Icon</span>,
  Check: () => <span>Check Icon</span>,
  Clock: () => <span>Clock Icon</span>,
  CheckCircle: () => <span>CheckCircle Icon</span>,
  Search: () => <span>Search Icon</span>,
  Filter: () => <span>Filter Icon</span>,
  Package: () => <span>Package Icon</span>,
  ShoppingCart: () => <span>ShoppingCart Icon</span>,
  CreditCard: () => <span>CreditCard Icon</span>,
  Truck: () => <span>Truck Icon</span>,
  Download: () => <span>Download Icon</span>,
  Upload: () => <span>Upload Icon</span>,
  ChevronDown: () => <span>ChevronDown Icon</span>,
  ChevronUp: () => <span>ChevronUp Icon</span>,
}));

// Mock useAsyncOperation hook
vi.mock("../hooks/use-async-operation", () => ({
  useAsyncOperation: () => ({
    execute: vi.fn(),
    loading: false,
    error: null,
  }),
}));

// Mock usePageFocus hook
vi.mock("../hooks/use-page-focus", () => ({
  usePageFocus: () => ({
    focused: true,
  }),
}));

// Mock useSuccessMessage hook
vi.mock("../hooks/use-success-message", () => ({
  useSuccessMessage: () => ({
    showSuccess: vi.fn(),
  }),
}));

// Mock usePageTitle hook
vi.mock("../hooks/use-page-title", () => ({
  usePageTitle: () => ({
    setPageTitle: vi.fn(),
  }),
}));

// Mock authentication hook
vi.mock("../hooks/use-authenticated-api", () => ({
  useAuthenticatedApi: () => ({
    user: {
      id: 1,
      username: "admin",
      role: "admin",
    },
    logout: vi.fn(),
    apiCall: vi.fn(),
  }),
}));

// Mock toast hook
vi.mock("../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock global fetch
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [],
  });

  mockNavigate.mockClear();
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    </BrowserRouter>
  );
};

describe("ManageUsers", () => {
  it("renders page title correctly", () => {
    renderWithProviders(<ManageUsers />);

    expect(screen.getByText("Gestion des Utilisateurs")).toBeInTheDocument();
  });

  it("displays basic page structure", () => {
    const { container } = renderWithProviders(<ManageUsers />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it("shows site branding elements", () => {
    renderWithProviders(<ManageUsers />);

    const shuNoElements = screen.getAllByText("Shu no");
    expect(shuNoElements.length).toBeGreaterThan(0);
  });

  it("displays navigation links", () => {
    renderWithProviders(<ManageUsers />);

    const accueilLinks = screen.getAllByText("Accueil");
    expect(accueilLinks.length).toBeGreaterThan(0);
  });

  it("renders without crashing", () => {
    renderWithProviders(<ManageUsers />);

    expect(screen.getByText("Gestion des Utilisateurs")).toBeInTheDocument();
  });
});
