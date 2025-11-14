import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAsyncOperation } from "../hooks/use-async-operation";

// Mock du service d'erreurs
vi.mock("@/lib/error-service", () => ({
  errorService: {
    handleError: vi.fn(),
    showSuccess: vi.fn(),
    showError: vi.fn(),
  },
}));

describe("useAsyncOperation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle successful operation", async () => {
    const mockOperation = vi.fn().mockResolvedValue("success");
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, { onSuccess: mockOnSuccess })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
    expect(mockOperation).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it("should handle operation with parameters", async () => {
    const mockOperation = vi.fn().mockResolvedValue("success");

    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    await act(async () => {
      await result.current.execute("param1", "param2");
    });

    expect(mockOperation).toHaveBeenCalledWith("param1", "param2");
  });

  it("should handle operation errors", async () => {
    const mockError = new Error("Test error");
    const mockOperation = vi.fn().mockRejectedValue(mockError);
    const mockOnError = vi.fn();

    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, {
        onError: mockOnError,
        context: "Test Context",
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe("Test error");
    expect(result.current.retryCount).toBe(0);
    expect(mockOperation).toHaveBeenCalled();
    expect(mockOnError).toHaveBeenCalledWith(mockError);
  });

  it("should handle non-Error objects as errors", async () => {
    const mockOperation = vi.fn().mockRejectedValue("string error");

    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe("string error");
  });

  it("should retry failed operations", async () => {
    const mockError = new Error("Network error");
    const mockOperation = vi
      .fn()
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce("success");

    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, {
        maxRetries: 2,
        retryDelay: 100,
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(mockOperation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    expect(result.current.retryCount).toBe(2);
    expect(result.current.error).toBeNull(); // Success on third try
  });

  it("should not retry client errors (4xx)", async () => {
    const mockError = { statusCode: 400, message: "Bad Request" };
    const mockOperation = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, {
        maxRetries: 3,
        retryDelay: 100,
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(mockOperation).toHaveBeenCalledTimes(1); // No retry for client errors
    expect(result.current.retryCount).toBe(0);
    expect(result.current.error).toBe("Bad Request");
  });

  it("should set loading state during operation", async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockOperation = vi.fn().mockReturnValue(promise);

    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    // Démarrer l'opération
    act(() => {
      result.current.execute();
    });

    // Vérifier que loading est true immédiatement après le démarrage
    expect(result.current.loading).toBe(true);

    // Résoudre la promesse
    act(() => {
      resolvePromise("success");
    });

    // Attendre que l'état se mette à jour
    await act(async () => {
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it("should reset error when resetError is called", async () => {
    const mockError = new Error("Test error");
    const mockOperation = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useAsyncOperation(mockOperation));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe("Test error");
    expect(result.current.retryCount).toBe(0);

    act(() => {
      result.current.resetError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
  });

  it("should provide executeOnce method without retry", async () => {
    const mockError = new Error("Network error");
    const mockOperation = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useAsyncOperation(mockOperation, { maxRetries: 3 }));

    // executeOnce ne devrait pas retry
    await act(async () => {
      await result.current.executeOnce();
    });

    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result.current.retryCount).toBe(0);
  });

  it("should indicate if retry is possible", async () => {
    const mockError = new Error("Network error");
    const mockOperation = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useAsyncOperation(mockOperation, { maxRetries: 2 }));

    expect(result.current.canRetry).toBe(true);

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.canRetry).toBe(false); // Max retries reached
  });

  it("should handle context for error reporting", async () => {
    const mockError = new Error("Test error");
    const mockOperation = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useAsyncOperation(mockOperation, {
        context: "Custom Context",
        showErrorToast: true,
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    // Vérifier que le contexte est passé au service d'erreurs
    const { errorService } = await import("@/lib/error-service");
    expect(errorService.handleError).toHaveBeenCalledWith(mockError, "Custom Context");
  });
});
