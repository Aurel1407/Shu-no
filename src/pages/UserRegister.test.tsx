import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import UserRegister from "./UserRegister";

// Mock du hook useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de l'API
vi.mock("../lib/api-utils", () => ({
  apiCall: vi.fn(),
}));

// Mock du toast
vi.mock("../hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("UserRegister", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render registration form", () => {
    renderWithRouter(<UserRegister />);

    expect(screen.getByRole("heading", { name: /inscription/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /s'inscrire/i })).toBeInTheDocument();
  });

  it("should have all required form fields", () => {
    renderWithRouter(<UserRegister />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    // Vérifier les champs supplémentaires spécifiques à l'inscription
    const firstNameField = screen.getByPlaceholderText(/votre prénom/i);
    const lastNameField = screen.getByPlaceholderText(/votre nom/i);

    expect(firstNameField).toBeInTheDocument();
    expect(lastNameField).toBeInTheDocument();

    // Vérifier les champs de mot de passe
    const passwordFields = screen
      .getAllByDisplayValue("")
      .filter((el) => el.getAttribute("type") === "password");
    expect(passwordFields.length).toBeGreaterThan(0);
  });

  it("should have link to login page", () => {
    renderWithRouter(<UserRegister />);

    const loginLink = screen.getByRole("link", { name: /connexion|login|se connecter/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("should be accessible", () => {
    renderWithRouter(<UserRegister />);

    // Vérification de la structure accessible
    expect(screen.getByRole("main")).toBeInTheDocument();

    // Les inputs doivent avoir des labels
    const emailInput = screen.getByLabelText(/email/i);
    const passwordFields = screen
      .getAllByDisplayValue("")
      .filter((el) => el.getAttribute("type") === "password");

    expect(emailInput).toBeInTheDocument();
    expect(passwordFields.length).toBeGreaterThan(0);
  });

  it("should render inscription heading", () => {
    renderWithRouter(<UserRegister />);

    expect(screen.getByText(/inscription/i)).toBeInTheDocument();
  });
});
