import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ErrorService, errorService, ApiError } from "./error-service";

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

import { toast } from "sonner";

describe("ErrorService", () => {
  let service: ErrorService;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Get fresh instance and reset metrics
    service = ErrorService.getInstance();
    service.resetMetrics();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Singleton pattern", () => {
    it("should return the same instance", () => {
      const instance1 = ErrorService.getInstance();
      const instance2 = ErrorService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it("should use global errorService instance", () => {
      expect(errorService).toBeInstanceOf(ErrorService);
    });
  });

  describe("Error handling", () => {
    it("should handle string errors", () => {
      const errorMessage = "Test error message";
      service.handleError(errorMessage, "TestContext");

      expect(toast.error).toHaveBeenCalledWith(errorMessage, {
        duration: 5000,
        action: {
          label: "Fermer",
          onClick: expect.any(Function),
        },
      });
    });

    it("should handle JavaScript Error objects", () => {
      const error = new Error("JavaScript error");
      service.handleError(error, "TestContext");

      expect(toast.error).toHaveBeenCalledWith("JavaScript error", {
        duration: 5000,
        action: {
          label: "Fermer",
          onClick: expect.any(Function),
        },
      });
    });

    it("should handle errors without message", () => {
      const error = {} as Error;
      service.handleError(error, "TestContext");

      expect(toast.error).toHaveBeenCalledWith("Une erreur inattendue s'est produite", {
        duration: 5000,
        action: {
          label: "Fermer",
          onClick: expect.any(Function),
        },
      });
    });
  });

  describe("API Error handling", () => {
    it("should handle 4xx API errors", () => {
      const apiError: ApiError = {
        error: "Bad Request",
        message: "Invalid input data",
        statusCode: 400,
        timestamp: "2023-01-01T00:00:00Z",
        path: "/api/test",
      };

      service.handleApiError(apiError, "API");

      expect(toast.error).toHaveBeenCalledWith("Invalid input data", {
        duration: 5000,
        action: {
          label: "Fermer",
          onClick: expect.any(Function),
        },
      });
    });

    it("should handle 5xx API errors with retry option", () => {
      const apiError: ApiError = {
        error: "Internal Server Error",
        message: "Server is down",
        statusCode: 500,
        timestamp: "2023-01-01T00:00:00Z",
        path: "/api/test",
      };

      service.handleApiError(apiError, "API");

      expect(toast.error).toHaveBeenCalledWith("Server is down", {
        duration: 7000,
        action: {
          label: "Réessayer",
          onClick: expect.any(Function),
        },
      });
    });

    it("should log API error details", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const apiError: ApiError = {
        error: "Not Found",
        message: "Resource not found",
        statusCode: 404,
        timestamp: "2023-01-01T00:00:00Z",
        path: "/api/test",
        requestId: "req-123",
        details: { id: "missing" },
      };

      service.handleApiError(apiError, "API");

      expect(consoleSpy).toHaveBeenCalledWith("[API Error - API]", {
        statusCode: 404,
        path: "/api/test",
        requestId: "req-123",
        details: { id: "missing" },
        timestamp: "2023-01-01T00:00:00Z",
      });

      consoleSpy.mockRestore();
    });
  });

  describe("Notification methods", () => {
    it("should show success message", () => {
      service.showSuccess("Operation successful");

      expect(toast.success).toHaveBeenCalledWith("Operation successful", {
        duration: 3000,
      });
    });

    it("should show info message", () => {
      service.showInfo("Information message");

      expect(toast.info).toHaveBeenCalledWith("Information message", {
        duration: 4000,
      });
    });

    it("should show warning message", () => {
      service.showWarning("Warning message");

      expect(toast.warning).toHaveBeenCalledWith("Warning message", {
        duration: 4000,
      });
    });
  });

  describe("Metrics tracking", () => {
    it("should track error metrics", () => {
      service.handleError("Test error 1", "Context1");
      service.handleError("Test error 2", "Context2");
      service.handleError("Test error 3", "Context1");

      const metrics = service.getMetrics();

      expect(metrics.total).toBe(3);
      expect(metrics.byType.error).toBe(3);
      expect(metrics.byContext.Context1).toBe(2);
      expect(metrics.byContext.Context2).toBe(1);
      expect(metrics.recent).toHaveLength(3);
    });

    it("should track API error metrics by status code", () => {
      const apiError400: ApiError = {
        error: "Bad Request",
        message: "Invalid input",
        statusCode: 400,
        timestamp: "2023-01-01T00:00:00Z",
        path: "/api/test",
      };

      const apiError500: ApiError = {
        error: "Internal Server Error",
        message: "Server error",
        statusCode: 500,
        timestamp: "2023-01-01T00:00:00Z",
        path: "/api/test",
      };

      service.handleApiError(apiError400);
      service.handleApiError(apiError500);

      const metrics = service.getMetrics();

      expect(metrics.byStatusCode[400]).toBe(1);
      expect(metrics.byStatusCode[500]).toBe(1);
      expect(metrics.byType.warning).toBe(1); // 400 is warning
      expect(metrics.byType.error).toBe(1); // 500 is error
    });

    it("should limit recent errors to maximum", () => {
      // Add more than maxRecentErrors (50)
      for (let i = 0; i < 55; i++) {
        service.handleError(`Error ${i}`, "TestContext");
      }

      const metrics = service.getMetrics();
      expect(metrics.recent).toHaveLength(50);
      expect(metrics.total).toBe(55);
    });

    it("should reset metrics correctly", () => {
      service.handleError("Test error", "TestContext");
      expect(service.getMetrics().total).toBe(1);

      service.resetMetrics();
      const metrics = service.getMetrics();

      expect(metrics.total).toBe(0);
      expect(metrics.byType.error).toBe(0);
      expect(metrics.byContext).toEqual({});
      expect(metrics.recent).toHaveLength(0);
    });
  });

  describe("Metrics export", () => {
    it("should export metrics with timestamp", () => {
      service.handleError("Test error", "TestContext");

      const exported = service.exportMetrics();

      expect(exported).toHaveProperty("timestamp");
      expect(exported.total).toBe(1);
      expect(exported.recent).toHaveLength(1);
    });

    it("should limit recent errors in export to 10", () => {
      // Add 15 errors
      for (let i = 0; i < 15; i++) {
        service.handleError(`Error ${i}`, "TestContext");
      }

      const exported = service.exportMetrics();

      expect(exported.recent).toHaveLength(10);
      expect(exported.total).toBe(15);
    });
  });

  describe("Log formatting", () => {
    it("should format log messages correctly", () => {
      const error = new Error("Test error");
      const formatted = service.formatLogMessage(error, "TestContext");

      expect(formatted).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z \[TestContext\] Test error$/
      );
    });

    it("should format log messages without context", () => {
      const error = new Error("Test error");
      const formatted = service.formatLogMessage(error);

      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z Test error$/);
    });

    it("should handle unknown errors in log formatting", () => {
      const formatted = service.formatLogMessage(null);

      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z Unknown error$/);
    });
  });

  describe("Error type detection", () => {
    it("should classify 500+ as error", () => {
      const apiError: ApiError = {
        error: "Internal Server Error",
        message: "Server error",
        statusCode: 500,
        timestamp: "2023-01-01T00:00:00Z",
        path: "/api/test",
      };

      service.handleApiError(apiError);
      const metrics = service.getMetrics();

      expect(metrics.byType.error).toBe(1);
    });

    it("should classify 400-499 as warning", () => {
      const apiError: ApiError = {
        error: "Bad Request",
        message: "Invalid input",
        statusCode: 400,
        timestamp: "2023-01-01T00:00:00Z",
        path: "/api/test",
      };

      service.handleApiError(apiError);
      const metrics = service.getMetrics();

      expect(metrics.byType.warning).toBe(1);
    });

    it("should classify other status codes as info", () => {
      const apiError: ApiError = {
        error: "Info",
        message: "Information",
        statusCode: 200,
        timestamp: "2023-01-01T00:00:00Z",
        path: "/api/test",
      };

      service.handleApiError(apiError);
      const metrics = service.getMetrics();

      expect(metrics.byType.info).toBe(1);
    });
  });
});
