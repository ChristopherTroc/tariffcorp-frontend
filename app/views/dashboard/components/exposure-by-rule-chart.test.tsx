import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ExposureByRuleChart,
  aggregateExposureByRule,
} from "./exposure-by-rule-chart";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const chartItems = [
  { ruleId: "R1" as const, label: "R1", totalExposure: 100 },
  { ruleId: "R2" as const, label: "R2", totalExposure: 200 },
  { ruleId: "R3" as const, label: "R3", totalExposure: 50 },
];

describe("aggregateExposureByRule", () => {
  it("sums positive exposure by rule and ignores overpayments", () => {
    const result = aggregateExposureByRule([
      { ruleId: "R1", exposure: 100 },
      { ruleId: "R1", exposure: 50 },
      { ruleId: "R2", exposure: -20 },
      { ruleId: "R3", exposure: 30 },
      { ruleId: null, exposure: 999 },
    ]);
    expect(result.find((r) => r.ruleId === "R1")?.totalExposure).toBe(150);
    expect(result.find((r) => r.ruleId === "R2")?.totalExposure).toBe(0);
    expect(result.find((r) => r.ruleId === "R3")?.totalExposure).toBe(30);
  });

  it("returns empty when no rule ids present", () => {
    expect(aggregateExposureByRule([{ ruleId: null, exposure: 10 }])).toEqual(
      [],
    );
  });
});

describe("ExposureByRuleChart", () => {
  it("renders unavailable state when flagged", () => {
    render(<ExposureByRuleChart items={[]} unavailable />);
    expect(screen.getByText(/Rule exposure unavailable/i)).toBeInTheDocument();
  });

  it("links each rule bar to findings filtered by that rule", () => {
    render(<ExposureByRuleChart items={chartItems} />);
    expect(screen.getByText(/R1 — Asian flat/i).closest("a")).toHaveAttribute(
      "href",
      "/findings?rule=R1",
    );
    expect(screen.getByText(/R2 — Russia/i).closest("a")).toHaveAttribute(
      "href",
      "/findings?rule=R2",
    );
    expect(screen.getByText(/R3 — EU/i).closest("a")).toHaveAttribute(
      "href",
      "/findings?rule=R3",
    );
  });

  it("shows cursor-following tooltip when hovering a bar", () => {
    const { container } = render(<ExposureByRuleChart items={chartItems} />);
    expect(screen.getByText(/Exposure by Rule/i)).toBeInTheDocument();
    expect(screen.queryByText("$100.00")).not.toBeInTheDocument();

    const bar = container.querySelector(".bg-chart-1");
    expect(bar).toBeTruthy();
    fireEvent.mouseEnter(bar!, { clientX: 120, clientY: 80 });
    fireEvent.mouseMove(bar!, { clientX: 120, clientY: 80 });

    expect(screen.getByText("$100.00")).toBeInTheDocument();
    expect(screen.getByText(/Underpaid · View findings/i)).toBeInTheDocument();

    const tip = screen.getByRole("tooltip");
    expect(tip).toHaveStyle({ left: "134px", top: "92px" });

    fireEvent.mouseLeave(bar!);
    expect(screen.queryByText("$100.00")).not.toBeInTheDocument();
  });
});
