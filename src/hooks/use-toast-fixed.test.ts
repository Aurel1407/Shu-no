import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock de Sonner toast AVANT l'import du hook
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warning: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
};

vi.mock("sonner", () => ({
  toast: mockToast,
}));

import { useToast } from "./use-toast";

describe("useToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide toast function", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toHaveProperty("toast");
    expect(typeof result.current.toast).toBe("function");
  });

  it("should call sonner toast success for success type", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Success message",
        description: "Operation completed successfully",
        variant: "default",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Success message", {
      description: "Operation completed successfully",
    });
  });

  it("should call sonner toast error for destructive type", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Error message",
        description: "Something went wrong",
        variant: "destructive",
      });
    });

    expect(mockToast.error).toHaveBeenCalledWith("Error message", {
      description: "Something went wrong",
    });
  });

  it("should handle toast without description", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Simple message",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Simple message", {
      description: undefined,
    });
  });

  it("should handle different toast variants", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Default message",
        variant: "default",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Default message", {
      description: undefined,
    });
  });

  it("should provide toast metadata", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toHaveProperty("toasts");
    expect(result.current).toHaveProperty("dismiss");
    expect(typeof result.current.dismiss).toBe("function");
  });

  it("should call sonner dismiss when dismiss is called", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.dismiss();
    });

    expect(mockToast.dismiss).toHaveBeenCalled();
  });

  it("should handle toast with action", () => {
    const { result } = renderHook(() => useToast());
    const actionFn = vi.fn();

    act(() => {
      result.current.toast({
        title: "Message with action",
        action: {
          altText: "Action button",
          label: "Click me",
          onClick: actionFn,
        },
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Message with action", {
      description: undefined,
      action: expect.objectContaining({
        label: "Click me",
      }),
    });
  });

  it("should be stable across re-renders", () => {
    const { result, rerender } = renderHook(() => useToast());

    const firstToast = result.current.toast;
    const firstDismiss = result.current.dismiss;

    rerender();

    expect(result.current.toast).toBe(firstToast);
    expect(result.current.dismiss).toBe(firstDismiss);
  });
});
