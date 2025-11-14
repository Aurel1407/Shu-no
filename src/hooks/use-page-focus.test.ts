import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageFocus } from "../hooks/use-page-focus";

describe("usePageFocus", () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = {
      focus: vi.fn(),
    } as any;

    // Mock getElementById pour retourner notre élément mock
    vi.spyOn(document, "getElementById").mockReturnValue(null);
  });

  it("should return a ref object", () => {
    const { result } = renderHook(() => usePageFocus());

    expect(result.current).toHaveProperty("current");
    expect(result.current.current).toBeNull();
  });

  it("should focus element after delay", async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => usePageFocus(100));

    // Simuler l'assignation de l'élément au ref
    act(() => {
      result.current.current = mockElement;
    });

    // Avancer le temps
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockElement.focus).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("should use default delay of 0", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => usePageFocus());

    act(() => {
      result.current.current = mockElement;
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(mockElement.focus).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
