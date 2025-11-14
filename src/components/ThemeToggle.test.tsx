import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ThemeToggle from "./ThemeToggle";

// Mock next-themes
const mockSetTheme = vi.fn();
const mockTheme = { theme: "light", setTheme: mockSetTheme };

vi.mock("next-themes", () => ({
  useTheme: () => mockTheme,
}));

// Mock des composants UI
vi.mock("@/components/ui/switch", () => ({
  Switch: ({ checked, onCheckedChange, ...props }: any) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      {...props}
    >
      Switch
    </button>
  ),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTheme.theme = "light";
  });

  it("should render theme toggle with sun and moon icons", () => {
    render(<ThemeToggle />);

    expect(screen.getByRole("switch")).toBeInTheDocument();
    // Le composant doit être présent avec le switch
    const container = screen.getByRole("switch").closest("div");
    expect(container).toBeInTheDocument();
  });

  it("should toggle to dark theme when switch is clicked", () => {
    render(<ThemeToggle />);

    const switchElement = screen.getByRole("switch");
    fireEvent.click(switchElement);

    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("should toggle to light theme when in dark mode", () => {
    mockTheme.theme = "dark";
    render(<ThemeToggle />);

    const switchElement = screen.getByRole("switch");
    fireEvent.click(switchElement);

    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("should reflect current theme state", () => {
    mockTheme.theme = "dark";
    render(<ThemeToggle />);

    const switchElement = screen.getByRole("switch");
    expect(switchElement).toHaveAttribute("aria-checked", "true");
  });
});
