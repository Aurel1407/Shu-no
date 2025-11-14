import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useToast } from "./use-toast";

describe("useToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should provide toast function", () => {
    const { result } = renderHook(() => useToast());

    expect(result.current).toHaveProperty("toast");
    expect(typeof result.current.toast).toBe("function");
    expect(result.current).toHaveProperty("dismiss");
    expect(typeof result.current.dismiss).toBe("function");
  });

  it("should add toast to state when toast is called", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Success message",
        description: "Operation completed successfully",
        variant: "default",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Success message",
      description: "Operation completed successfully",
      variant: "default",
    });
  });

  it("should handle destructive variant toast", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Error message",
        description: "Something went wrong",
        variant: "destructive",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Error message",
      description: "Something went wrong",
      variant: "destructive",
    });
  });

  it("should handle toast without description", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Simple message",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Simple message",
    });
  });

  it("should handle different toast variants", () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.toast({
        title: "Default message",
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Default message",
    });
  });

  it("should dismiss toast when dismiss is called", () => {
    const { result } = renderHook(() => useToast());

    let toastId: string;
    act(() => {
      const toastResult = result.current.toast({
        title: "Test message",
      });
      toastId = toastResult.id;
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss(toastId);
    });

    // Toast should be marked as dismissed (open: false)
    expect(result.current.toasts[0]).toMatchObject({
      open: false,
    });
  });

  it("should handle toast with action", () => {
    const { result } = renderHook(() => useToast());
    const mockAction = { label: "Undo", onClick: vi.fn() };

    act(() => {
      result.current.toast({
        title: "Message with action",
        action: mockAction,
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0]).toMatchObject({
      title: "Message with action",
      action: mockAction,
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
