import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePageTitle } from "../hooks/use-page-title";

describe("usePageTitle", () => {
  it("should set document title with suffix", () => {
    const testTitle = "Test Page";
    const expectedTitle = "Test Page - Shu-no";

    renderHook(() => usePageTitle(testTitle));

    expect(document.title).toBe(expectedTitle);
  });

  it("should restore previous title on unmount", () => {
    const originalTitle = document.title;
    const testTitle = "Test Page";

    const { unmount } = renderHook(() => usePageTitle(testTitle));
    unmount();

    expect(document.title).toBe(originalTitle);
  });

  it("should use custom suffix", () => {
    const testTitle = "Test Page";
    const customSuffix = " - Custom App";
    const expectedTitle = "Test Page - Custom App";

    renderHook(() => usePageTitle(testTitle, customSuffix));

    expect(document.title).toBe(expectedTitle);
  });
});
