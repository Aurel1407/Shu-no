import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock simple component pour tester la couverture
function SimpleTestComponent() {
  return (
    <div data-testid="simple-component">
      <h1>Test Component</h1>
      <p>This is a simple test component</p>
    </div>
  );
}

describe("SimpleTestComponent", () => {
  it("renders correctly", () => {
    render(<SimpleTestComponent />);

    expect(screen.getByTestId("simple-component")).toBeInTheDocument();
    expect(screen.getByText("Test Component")).toBeInTheDocument();
    expect(screen.getByText("This is a simple test component")).toBeInTheDocument();
  });

  it("has correct structure", () => {
    render(<SimpleTestComponent />);

    const component = screen.getByTestId("simple-component");
    expect(component.tagName).toBe("DIV");

    const heading = screen.getByText("Test Component");
    expect(heading.tagName).toBe("H1");

    const paragraph = screen.getByText("This is a simple test component");
    expect(paragraph.tagName).toBe("P");
  });
});
