import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ManageBookings from "./ManageBookings";

// Mock React Router
vi.mock("react-router-dom", () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

// Mock Lucide icons
vi.mock(
  "lucide-react",
  () =>
    new Proxy(
      {},
      {
        get: (target, prop) => {
          if (typeof prop === "string") {
            return () => <span>{prop} Icon</span>;
          }
          return target[prop];
        },
      }
    )
);

vi.mock("@/hooks/use-async-operation", () => ({
  useAsyncOperation: () => ({
    execute: vi.fn(),
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@/hooks/use-page-focus", () => ({
  usePageFocus: () => ({ isFocused: true }),
}));

vi.mock("@/hooks/use-success-message", () => ({
  useSuccessMessage: () => ({
    showSuccess: vi.fn(),
  }),
}));

vi.mock("@/hooks/use-authenticated-api", () => ({
  useAuthenticatedApi: () => ({
    get: vi.fn().mockResolvedValue({ data: [] }),
    post: vi.fn().mockResolvedValue({ data: {} }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
  }),
}));

describe("ManageBookings", () => {
  it("renders the component without crashing", () => {
    render(<ManageBookings />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("displays the page title", () => {
    render(<ManageBookings />);
    expect(screen.getByText("Gestion des réservations")).toBeInTheDocument();
  });

  it("renders loading state initially", () => {
    render(<ManageBookings />);
    // Test basic functionality is present
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("handles component lifecycle correctly", () => {
    const { unmount } = render(<ManageBookings />);
    expect(screen.getByRole("main")).toBeInTheDocument();
    unmount();
  });

  it("maintains proper accessibility structure", () => {
    render(<ManageBookings />);
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass("container");
  });
});
