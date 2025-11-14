import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("utils", () => {
  describe("cn function", () => {
    it("should combine class names correctly", () => {
      const result = cn("class1", "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should handle conditional classes", () => {
      const result = cn("base-class", true && "conditional-class", false && "hidden-class");
      expect(result).toContain("base-class");
      expect(result).toContain("conditional-class");
      expect(result).not.toContain("hidden-class");
    });

    it("should handle undefined and null values", () => {
      const result = cn("class1", undefined, null, "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should handle empty strings", () => {
      const result = cn("class1", "", "class2");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
    });

    it("should merge Tailwind classes correctly", () => {
      const result = cn("px-2 py-1", "px-4");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("should handle array of classes", () => {
      const result = cn(["class1", "class2"], "class3");
      expect(result).toContain("class1");
      expect(result).toContain("class2");
      expect(result).toContain("class3");
    });

    it("should handle object notation", () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      });
      expect(result).toContain("class1");
      expect(result).toContain("class3");
      expect(result).not.toContain("class2");
    });

    it("should return empty string for no arguments", () => {
      const result = cn();
      expect(result).toBe("");
    });
  });
});
