import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSuccessMessage } from "./use-success-message";

describe("useSuccessMessage", () => {
  beforeAll(() => {
    // Mock requestAnimationFrame once for all tests
    global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
      setTimeout(cb, 16);
      return 1;
    });
  });

  beforeEach(() => {
    // Clear any existing success messages
    document.querySelectorAll(".fixed.top-4.right-4").forEach((el) => {
      el.remove();
    });
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("should return showSuccessMessage function", () => {
    const { result } = renderHook(() => useSuccessMessage());

    expect(result.current.showSuccessMessage).toBeInstanceOf(Function);
  });

  it("should create success message element with correct styles", () => {
    const { result } = renderHook(() => useSuccessMessage());
    const message = "Test success message";

    act(() => {
      result.current.showSuccessMessage(message);
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4");
    expect(messageElement).toBeTruthy();
    expect(messageElement?.textContent).toBe(message);
    expect(messageElement?.className).toContain("bg-green-500");
    expect(messageElement?.className).toContain("text-white");
    expect(messageElement?.className).toContain("px-4");
    expect(messageElement?.className).toContain("py-2");
    expect(messageElement?.className).toContain("rounded");
    expect(messageElement?.className).toContain("shadow-lg");
    expect(messageElement?.className).toContain("z-50");
    expect(messageElement?.className).toContain("transition-opacity");
    expect(messageElement?.className).toContain("duration-300");
  });

  it("should initially set opacity to 0", () => {
    const { result } = renderHook(() => useSuccessMessage());

    act(() => {
      result.current.showSuccessMessage("Test message");
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4") as HTMLElement;
    expect(messageElement?.style.opacity).toBe("0");
  });

  it("should show animation by setting opacity to 1", async () => {
    const { result } = renderHook(() => useSuccessMessage());

    act(() => {
      result.current.showSuccessMessage("Test message");
    });

    // Wait for requestAnimationFrame
    await act(async () => {
      vi.advanceTimersByTime(20);
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4") as HTMLElement;
    expect(messageElement?.style.opacity).toBe("1");
  });

  it("should use default duration of 3000ms", () => {
    const { result } = renderHook(() => useSuccessMessage());

    act(() => {
      result.current.showSuccessMessage("Test message");
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4") as HTMLElement;
    expect(messageElement).toBeTruthy();

    // Fast-forward time just before default duration
    act(() => {
      vi.advanceTimersByTime(2999);
    });

    expect(document.querySelector(".fixed.top-4.right-4")).toBeTruthy();

    // Fast-forward to trigger removal
    act(() => {
      vi.advanceTimersByTime(1);
    });

    const updatedElement = document.querySelector(".fixed.top-4.right-4") as HTMLElement;
    expect(updatedElement?.style.opacity).toBe("0");
  });

  it("should use custom duration when provided", () => {
    const { result } = renderHook(() => useSuccessMessage());
    const customDuration = 5000;

    act(() => {
      result.current.showSuccessMessage("Test message", customDuration);
    });

    // Fast-forward time just before custom duration
    act(() => {
      vi.advanceTimersByTime(customDuration - 1);
    });

    expect(document.querySelector(".fixed.top-4.right-4")).toBeTruthy();

    // Fast-forward to trigger removal
    act(() => {
      vi.advanceTimersByTime(1);
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4") as HTMLElement;
    expect(messageElement?.style.opacity).toBe("0");
  });

  it("should remove element from DOM after fade out animation", () => {
    const { result } = renderHook(() => useSuccessMessage());

    act(() => {
      result.current.showSuccessMessage("Test message", 1000);
    });

    expect(document.querySelector(".fixed.top-4.right-4")).toBeTruthy();

    // Fast-forward to fade out
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4") as HTMLElement;
    expect(messageElement?.style.opacity).toBe("0");

    // Fast-forward fade out animation (300ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(document.querySelector(".fixed.top-4.right-4")).toBeNull();
  });

  it("should handle multiple success messages", () => {
    const { result } = renderHook(() => useSuccessMessage());

    act(() => {
      result.current.showSuccessMessage("Message 1");
      result.current.showSuccessMessage("Message 2");
      result.current.showSuccessMessage("Message 3");
    });

    const messages = document.querySelectorAll(".fixed.top-4.right-4");
    expect(messages).toHaveLength(3);
    expect(messages[0].textContent).toBe("Message 1");
    expect(messages[1].textContent).toBe("Message 2");
    expect(messages[2].textContent).toBe("Message 3");
  });

  it("should handle removal when parent node is null", () => {
    const { result } = renderHook(() => useSuccessMessage());

    act(() => {
      result.current.showSuccessMessage("Test message", 100);
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4") as HTMLElement;

    // Manually remove the element from DOM before timeout
    act(() => {
      messageElement.remove();
    });

    // Fast-forward past removal time - should not throw error
    expect(() => {
      act(() => {
        vi.advanceTimersByTime(500);
      });
    }).not.toThrow();
  });

  it("should maintain callback stability", () => {
    const { result, rerender } = renderHook(() => useSuccessMessage());
    const firstCallback = result.current.showSuccessMessage;

    rerender();
    const secondCallback = result.current.showSuccessMessage;

    expect(firstCallback).toBe(secondCallback);
  });

  it("should handle empty message", () => {
    const { result } = renderHook(() => useSuccessMessage());

    act(() => {
      result.current.showSuccessMessage("");
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4");
    expect(messageElement).toBeTruthy();
    expect(messageElement?.textContent).toBe("");
  });

  it("should handle long messages", () => {
    const { result } = renderHook(() => useSuccessMessage());
    const longMessage = "A".repeat(1000);

    act(() => {
      result.current.showSuccessMessage(longMessage);
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4");
    expect(messageElement?.textContent).toBe(longMessage);
  });

  it("should handle special characters in message", () => {
    const { result } = renderHook(() => useSuccessMessage());
    const specialMessage = '✓ Success! 🎉 <script>alert("test")</script>';

    act(() => {
      result.current.showSuccessMessage(specialMessage);
    });

    const messageElement = document.querySelector(".fixed.top-4.right-4");
    expect(messageElement?.textContent).toBe(specialMessage);
    // Ensure it's treated as text, not HTML - characters should be HTML encoded
    expect(messageElement?.innerHTML).toBe(
      '✓ Success! 🎉 &lt;script&gt;alert("test")&lt;/script&gt;'
    );
  });
});
