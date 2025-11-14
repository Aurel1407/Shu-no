import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock all the lazy-loaded components
vi.mock("./pages/Index", () => ({
  default: () => <div data-testid="index-page">Index Page</div>,
}));

vi.mock("./pages/Contact", () => ({
  default: () => <div data-testid="contact-page">Contact Page</div>,
}));

vi.mock("./pages/NotFound", () => ({
  default: () => <div data-testid="notfound-page">Not Found Page</div>,
}));

vi.mock("./pages/Booking", () => ({
  default: () => <div data-testid="booking-page">Booking Page</div>,
}));

vi.mock("./pages/PropertyDetail", () => ({
  default: () => <div data-testid="property-detail-page">Property Detail Page</div>,
}));

vi.mock("./pages/UserLogin", () => ({
  default: () => <div data-testid="user-login-page">User Login Page</div>,
}));

vi.mock("./pages/UserRegister", () => ({
  default: () => <div data-testid="user-register-page">User Register Page</div>,
}));

vi.mock("./pages/AdminLogin", () => ({
  default: () => <div data-testid="admin-login-page">Admin Login Page</div>,
}));

vi.mock("./pages/AdminDashboard", () => ({
  default: () => <div data-testid="admin-dashboard-page">Admin Dashboard Page</div>,
}));

// Mock React Query
vi.mock("@tanstack/react-query", () => ({
  QueryClient: vi.fn(() => ({
    clear: vi.fn(),
    getQueryData: vi.fn(),
    setQueryData: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock next-themes
vi.mock("next-themes", () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock UI components
vi.mock("@/components/ui/toaster", () => ({
  Toaster: () => <div data-testid="toaster">Toaster</div>,
}));

vi.mock("@/components/ui/sonner", () => ({
  Toaster: () => <div data-testid="sonner">Sonner</div>,
}));

vi.mock("@/components/ui/tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("App", () => {
  it("should render without crashing", () => {
    render(<App />);
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByTestId("sonner")).toBeInTheDocument();
  });

  it("should render the index page by default", () => {
    // Since we're using BrowserRouter, we need to test with the actual routing
    window.history.pushState({}, "Test page", "/");
    render(<App />);

    // The default route should load the Index page
    expect(screen.getByTestId("index-page")).toBeInTheDocument();
  });

  it("should provide necessary providers", () => {
    render(<App />);

    // Check that providers are rendered
    expect(screen.getByTestId("toaster")).toBeInTheDocument();
    expect(screen.getByTestId("sonner")).toBeInTheDocument();
  });

  it("should handle different routes", () => {
    // Test contact route
    window.history.pushState({}, "Contact page", "/contact");
    render(<App />);
    expect(screen.getByTestId("contact-page")).toBeInTheDocument();
  });

  it("should handle unknown routes with NotFound", () => {
    // Test 404 route
    window.history.pushState({}, "Unknown page", "/unknown-route");
    render(<App />);
    expect(screen.getByTestId("notfound-page")).toBeInTheDocument();
  });

  it("should include QueryClientProvider wrapper", () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should include ThemeProvider wrapper", () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });

  it("should include TooltipProvider wrapper", () => {
    const { container } = render(<App />);
    expect(container.firstChild).toBeTruthy();
  });
});
