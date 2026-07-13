import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("joins multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignores falsy values", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar");
  });

  it("handles conditional object syntax from clsx", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });

  it("deduplicates conflicting Tailwind classes (tailwind-merge)", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });

  it("merges responsive and utility variants correctly", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("preserves non-conflicting classes alongside merged ones", () => {
    const result = cn("flex", "items-center", "p-2", "p-4");
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
    expect(result).toContain("p-4");
    expect(result).not.toContain("p-2");
  });
});
