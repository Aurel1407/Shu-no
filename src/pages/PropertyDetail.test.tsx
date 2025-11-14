import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PropertyDetail from "./PropertyDetail";
import type { Product } from "@/types/product";

const mockUseProductDetailQuery = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: "1" }),
  };
});

vi.mock("@/components/Header", () => ({
  default: () => <header data-testid="header">Header</header>,
}));

vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock("@/components/PropertyImageCarousel", () => ({
  default: () => <div data-testid="property-carousel">Image Carousel</div>,
}));

vi.mock("@/hooks/api/products", () => ({
  useProductDetailQuery: (id: string | undefined) => mockUseProductDetailQuery(id),
}));

const renderComponent = () =>
  render(
    <MemoryRouter initialEntries={["/property/1"]}>
      <PropertyDetail />
    </MemoryRouter>
  );

const product: Product = {
  id: 1,
  name: "Villa Rosée",
  location: "Bretagne",
  price: 180,
  isActive: true,
  description: "Une villa lumineuse avec vue sur mer.",
  maxGuests: 6,
  bedrooms: 3,
  bathrooms: 2,
  amenities: ["Piscine", "Wi-Fi"],
  images: ["https://example.com/villa.jpg"],
};

describe("PropertyDetail", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseProductDetailQuery.mockReset();
  });

  it("affiche un état de chargement", () => {
    mockUseProductDetailQuery.mockReturnValue({
      data: null,
      isPending: true,
      isError: false,
      error: null,
    });

    renderComponent();

    // Le composant affiche un skeleton avec aria-label
    const loadingElements = screen.getAllByLabelText("Chargement du contenu");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("affiche un message d'erreur en cas d'échec", () => {
    mockUseProductDetailQuery.mockReturnValue({
      data: null,
      isPending: false,
      isError: true,
      error: null,
    });

    renderComponent();

    expect(screen.getByText("Erreur lors du chargement de la propriété")).toBeInTheDocument();
  });

  it("affiche un message lorsque la propriété est introuvable", () => {
    mockUseProductDetailQuery.mockReturnValue({
      data: null,
      isPending: false,
      isError: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText("Propriété non trouvée")).toBeInTheDocument();
  });

  it("affiche les informations de la propriété quand elles sont disponibles", () => {
    mockUseProductDetailQuery.mockReturnValue({
      data: product,
      isPending: false,
      isError: false,
      error: null,
    });

    renderComponent();

    expect(screen.getByText(product.name)).toBeInTheDocument();
    expect(screen.getByText(product.location)).toBeInTheDocument();
    const priceMatches = screen.getAllByText((_, element) =>
      Boolean(
        element?.textContent?.includes(`${product.price}`) && element.textContent.includes("€")
      )
    );

    expect(priceMatches.length).toBeGreaterThan(0);
  });

  it("permet de lancer la réservation", () => {
    mockUseProductDetailQuery.mockReturnValue({
      data: product,
      isPending: false,
      isError: false,
      error: null,
    });

    renderComponent();

    const bookButton = screen.getByRole("button", {
      name: new RegExp(`Réserver ${product.name}`, "i"),
    });

    fireEvent.click(bookButton);

    expect(mockNavigate).toHaveBeenCalledWith("/reservation-summary", {
      state: expect.objectContaining({
        property: product,
        from: `/property/${product.id}`,
      }),
    });
  });
});
