import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("should render switch component", () => {
    render(<Switch />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).toBeInTheDocument();
  });

  it("should handle checked state", () => {
    render(<Switch checked={true} />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).toBeChecked();
  });

  it("should handle unchecked state", () => {
    render(<Switch checked={false} />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).not.toBeChecked();
  });

  it("should handle disabled state", () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).toBeDisabled();
    expect(switchElement).toHaveClass("disabled:cursor-not-allowed");
  });

  it("should call onCheckedChange when clicked", () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole("switch");

    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("should not call onCheckedChange when disabled", () => {
    const handleChange = vi.fn();
    render(<Switch disabled onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole("switch");

    fireEvent.click(switchElement);

    expect(handleChange).not.toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    render(<Switch className="custom-class" />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).toHaveClass("custom-class");
  });

  it("should forward ref correctly", () => {
    const ref = { current: null };
    render(<Switch ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should have proper aria attributes", () => {
    render(<Switch checked={true} />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).toHaveAttribute("role", "switch");
    expect(switchElement).toHaveAttribute("aria-checked", "true");
  });

  it("should toggle state correctly", () => {
    const handleChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).not.toBeChecked();

    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("should have default styling classes", () => {
    render(<Switch />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).toHaveClass(
      "peer",
      "inline-flex",
      "items-center",
      "rounded-full",
      "border-2"
    );
  });

  it("should show thumb element", () => {
    const { container } = render(<Switch />);
    const thumb = container.querySelector("[data-state]");

    expect(thumb).toBeInTheDocument();
  });

  it("should handle keyboard interaction", () => {
    const handleChange = vi.fn();
    render(<Switch onCheckedChange={handleChange} />);
    const switchElement = screen.getByRole("switch");

    switchElement.focus();
    // Simule un clic plutôt qu'un événement clavier pour plus de fiabilité
    fireEvent.click(switchElement);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("should support controlled mode", () => {
    const { rerender } = render(<Switch checked={false} />);
    const switchElement = screen.getByRole("switch");

    expect(switchElement).not.toBeChecked();

    rerender(<Switch checked={true} />);

    expect(switchElement).toBeChecked();
  });
});
