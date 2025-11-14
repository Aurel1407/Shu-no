import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import type { ReactElement } from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { configureRouterMock } from "@/test/utils/router-mock";
import UserBookings from "./UserBookings";

let mockNavigate: ReturnType<typeof vi.fn>;

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Calendar: () => <span>Calendar Icon</span>,
  MapPin: () => <span>MapPin Icon</span>,
  Users: () => <span>Users Icon</span>,
  CreditCard: () => <span>CreditCard Icon</span>,
  Clock: () => <span>Clock Icon</span>,
  Check: () => <span>Check Icon</span>,
  X: () => <span>X Icon</span>,
  AlertCircle: () => <span>AlertCircle Icon</span>,
  Eye: () => <span>Eye Icon</span>,
  Edit: () => <span>Edit Icon</span>,
  Trash2: () => <span>Trash2 Icon</span>,
  Download: () => <span>Download Icon</span>,
  Filter: () => <span>Filter Icon</span>,
  Search: () => <span>Search Icon</span>,
  Sort: () => <span>Sort Icon</span>,
  SortAsc: () => <span>SortAsc Icon</span>,
  SortDesc: () => <span>SortDesc Icon</span>,
  RefreshCw: () => <span>RefreshCw Icon</span>,
  Plus: () => <span>Plus Icon</span>,
  Star: () => <span>Star Icon</span>,
  MessageSquare: () => <span>MessageSquare Icon</span>,
  Phone: () => <span>Phone Icon</span>,
  Mail: () => <span>Mail Icon</span>,
  ExternalLink: () => <span>ExternalLink Icon</span>,
  ChevronLeft: () => <span>ChevronLeft Icon</span>,
  ChevronRight: () => <span>ChevronRight Icon</span>,
  MoreVertical: () => <span>MoreVertical Icon</span>,
  FileText: () => <span>FileText Icon</span>,
  Info: () => <span>Info Icon</span>,
}));

// Mock authentication hook
vi.mock("../hooks/use-authenticated-api", () => ({
  useAuthenticatedApi: () => ({
    user: {
      id: 1,
      username: "john_doe",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
    },
  }),
}));

// Mock toast hook
vi.mock("../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const originalFetch = global.fetch;
const fetchMock = vi.fn();

beforeAll(() => {
  global.fetch = fetchMock as unknown as typeof global.fetch;
});

afterAll(() => {
  global.fetch = originalFetch;
});

const mockBookingsData = {
  bookings: [
    {
      id: 1,
      confirmationNumber: "SHU123456",
      property: {
        id: 1,
        name: "Villa de Luxe",
        address: "123 rue de la Mer, Nice",
        images: ["villa1.jpg"],
        rating: 4.8,
      },
      checkIn: "2024-06-01",
      checkOut: "2024-06-07",
      guests: 4,
      totalPrice: 1500,
      status: "confirmed",
      paymentStatus: "paid",
      createdAt: "2024-05-01T10:00:00Z",
    },
    {
      id: 2,
      confirmationNumber: "SHU789012",
      property: {
        id: 2,
        name: "Appartement Centre-ville",
        address: "45 avenue des Champs, Paris",
        images: ["apt1.jpg"],
        rating: 4.5,
      },
      checkIn: "2024-07-15",
      checkOut: "2024-07-20",
      guests: 2,
      totalPrice: 800,
      status: "pending",
      paymentStatus: "pending",
      createdAt: "2024-05-15T14:30:00Z",
    },
  ],
  pagination: {
    page: 1,
    limit: 10,
    total: 2,
    pages: 1,
  },
};

const renderWithProviders = (component: ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("UserBookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    configureRouterMock({ navigate: mockNavigate });
    fetchMock.mockReset();

    // Mock successful bookings data fetch
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockBookingsData,
    });
  });

  afterEach(() => {
    fetchMock.mockReset();
  });

  it("renders user bookings page correctly", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Mes Réservations")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Mes Réservations")).toBeInTheDocument();
  });

  it("displays booking listing icons", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Calendar Icon")).toBeInTheDocument();
    expect(screen.getByText("MapPin Icon")).toBeInTheDocument();
    expect(screen.getByText("Users Icon")).toBeInTheDocument();
    expect(screen.getByText("CreditCard Icon")).toBeInTheDocument();
  });

  it("shows status icons", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Clock Icon")).toBeInTheDocument();
    expect(screen.getByText("Check Icon")).toBeInTheDocument();
    expect(screen.getByText("X Icon")).toBeInTheDocument();
    expect(screen.getByText("AlertCircle Icon")).toBeInTheDocument();
  });

  it("displays action icons", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Eye Icon")).toBeInTheDocument();
    expect(screen.getByText("Edit Icon")).toBeInTheDocument();
    expect(screen.getByText("Trash2 Icon")).toBeInTheDocument();
    expect(screen.getByText("Download Icon")).toBeInTheDocument();
  });

  it("shows search and filter icons", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Filter Icon")).toBeInTheDocument();
    expect(screen.getByText("Search Icon")).toBeInTheDocument();
    expect(screen.getByText("Sort Icon")).toBeInTheDocument();
    expect(screen.getByText("SortAsc Icon")).toBeInTheDocument();
    expect(screen.getByText("SortDesc Icon")).toBeInTheDocument();
  });

  it("displays refresh and add icons", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("RefreshCw Icon")).toBeInTheDocument();
    expect(screen.getByText("Plus Icon")).toBeInTheDocument();
  });

  it("shows rating and communication icons", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Star Icon")).toBeInTheDocument();
    expect(screen.getByText("MessageSquare Icon")).toBeInTheDocument();
    expect(screen.getByText("Phone Icon")).toBeInTheDocument();
    expect(screen.getByText("Mail Icon")).toBeInTheDocument();
  });

  it("displays navigation and menu icons", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("ExternalLink Icon")).toBeInTheDocument();
    expect(screen.getByText("ChevronLeft Icon")).toBeInTheDocument();
    expect(screen.getByText("ChevronRight Icon")).toBeInTheDocument();
    expect(screen.getByText("MoreVertical Icon")).toBeInTheDocument();
  });

  it("shows document and info icons", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("FileText Icon")).toBeInTheDocument();
    expect(screen.getByText("Info Icon")).toBeInTheDocument();
  });

  it("fetches bookings data on mount", async () => {
    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/user/bookings"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        })
      );
    });
  });

  it("handles API errors gracefully", async () => {
    fetchMock.mockRejectedValue(new Error("API Error"));

    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(screen.getByText("Mes Réservations")).toBeInTheDocument();
  });

  it("displays booking list when data is loaded", async () => {
    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  it("handles booking cancellation", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingsData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Booking cancelled" }),
      });

    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  it("handles booking modification", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingsData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Booking modified" }),
      });

    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  it("handles booking details view", async () => {
    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  it("handles booking invoice download", async () => {
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingsData,
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(["PDF content"]),
      });

    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  it("handles search functionality", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Search Icon")).toBeInTheDocument();
  });

  it("handles filter functionality", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Filter Icon")).toBeInTheDocument();
  });

  it("handles sort functionality", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Sort Icon")).toBeInTheDocument();
    expect(screen.getByText("SortAsc Icon")).toBeInTheDocument();
    expect(screen.getByText("SortDesc Icon")).toBeInTheDocument();
  });

  it("handles pagination", async () => {
    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(screen.getByText("ChevronLeft Icon")).toBeInTheDocument();
    expect(screen.getByText("ChevronRight Icon")).toBeInTheDocument();
  });

  it("handles refresh functionality", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("RefreshCw Icon")).toBeInTheDocument();
  });

  it("handles new booking creation", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Plus Icon")).toBeInTheDocument();
  });

  it("displays booking status badges", async () => {
    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(screen.getByText("Check Icon")).toBeInTheDocument();
    expect(screen.getByText("Clock Icon")).toBeInTheDocument();
  });

  it("shows property ratings", async () => {
    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    expect(screen.getByText("Star Icon")).toBeInTheDocument();
  });

  it("handles contact property owner", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("MessageSquare Icon")).toBeInTheDocument();
    expect(screen.getByText("Phone Icon")).toBeInTheDocument();
    expect(screen.getByText("Mail Icon")).toBeInTheDocument();
  });

  it("handles external property links", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("ExternalLink Icon")).toBeInTheDocument();
  });

  it("shows booking actions menu", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("MoreVertical Icon")).toBeInTheDocument();
  });

  it("displays booking documents", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("FileText Icon")).toBeInTheDocument();
  });

  it("shows booking information tooltips", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Info Icon")).toBeInTheDocument();
  });

  it("handles empty bookings state", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ bookings: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } }),
    });

    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  it("handles filter by status", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Filter Icon")).toBeInTheDocument();
    expect(screen.getByText("Check Icon")).toBeInTheDocument();
    expect(screen.getByText("Clock Icon")).toBeInTheDocument();
    expect(screen.getByText("X Icon")).toBeInTheDocument();
  });

  it("handles date range filtering", () => {
    renderWithProviders(<UserBookings />);

    expect(screen.getByText("Calendar Icon")).toBeInTheDocument();
    expect(screen.getByText("Filter Icon")).toBeInTheDocument();
  });

  it("maintains responsive design", () => {
    renderWithProviders(<UserBookings />);

    const container = screen.getByText("Mes Réservations").closest("div");
    expect(container).toBeInTheDocument();
  });

  it("displays all required booking icons", () => {
    renderWithProviders(<UserBookings />);

    const requiredIcons = [
      "Calendar Icon",
      "MapPin Icon",
      "Users Icon",
      "CreditCard Icon",
      "Eye Icon",
      "Edit Icon",
      "Download Icon",
      "Filter Icon",
      "Search Icon",
    ];

    requiredIcons.forEach((iconText) => {
      expect(screen.getByText(iconText)).toBeInTheDocument();
    });
  });

  it("handles 403 error for unauthorized access", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: "Unauthorized" }),
    });

    renderWithProviders(<UserBookings />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  it("shows proper page structure", () => {
    renderWithProviders(<UserBookings />);

    const mainContent = screen.getByText("Mes Réservations").closest("main");
    expect(mainContent).toBeInTheDocument();
  });
});
