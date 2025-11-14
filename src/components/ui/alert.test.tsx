import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Terminal: () => <span>Terminal Icon</span>,
  AlertCircle: () => <span>AlertCircle Icon</span>,
  CheckCircle: () => <span>CheckCircle Icon</span>,
}));

describe("Alert Components", () => {
  describe("Alert", () => {
    it("should render alert with default variant", () => {
      render(
        <Alert>
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>This is a default alert message.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveClass("border", "text-foreground");
    });

    it("should render alert with destructive variant", () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error Alert</AlertTitle>
          <AlertDescription>This is an error message.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border-destructive/50", "text-destructive");
    });

    it("should render alert with default variant", () => {
      render(
        <Alert>
          <AlertTitle>Default Alert</AlertTitle>
          <AlertDescription>This is a default message.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-background", "text-foreground");
    });

    it("should accept custom className", () => {
      render(
        <Alert className="custom-alert-class">
          <AlertDescription>Custom styled alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("custom-alert-class");
    });

    it("should render children content", () => {
      render(
        <Alert>
          <AlertTitle>Test Title</AlertTitle>
          <AlertDescription>Test description content</AlertDescription>
        </Alert>
      );

      expect(screen.getByText("Test Title")).toBeInTheDocument();
      expect(screen.getByText("Test description content")).toBeInTheDocument();
    });
  });

  describe("AlertTitle", () => {
    it("should render alert title correctly", () => {
      render(
        <Alert>
          <AlertTitle>Important Notice</AlertTitle>
        </Alert>
      );

      const title = screen.getByText("Important Notice");
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass("mb-1", "font-medium", "leading-none", "tracking-tight");
    });

    it("should accept custom className", () => {
      render(
        <Alert>
          <AlertTitle className="custom-title-class">Custom Title</AlertTitle>
        </Alert>
      );

      const title = screen.getByText("Custom Title");
      expect(title).toHaveClass("custom-title-class");
    });

    it("should render as h5 element by default", () => {
      render(
        <Alert>
          <AlertTitle>Heading Title</AlertTitle>
        </Alert>
      );

      const title = screen.getByRole("heading", { level: 5 });
      expect(title).toBeInTheDocument();
    });
  });

  describe("AlertDescription", () => {
    it("should render alert description correctly", () => {
      render(
        <Alert>
          <AlertDescription>This is detailed information about the alert.</AlertDescription>
        </Alert>
      );

      const description = screen.getByText("This is detailed information about the alert.");
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass("text-sm", "[&_p]:leading-relaxed");
    });

    it("should accept custom className", () => {
      render(
        <Alert>
          <AlertDescription className="custom-desc-class">Custom description</AlertDescription>
        </Alert>
      );

      const description = screen.getByText("Custom description");
      expect(description).toHaveClass("custom-desc-class");
    });

    it("should support rich content", () => {
      render(
        <Alert>
          <AlertDescription>
            <p>First paragraph</p>
            <p>Second paragraph</p>
          </AlertDescription>
        </Alert>
      );

      expect(screen.getByText("First paragraph")).toBeInTheDocument();
      expect(screen.getByText("Second paragraph")).toBeInTheDocument();
    });
  });

  describe("Alert Accessibility", () => {
    it("should have proper ARIA role", () => {
      render(
        <Alert>
          <AlertDescription>Accessible alert</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("should be announed by screen readers", () => {
      render(
        <Alert>
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>This message is important for users</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("role", "alert");
    });
  });

  describe("Alert Complete Examples", () => {
    it("should render complete default alert", () => {
      render(
        <Alert>
          <AlertTitle>Information</AlertTitle>
          <AlertDescription>This is an informational message.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("bg-background");
      expect(screen.getByText("Information")).toBeInTheDocument();
      expect(screen.getByText("This is an informational message.")).toBeInTheDocument();
    });

    it("should render complete error alert", () => {
      render(
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong. Please try again.</AlertDescription>
        </Alert>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("border-destructive/50");
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
    });

    it("should render alert without title", () => {
      render(
        <Alert>
          <AlertDescription>This alert only has a description.</AlertDescription>
        </Alert>
      );

      expect(screen.getByText("This alert only has a description.")).toBeInTheDocument();
      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    });
  });
});
