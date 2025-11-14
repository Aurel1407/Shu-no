import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("should merge class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle conditional classes", () => {
    const condition1 = true;
    const condition2 = false;
    expect(cn("class1", condition1 && "class2", condition2 && "class3")).toBe("class1 class2");
  });

  it("should merge conflicting Tailwind classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should handle arrays of classes", () => {
    expect(cn(["class1", "class2"], "class3")).toBe("class1 class2 class3");
  });

  it("should handle undefined and null values", () => {
    expect(cn("class1", undefined, null, "class2")).toBe("class1 class2");
  });

  it("should handle empty inputs", () => {
    expect(cn()).toBe("");
  });

  it("should handle object syntax", () => {
    expect(cn({ class1: true, class2: false })).toBe("class1");
  });
});
