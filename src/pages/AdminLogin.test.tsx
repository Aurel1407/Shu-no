import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminLogin from "./AdminLogin";
import * as useRoutePreloader from "@/hooks/use-route-preloader";
import { API_URLS } from "@/config/api";

// Mock des modules
vi.mock("@/hooks/use-route-preloader");
vi.mock("@/components/Header", () => ({
  default: () => <header data-testid="header">Header</header>,
}));
vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch as unknown as typeof fetch);

describe("AdminLogin", () => {
  const mockPreloadAdminRoutes = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRoutePreloader.useRoutePreloader).mockReturnValue({
      preloadAdminRoutes: mockPreloadAdminRoutes,
      preloadUserRoutes: vi.fn(),
      preloadPropertyRoutes: vi.fn(),
    });
    (globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;
  });

  const renderAdminLogin = () => {
    return render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    );
  };

  it("should render admin login form correctly", () => {
    renderAdminLogin();

    expect(screen.getByText(/Connexion Administrateur/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /se connecter/i })).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("should update form fields when typing", () => {
    renderAdminLogin();

    const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
    const passwordInput = screen.getByLabelText("Mot de passe") as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("admin@test.com");
    expect(passwordInput.value).toBe("password123");
  });

  it("should handle successful login", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: {
            accessToken: "fake-jwt-token",
            refreshToken: "fake-refresh-token",
            user: { id: 1, email: "admin@test.com", role: "admin" },
          },
        }),
    };
    mockFetch.mockResolvedValueOnce(mockResponse);

    renderAdminLogin();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mot de passe");
    const submitButton = screen.getByRole("button", {
      name: /se connecter au panneau d'administration/i,
    });

    fireEvent.change(emailInput, { target: { value: "admin@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        API_URLS.AUTH_LOGIN,
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "admin@test.com",
            password: "password123",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockPreloadAdminRoutes).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("should handle login error", async () => {
    const mockResponse = {
      ok: false,
      json: () => Promise.resolve({ message: "Email ou mot de passe incorrect" }),
    };
    mockFetch.mockResolvedValueOnce(mockResponse);

    renderAdminLogin();

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Mot de passe");
    const submitButton = screen.getByRole("button", {
      name: /se connecter au panneau d'administration/i,
    });

    fireEvent.change(emailInput, { target: { value: "wrong@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email ou mot de passe incorrect")).toBeInTheDocument();
    });
  });

  it("should show loading state during login", async () => {
    const mockResponse = {
      ok: true,
      json: () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                success: true,
                data: { accessToken: "fake-token", user: { id: 1, role: "admin" } },
              }),
            100
          )
        ),
    };
    mockFetch.mockResolvedValueOnce(mockResponse);

    renderAdminLogin();

    const submitButton = screen.getByRole("button", {
      name: /se connecter au panneau d'administration/i,
    });
    fireEvent.click(submitButton);

    expect(screen.getByText("Connexion...")).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("should handle network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    renderAdminLogin();

    const submitButton = screen.getByRole("button", { name: /se connecter/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("should have proper accessibility attributes", () => {
    renderAdminLogin();

    const form = screen.getByRole("form", { name: /connexion administrateur/i });
    expect(form).toBeInTheDocument();

    const emailInput = screen.getByLabelText("Email");
    expect(emailInput).toHaveAttribute("type", "email");
    expect(emailInput).toHaveAttribute("required");

    const passwordInput = screen.getByLabelText("Mot de passe");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(passwordInput).toHaveAttribute("required");
  });

  it("should clear error when form is resubmitted", async () => {
    // Premier échec
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: "Erreur" }),
    });

    renderAdminLogin();

    const submitButton = screen.getByRole("button", {
      name: /se connecter au panneau d'administration/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Email ou mot de passe incorrect")).toBeInTheDocument();
    });

    // Deuxième tentative
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          data: { accessToken: "token", user: { id: 1, role: "admin" } },
        }),
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText("Email ou mot de passe incorrect")).not.toBeInTheDocument();
    });
  });
});
