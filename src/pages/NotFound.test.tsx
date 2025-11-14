import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import NotFound from "../pages/NotFound";

describe("NotFound", () => {
  it("should render 404 error message", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Oops ! Page non trouvée")).toBeInTheDocument();
  });

  it("should render home button", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const homeButton = screen.getByRole("button", { name: /retourner à la page d'accueil/i });
    expect(homeButton).toBeInTheDocument();
  });

  it("should have correct accessibility attributes", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const mainContent = screen.getByRole("main", { name: "Page d'erreur 404" });
    expect(mainContent).toBeInTheDocument();

    const heading = screen.getByRole("heading", { name: "Erreur 404" });
    expect(heading).toBeInTheDocument();
  });

  it("should have skip link for accessibility", () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );

    const skipLink = screen.getByRole("link", { name: "Aller au contenu principal" });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });
});
