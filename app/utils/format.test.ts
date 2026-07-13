import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, formatExposure } from "./format";

describe("formatCurrency", () => {
  it("formats a positive value", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats a negative value with leading minus", () => {
    expect(formatCurrency(-50)).toBe("-$50.00");
  });

  it("formats a large value with thousands separator", () => {
    expect(formatCurrency(10000)).toBe("$10,000.00");
  });

  it("rounds to 2 decimal places", () => {
    expect(formatCurrency(99.999)).toBe("$100.00");
  });
});

describe("formatDate", () => {
  it("formats a full ISO datetime string", () => {
    expect(formatDate("2026-04-12T00:00:00.000Z")).toBe("Apr 12, 2026");
  });

  it("formats a date-only ISO string", () => {
    expect(formatDate("2026-01-01T00:00:00.000Z")).toBe("Jan 1, 2026");
  });

  it("formats December correctly", () => {
    expect(formatDate("2026-12-31T00:00:00.000Z")).toBe("Dec 31, 2026");
  });
});

describe("formatExposure", () => {
  it("formats a positive value with leading plus", () => {
    expect(formatExposure(100)).toBe("+$100.00");
  });

  it("formats a negative value with leading minus", () => {
    expect(formatExposure(-50)).toBe("-$50.00");
  });

  it("formats zero without sign", () => {
    expect(formatExposure(0)).toBe("$0.00");
  });

  it("formats a large positive exposure", () => {
    expect(formatExposure(2028.5)).toBe("+$2,028.50");
  });

  it("formats a large negative exposure", () => {
    expect(formatExposure(-1234.56)).toBe("-$1,234.56");
  });
});
