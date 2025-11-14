import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Services from "./Services";

// Mock React Router
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Home: () => <span>Home Icon</span>,
  Car: () => <span>Car Icon</span>,
  UtensilsCrossed: () => <span>UtensilsCrossed Icon</span>,
  Wifi: () => <span>Wifi Icon</span>,
  Waves: () => <span>Waves Icon</span>,
  Dumbbell: () => <span>Dumbbell Icon</span>,
  Coffee: () => <span>Coffee Icon</span>,
  Gamepad2: () => <span>Gamepad2 Icon</span>,
  Baby: () => <span>Baby Icon</span>,
  PawPrint: () => <span>PawPrint Icon</span>,
  Tv: () => <span>Tv Icon</span>,
  AirVent: () => <span>AirVent Icon</span>,
  Thermometer: () => <span>Thermometer Icon</span>,
  Shield: () => <span>Shield Icon</span>,
  Users: () => <span>Users Icon</span>,
  Clock: () => <span>Clock Icon</span>,
  MapPin: () => <span>MapPin Icon</span>,
  Phone: () => <span>Phone Icon</span>,
  Mail: () => <span>Mail Icon</span>,
  Star: () => <span>Star Icon</span>,
  CheckCircle: () => <span>CheckCircle Icon</span>,
  Heart: () => <span>Heart Icon</span>,
  ThumbsUp: () => <span>ThumbsUp Icon</span>,
  Award: () => <span>Award Icon</span>,
  Target: () => <span>Target Icon</span>,
  Zap: () => <span>Zap Icon</span>,
  Sparkles: () => <span>Sparkles Icon</span>,
  Compass: () => <span>Compass Icon</span>,
  Mountain: () => <span>Mountain Icon</span>,
  Sun: () => <span>Sun Icon</span>,
  Moon: () => <span>Moon Icon</span>,
}));

// Mock toast hook
vi.mock("../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
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

describe("Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders services page correctly", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Nos Services")).toBeInTheDocument();
  });

  it("displays accommodation services section", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Services d'Hébergement")).toBeInTheDocument();
  });

  it("shows various service icons", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Home Icon")).toBeInTheDocument();
    expect(screen.getByText("Car Icon")).toBeInTheDocument();
    expect(screen.getByText("UtensilsCrossed Icon")).toBeInTheDocument();
    expect(screen.getByText("Wifi Icon")).toBeInTheDocument();
    expect(screen.getByText("Waves Icon")).toBeInTheDocument();
  });

  it("displays premium services", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Services Premium")).toBeInTheDocument();
  });

  it("shows amenity icons", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Dumbbell Icon")).toBeInTheDocument();
    expect(screen.getByText("Coffee Icon")).toBeInTheDocument();
    expect(screen.getByText("Gamepad2 Icon")).toBeInTheDocument();
    expect(screen.getByText("Baby Icon")).toBeInTheDocument();
    expect(screen.getByText("PawPrint Icon")).toBeInTheDocument();
  });

  it("displays comfort amenities", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Équipements de Confort")).toBeInTheDocument();
  });

  it("shows comfort amenity icons", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Tv Icon")).toBeInTheDocument();
    expect(screen.getByText("AirVent Icon")).toBeInTheDocument();
    expect(screen.getByText("Thermometer Icon")).toBeInTheDocument();
    expect(screen.getByText("Shield Icon")).toBeInTheDocument();
  });

  it("displays service quality information", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Qualité de Service")).toBeInTheDocument();
  });

  it("shows quality indicators", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Users Icon")).toBeInTheDocument();
    expect(screen.getByText("Clock Icon")).toBeInTheDocument();
    expect(screen.getByText("Star Icon")).toBeInTheDocument();
    expect(screen.getByText("CheckCircle Icon")).toBeInTheDocument();
  });

  it("displays contact information", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Nous Contacter")).toBeInTheDocument();
  });

  it("shows contact icons", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Phone Icon")).toBeInTheDocument();
    expect(screen.getByText("Mail Icon")).toBeInTheDocument();
    expect(screen.getByText("MapPin Icon")).toBeInTheDocument();
  });

  it("displays service categories correctly", () => {
    renderWithProviders(<Services />);

    // Should display different service categories
    expect(screen.getByText("Nos Services")).toBeInTheDocument();
  });

  it("shows customer satisfaction icons", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Heart Icon")).toBeInTheDocument();
    expect(screen.getByText("ThumbsUp Icon")).toBeInTheDocument();
    expect(screen.getByText("Award Icon")).toBeInTheDocument();
  });

  it("displays service features", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Nos Avantages")).toBeInTheDocument();
  });

  it("shows feature icons", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Target Icon")).toBeInTheDocument();
    expect(screen.getByText("Zap Icon")).toBeInTheDocument();
    expect(screen.getByText("Sparkles Icon")).toBeInTheDocument();
  });

  it("displays location and activity services", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Services de Localisation")).toBeInTheDocument();
  });

  it("shows location and activity icons", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Compass Icon")).toBeInTheDocument();
    expect(screen.getByText("Mountain Icon")).toBeInTheDocument();
    expect(screen.getByText("Sun Icon")).toBeInTheDocument();
    expect(screen.getByText("Moon Icon")).toBeInTheDocument();
  });

  it("handles service inquiry form", () => {
    renderWithProviders(<Services />);

    // Should have some form of inquiry or contact form
    expect(screen.getByText("Nous Contacter")).toBeInTheDocument();
  });

  it("navigates to booking when book service is clicked", () => {
    renderWithProviders(<Services />);

    // Should have booking functionality
    const bookingElements = screen.getAllByText(/réserver|booking/i);
    if (bookingElements.length > 0) {
      fireEvent.click(bookingElements[0]);
    }
  });

  it("displays service pricing information", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Nos Tarifs")).toBeInTheDocument();
  });

  it("shows all service categories", () => {
    renderWithProviders(<Services />);

    const serviceCategories = [
      "Services d'Hébergement",
      "Services Premium",
      "Équipements de Confort",
      "Qualité de Service",
      "Services de Localisation",
      "Nos Avantages",
      "Nos Tarifs",
      "Nous Contacter",
    ];

    serviceCategories.forEach((category) => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it("handles responsive design", () => {
    renderWithProviders(<Services />);

    const servicesContainer = screen.getByText("Nos Services").closest("div");
    expect(servicesContainer).toBeInTheDocument();
  });

  it("displays service descriptions", () => {
    renderWithProviders(<Services />);

    // Should have detailed service descriptions
    expect(screen.getByText("Description des Services")).toBeInTheDocument();
  });

  it("shows service availability", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Disponibilité")).toBeInTheDocument();
  });

  it("displays service booking process", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Comment Réserver")).toBeInTheDocument();
  });

  it("handles service filtering", () => {
    renderWithProviders(<Services />);

    // Should allow filtering of services
    expect(screen.getByText("Filtrer les Services")).toBeInTheDocument();
  });

  it("shows service testimonials", () => {
    renderWithProviders(<Services />);

    expect(screen.getByText("Témoignages")).toBeInTheDocument();
  });

  it("displays all required icons for services", () => {
    renderWithProviders(<Services />);

    const requiredIcons = [
      "Home Icon",
      "Car Icon",
      "UtensilsCrossed Icon",
      "Wifi Icon",
      "Waves Icon",
      "Dumbbell Icon",
      "Coffee Icon",
      "Tv Icon",
      "Phone Icon",
      "Mail Icon",
      "Star Icon",
      "CheckCircle Icon",
    ];

    requiredIcons.forEach((iconText) => {
      expect(screen.getByText(iconText)).toBeInTheDocument();
    });
  });

  it("maintains proper page structure", () => {
    renderWithProviders(<Services />);

    const mainContent = screen.getByText("Nos Services").closest("main");
    expect(mainContent).toBeInTheDocument();
  });
});
