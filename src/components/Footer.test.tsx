import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "./Footer";

// Wrapper pour Router
const FooterWithRouter = () => (
  <BrowserRouter>
    <Footer />
  </BrowserRouter>
);

describe("Footer", () => {
  it("should render footer with company information", () => {
    render(<FooterWithRouter />);

    expect(screen.getByText("Shu no")).toBeInTheDocument();
    expect(screen.getByText(/Découvrez la beauté exceptionnelle/)).toBeInTheDocument();
  });

  it("should render navigation links", () => {
    render(<FooterWithRouter />);

    expect(screen.getByRole("link", { name: /accueil/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /réserver/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
  });

  it("should render contact information", () => {
    render(<FooterWithRouter />);

    // Vérifier les informations de contact spécifiques
    expect(screen.getByText("contact@shu-no.fr")).toBeInTheDocument();
    expect(screen.getByText("09 75 58 11 86")).toBeInTheDocument();
  });

  it("should render social media links", () => {
    render(<FooterWithRouter />);

    // Vérifier qu'il y a des liens vers les réseaux sociaux
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(3); // Au moins quelques liens
  });

  it("should have proper footer structure", () => {
    render(<FooterWithRouter />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
  });

  it("should render copyright information", () => {
    render(<FooterWithRouter />);

    // Rechercher le texte de copyright (probablement avec l'année courante)
    expect(screen.getByText(/©.*Shu no/i)).toBeInTheDocument();
  });
});
