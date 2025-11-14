import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ManageContacts from "./ManageContacts";

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

describe("ManageContacts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render page title correctly", () => {
    renderWithProviders(<ManageContacts />);
    expect(screen.getByText("Gestion des Messages")).toBeInTheDocument();
  });

  it("should display basic page structure", () => {
    renderWithProviders(<ManageContacts />);
    const mainContent = screen.getByText("Gestion des Messages").closest("main, div");
    expect(mainContent).toBeInTheDocument();
  });

  it("should show message statistics", () => {
    renderWithProviders(<ManageContacts />);
    expect(screen.getByText("Total Messages")).toBeInTheDocument();
    expect(screen.getByText("Non Lus")).toBeInTheDocument();
    expect(screen.getByText("Lus")).toBeInTheDocument();
  });

  it("should display search and filter functionality", () => {
    renderWithProviders(<ManageContacts />);
    expect(screen.getByText("Filtres et Recherche")).toBeInTheDocument();
    expect(screen.getByText("Rechercher")).toBeInTheDocument();
  });

  it("should not crash when rendering", () => {
    expect(() => renderWithProviders(<ManageContacts />)).not.toThrow();
  });
});
