import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Label } from "./label";

describe("Label", () => {
  it("should render label with default props", () => {
    render(<Label>Username</Label>);

    const label = screen.getByText("Username");
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveClass(
      "text-sm",
      "font-medium",
      "leading-none",
      "peer-disabled:cursor-not-allowed",
      "peer-disabled:opacity-70"
    );
  });

  it("should associate with form elements using htmlFor", () => {
    render(
      <div>
        <Label htmlFor="username-input">Username</Label>
        <input id="username-input" type="text" />
      </div>
    );

    const label = screen.getByText("Username");
    const input = screen.getByRole("textbox");

    expect(label).toHaveAttribute("for", "username-input");
    expect(input).toHaveAttribute("id", "username-input");
  });

  it("should accept custom className", () => {
    render(<Label className="custom-label-class">Custom Label</Label>);

    const label = screen.getByText("Custom Label");
    expect(label).toHaveClass("custom-label-class");
  });

  it("should render children content", () => {
    render(
      <Label>
        <span>Required</span> Field *
      </Label>
    );

    expect(screen.getByText("Required")).toBeInTheDocument();
    expect(screen.getByText("Field *", { exact: false })).toBeInTheDocument();
  });

  it("should support accessibility attributes", () => {
    render(
      <Label aria-describedby="help-text" aria-required="true">
        Password
      </Label>
    );

    const label = screen.getByText("Password");
    expect(label).toHaveAttribute("aria-describedby", "help-text");
    expect(label).toHaveAttribute("aria-required", "true");
  });

  it("should work with form elements", () => {
    render(
      <form>
        <Label htmlFor="email">Email Address</Label>
        <input id="email" type="email" name="email" required />
      </form>
    );

    const label = screen.getByText("Email Address");
    const input = screen.getByRole("textbox");

    expect(label).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("required");
  });

  it("should handle disabled state styling", () => {
    render(
      <div>
        <Label htmlFor="disabled-input">Disabled Field</Label>
        <input id="disabled-input" type="text" disabled />
      </div>
    );

    const label = screen.getByText("Disabled Field");
    expect(label).toHaveClass("peer-disabled:cursor-not-allowed", "peer-disabled:opacity-70");
  });

  it("should merge multiple classNames correctly", () => {
    render(<Label className="text-red-500 font-bold">Error Label</Label>);

    const label = screen.getByText("Error Label");
    expect(label).toHaveClass("text-sm", "leading-none"); // base classes that aren't overridden
    expect(label).toHaveClass("text-red-500", "font-bold"); // custom classes
  });

  it("should render as different elements when asChild is used", () => {
    render(
      <Label asChild>
        <div>Custom Element Label</div>
      </Label>
    );

    const customElement = screen.getByText("Custom Element Label");
    expect(customElement.tagName).toBe("DIV");
    expect(customElement).toHaveClass("text-sm", "font-medium");
  });

  it("should support complex label content", () => {
    render(
      <Label htmlFor="complex-input">
        <strong>Important:</strong> This field is <em>required</em> for processing.
      </Label>
    );

    expect(screen.getByText("Important:", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("required")).toBeInTheDocument();
    expect(screen.getByText("for processing.", { exact: false })).toBeInTheDocument();
  });

  it("should maintain focus relationships", () => {
    render(
      <div>
        <Label htmlFor="focus-test">Click to focus</Label>
        <input id="focus-test" type="text" />
      </div>
    );

    const label = screen.getByText("Click to focus");
    const input = screen.getByRole("textbox");

    // Vérifier que le label est correctement associé à l'input
    expect(label).toHaveAttribute("for", "focus-test");
    expect(input).toHaveAttribute("id", "focus-test");

    // Simuler un focus direct sur l'input pour tester la relation
    input.focus();
    expect(document.activeElement).toBe(input);
  });

  it("should work with checkbox inputs", () => {
    render(
      <div>
        <input id="checkbox-test" type="checkbox" />
        <Label htmlFor="checkbox-test">Accept terms and conditions</Label>
      </div>
    );

    const label = screen.getByText("Accept terms and conditions");
    const checkbox = screen.getByRole("checkbox");

    expect(label).toHaveAttribute("for", "checkbox-test");
    expect(checkbox).toHaveAttribute("id", "checkbox-test");
  });

  it("should work with radio inputs", () => {
    render(
      <div>
        <input id="radio-test" type="radio" name="options" value="option1" />
        <Label htmlFor="radio-test">Option 1</Label>
      </div>
    );

    const label = screen.getByText("Option 1");
    const radio = screen.getByRole("radio");

    expect(label).toHaveAttribute("for", "radio-test");
    expect(radio).toHaveAttribute("id", "radio-test");
  });
});
