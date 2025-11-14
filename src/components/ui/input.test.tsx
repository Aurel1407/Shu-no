import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("should render input with default props", () => {
    render(<Input />);

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass(
      "flex",
      "h-10",
      "w-full",
      "rounded-md",
      "border",
      "border-input",
      "bg-background",
      "px-3",
      "py-2"
    );
  });

  it("should render different input types", () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "email");

    rerender(<Input type="password" />);
    expect(screen.getByDisplayValue("")).toHaveAttribute("type", "password");

    rerender(<Input type="number" />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");

    rerender(<Input type="tel" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "tel");
  });

  it("should handle value and onChange", () => {
    const handleChange = vi.fn();
    render(<Input value="test" onChange={handleChange} />);

    const input = screen.getByDisplayValue("test") as HTMLInputElement;
    expect(input.value).toBe("test");

    fireEvent.change(input, { target: { value: "new value" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("should handle placeholder", () => {
    render(<Input placeholder="Enter your text" />);

    const input = screen.getByPlaceholderText("Enter your text");
    expect(input).toBeInTheDocument();
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled />);

    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
    expect(input).toHaveClass("disabled:cursor-not-allowed", "disabled:opacity-50");
  });

  it("should handle focus and blur events", () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);

    const input = screen.getByRole("textbox");

    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("should accept custom className", () => {
    render(<Input className="custom-input-class" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-input-class");
  });

  it("should support form attributes", () => {
    render(<Input name="username" id="username-input" required maxLength={50} minLength={3} />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("name", "username");
    expect(input).toHaveAttribute("id", "username-input");
    expect(input).toHaveAttribute("required");
    expect(input).toHaveAttribute("maxLength", "50");
    expect(input).toHaveAttribute("minLength", "3");
  });

  it("should support accessibility attributes", () => {
    render(
      <Input aria-label="Username input" aria-describedby="username-help" aria-invalid="true" />
    );

    const input = screen.getByLabelText("Username input");
    expect(input).toHaveAttribute("aria-describedby", "username-help");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("should handle readonly state", () => {
    render(<Input readOnly value="readonly value" />);

    const input = screen.getByDisplayValue("readonly value");
    expect(input).toHaveAttribute("readOnly");
  });

  it("should support step attribute for number inputs", () => {
    render(<Input type="number" step="0.01" />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("step", "0.01");
  });

  it("should support min and max for number inputs", () => {
    render(<Input type="number" min="0" max="100" />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
  });

  it("should support pattern attribute", () => {
    render(<Input pattern="[A-Za-z]{3}" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("pattern", "[A-Za-z]{3}");
  });

  it("should handle file input type", () => {
    render(<Input type="file" accept=".jpg,.png" />);

    const input = screen.getByDisplayValue("") as HTMLInputElement;
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("accept", ".jpg,.png");
  });

  it("should merge focus styles correctly", () => {
    render(<Input className="custom-focus" />);

    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("focus-visible:outline-none", "focus-visible:ring-2");
  });

  it("should support controlled and uncontrolled modes", () => {
    // Test uncontrolled
    const { rerender } = render(<Input defaultValue="default" />);
    const input = screen.getByDisplayValue("default") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "changed" } });
    expect(input.value).toBe("changed");

    // Test controlled
    const handleChange = vi.fn();
    rerender(<Input value="controlled" onChange={handleChange} />);
    const controlledInput = screen.getByDisplayValue("controlled") as HTMLInputElement;

    fireEvent.change(controlledInput, { target: { value: "new" } });
    expect(handleChange).toHaveBeenCalled();
  });
});
