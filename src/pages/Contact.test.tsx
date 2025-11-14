import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import Contact from "./Contact";

// Mock des composants qui nécessitent des données ou des APIs
vi.mock("../components/Header", () => ({
  default: () => <div data-testid="header">Header Mock</div>,
}));

vi.mock("../components/Footer", () => ({
  default: () => <div data-testid="footer">Footer Mock</div>,
}));

vi.mock("../components/contact/ContactForm", () => ({
  default: () => <div data-testid="contact-form">ContactForm Mock</div>,
}));

vi.mock("../components/contact/ContactInfo", () => ({
  default: () => <div data-testid="contact-info">ContactInfo Mock</div>,
}));

vi.mock("../components/contact/ContactMap", () => ({
  default: () => <div data-testid="contact-map">ContactMap Mock</div>,
}));

vi.mock("../components/contact/PropertiesList", () => ({
  default: () => <div data-testid="properties-list">PropertiesList Mock</div>,
}));

vi.mock("../components/contact/PointsOfInterestList", () => ({
  default: () => <div data-testid="points-of-interest">PointsOfInterestList Mock</div>,
}));

vi.mock("../components/contact/useProperties", () => ({
  useProperties: () => ({
    properties: [],
    error: null,
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Contact", () => {
  it("should render contact page heading", () => {
    renderWithRouter(<Contact />);

    expect(screen.getByRole("heading", { name: /contactez-nous/i })).toBeInTheDocument();
  });

  it("should render contact description", () => {
    renderWithRouter(<Contact />);

    expect(screen.getByText(/n'hésitez pas à nous contacter/i)).toBeInTheDocument();
    expect(screen.getByText(/côte de goëlo/i)).toBeInTheDocument();
  });

  it("should render contact form", () => {
    renderWithRouter(<Contact />);

    expect(screen.getByTestId("contact-form")).toBeInTheDocument();
  });

  it("should render contact information", () => {
    renderWithRouter(<Contact />);

    expect(screen.getByTestId("contact-info")).toBeInTheDocument();
  });

  it("should render contact map", () => {
    renderWithRouter(<Contact />);

    expect(screen.getByTestId("contact-map")).toBeInTheDocument();
  });

  it("should render properties list", () => {
    renderWithRouter(<Contact />);

    expect(screen.getByTestId("properties-list")).toBeInTheDocument();
  });

  it("should render points of interest", () => {
    renderWithRouter(<Contact />);

    expect(screen.getByTestId("points-of-interest")).toBeInTheDocument();
  });

  it("should have proper semantic structure", () => {
    renderWithRouter(<Contact />);

    const section = screen.getByRole("region", { name: /contactez-nous/i });
    expect(section).toBeInTheDocument();
    expect(section).toHaveAttribute("id", "main-content");
  });

  it("should have skip link for accessibility", () => {
    renderWithRouter(<Contact />);

    const skipLink = screen.getByText(/aller au contenu principal/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("should render header and footer components", () => {
    renderWithRouter(<Contact />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });
});
