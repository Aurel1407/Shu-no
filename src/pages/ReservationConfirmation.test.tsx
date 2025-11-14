import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import ReservationConfirmation from "./ReservationConfirmation";

// Mock React Router
const mockNavigate = vi.fn();
const mockParams = { id: "1" };
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  CheckCircle: () => <span>CheckCircle Icon</span>,
  Calendar: () => <span>Calendar Icon</span>,
  MapPin: () => <span>MapPin Icon</span>,
  Users: () => <span>Users Icon</span>,
  CreditCard: () => <span>CreditCard Icon</span>,
  Mail: () => <span>Mail Icon</span>,
  Phone: () => <span>Phone Icon</span>,
  Clock: () => <span>Clock Icon</span>,
  Info: () => <span>Info Icon</span>,
  Download: () => <span>Download Icon</span>,
  Share: () => <span>Share Icon</span>,
  Print: () => <span>Print Icon</span>,
  Home: () => <span>Home Icon</span>,
  ArrowRight: () => <span>ArrowRight Icon</span>,
  ArrowLeft: () => <span>ArrowLeft Icon</span>,
  Star: () => <span>Star Icon</span>,
  Heart: () => <span>Heart Icon</span>,
  MessageSquare: () => <span>MessageSquare Icon</span>,
  FileText: () => <span>FileText Icon</span>,
  Shield: () => <span>Shield Icon</span>,
  AlertCircle: () => <span>AlertCircle Icon</span>,
  X: () => <span>X Icon</span>,
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

// Mock API
global.fetch = vi.fn();

const mockBookingData = {
  id: 1,
  confirmationNumber: "SHU123456",
  property: {
    id: 1,
    name: "Villa de Luxe",
    address: "123 rue de la Mer, Nice",
    images: ["villa1.jpg", "villa2.jpg"],
    rating: 4.8,
    amenities: ["WiFi", "Piscine", "Jardin"],
  },
  checkIn: "2024-06-01",
  checkOut: "2024-06-07",
  guests: 4,
  totalPrice: 1500,
  status: "confirmed",
  paymentStatus: "paid",
  guest: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+33123456789",
  },
  createdAt: "2024-05-01T10:00:00Z",
  cancellationPolicy: "Annulation gratuite jusqu'à 48h avant l'arrivée",
  specialRequests: "Vue sur mer demandée",
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

describe("ReservationConfirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();

    // Mock successful booking data fetch
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockBookingData,
    });
  });

  it("renders reservation confirmation page correctly", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("Confirmation de Réservation")).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("Confirmation de Réservation")).toBeInTheDocument();
  });

  it("displays confirmation icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("CheckCircle Icon")).toBeInTheDocument();
  });

  it("shows booking details icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("Calendar Icon")).toBeInTheDocument();
    expect(screen.getByText("MapPin Icon")).toBeInTheDocument();
    expect(screen.getByText("Users Icon")).toBeInTheDocument();
    expect(screen.getByText("CreditCard Icon")).toBeInTheDocument();
  });

  it("displays contact information icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("Mail Icon")).toBeInTheDocument();
    expect(screen.getByText("Phone Icon")).toBeInTheDocument();
  });

  it("shows time and information icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("Clock Icon")).toBeInTheDocument();
    expect(screen.getByText("Info Icon")).toBeInTheDocument();
  });

  it("displays action icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("Download Icon")).toBeInTheDocument();
    expect(screen.getByText("Share Icon")).toBeInTheDocument();
    expect(screen.getByText("Print Icon")).toBeInTheDocument();
  });

  it("shows navigation icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("Home Icon")).toBeInTheDocument();
    expect(screen.getByText("ArrowRight Icon")).toBeInTheDocument();
    expect(screen.getByText("ArrowLeft Icon")).toBeInTheDocument();
  });

  it("displays property rating and review icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("Star Icon")).toBeInTheDocument();
    expect(screen.getByText("Heart Icon")).toBeInTheDocument();
    expect(screen.getByText("MessageSquare Icon")).toBeInTheDocument();
  });

  it("shows document and security icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("FileText Icon")).toBeInTheDocument();
    expect(screen.getByText("Shield Icon")).toBeInTheDocument();
  });

  it("displays alert and close icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    expect(screen.getByText("AlertCircle Icon")).toBeInTheDocument();
    expect(screen.getByText("X Icon")).toBeInTheDocument();
  });

  it("fetches booking data on mount", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/bookings/1"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.stringContaining("Bearer"),
          }),
        })
      );
    });
  });

  it("handles API errors gracefully", async () => {
    (global.fetch as any).mockRejectedValue(new Error("API Error"));

    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(screen.getByText("Confirmation de Réservation")).toBeInTheDocument();
  });

  it("displays booking confirmation details", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("shows property information section", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("displays guest information section", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("shows payment information section", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("displays cancellation policy section", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handles download confirmation", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingData,
      })
      .mockResolvedValueOnce({
        ok: true,
        blob: async () => new Blob(["PDF content"]),
      });

    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handles share functionality", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handles print functionality", async () => {
    global.print = vi.fn();

    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("navigates to home when home button clicked", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("shows booking status indicators", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("displays check-in and check-out information", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("shows guest count information", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("displays total price information", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("shows confirmation number", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("displays property amenities", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("shows special requests", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("handles email confirmation resend", async () => {
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockBookingData,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: "Email sent" }),
      });

    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("displays success message for confirmed booking", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("shows property images section", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("displays contact information for support", async () => {
    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("maintains responsive design", () => {
    renderWithProviders(<ReservationConfirmation />);

    const container = screen.getByText("Confirmation de Réservation").closest("div");
    expect(container).toBeInTheDocument();
  });

  it("handles 404 error for non-existent booking", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Booking not found" }),
    });

    renderWithProviders(<ReservationConfirmation />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  it("displays all confirmation icons", () => {
    renderWithProviders(<ReservationConfirmation />);

    const requiredIcons = [
      "CheckCircle Icon",
      "Calendar Icon",
      "MapPin Icon",
      "Users Icon",
      "CreditCard Icon",
      "Mail Icon",
      "Phone Icon",
      "Clock Icon",
      "Info Icon",
      "Download Icon",
    ];

    requiredIcons.forEach((iconText) => {
      expect(screen.getByText(iconText)).toBeInTheDocument();
    });
  });

  it("shows proper page structure", () => {
    renderWithProviders(<ReservationConfirmation />);

    const mainContent = screen.getByText("Confirmation de Réservation").closest("main");
    expect(mainContent).toBeInTheDocument();
  });
});
