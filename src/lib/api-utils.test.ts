import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiCall } from "../lib/api-utils";

describe("apiCall", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("should make a successful API call", async () => {
    const mockResponse = { data: "test data" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    global.fetch = mockFetch;

    const result = await apiCall("/api/test");

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:3002/api/test", {
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(result).toEqual(mockResponse);
  });

  it("should handle API errors", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    global.fetch = mockFetch;

    await expect(apiCall("/api/test")).rejects.toThrow("Erreur API: 404 Not Found");
  });

  it("should handle network errors", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

    global.fetch = mockFetch;

    await expect(apiCall("/api/test")).rejects.toThrow("Network error");
  });

  it("should include custom headers and options", async () => {
    const mockResponse = { data: "test data" };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    global.fetch = mockFetch;

    const customOptions = {
      method: "POST",
      headers: {
        Authorization: "Bearer token",
      },
      body: JSON.stringify({ test: "data" }),
    };

    await apiCall("/api/test", customOptions);

    expect(mockFetch).toHaveBeenCalledWith("http://localhost:3002/api/test", {
      method: "POST",
      headers: {
        Authorization: "Bearer token",
      },
      body: JSON.stringify({ test: "data" }),
    });
  });
});
