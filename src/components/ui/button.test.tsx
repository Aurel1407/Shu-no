import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Button } from "./button";

describe("Button", () => {
  it("should render button with default variant", () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector("button");

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Click me");
    expect(button).toHaveClass("bg-primary");
  });

  it("should render with different variants", () => {
    const { container: primaryContainer } = render(<Button variant="default">Primary</Button>);
    const { container: secondaryContainer } = render(
      <Button variant="secondary">Secondary</Button>
    );
    const { container: destructiveContainer } = render(
      <Button variant="destructive">Destructive</Button>
    );

    const primaryButton = primaryContainer.querySelector("button");
    const secondaryButton = secondaryContainer.querySelector("button");
    const destructiveButton = destructiveContainer.querySelector("button");

    expect(primaryButton).toHaveClass("bg-primary");
    expect(secondaryButton).toHaveClass("bg-secondary");
    expect(destructiveButton).toHaveClass("bg-destructive");
  });

  it("should render with different sizes", () => {
    const { container: defaultContainer } = render(<Button size="default">Default</Button>);
    const { container: smContainer } = render(<Button size="sm">Small</Button>);
    const { container: lgContainer } = render(<Button size="lg">Large</Button>);

    const defaultButton = defaultContainer.querySelector("button");
    const smButton = smContainer.querySelector("button");
    const lgButton = lgContainer.querySelector("button");

    expect(defaultButton).toHaveClass("h-10", "px-4", "py-2");
    expect(smButton).toHaveClass("h-9", "px-3");
    expect(lgButton).toHaveClass("h-11", "px-8");
  });

  it("should handle disabled state", () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector("button");

    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:pointer-events-none");
  });

  it("should render as child component when asChild is true", () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
    expect(link).toHaveTextContent("Link Button");
  });

  it("should apply custom className", () => {
    const { container } = render(<Button className="custom-class">Custom</Button>);
    const button = container.querySelector("button");

    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-primary"); // Should still have default classes
  });

  it("should forward ref correctly", () => {
    const ref = { current: null };
    render(<Button ref={ref}>Test</Button>);

    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("should handle click events", () => {
    const handleClick = vi.fn();
    const { container } = render(<Button onClick={handleClick}>Click me</Button>);
    const button = container.querySelector("button");

    button?.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render outline variant correctly", () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    const button = container.querySelector("button");

    expect(button).toHaveClass("border-input", "bg-background");
  });

  it("should render ghost variant correctly", () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    const button = container.querySelector("button");

    expect(button).toHaveClass("hover:bg-accent");
  });

  it("should render link variant correctly", () => {
    const { container } = render(<Button variant="link">Link</Button>);
    const button = container.querySelector("button");

    expect(button).toHaveClass("text-primary", "underline-offset-4");
  });

  it("should render icon size correctly", () => {
    const { container } = render(<Button size="icon">Icon</Button>);
    const button = container.querySelector("button");

    expect(button).toHaveClass("h-10", "w-10");
  });
});
