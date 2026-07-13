import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard, StatCardSkeleton } from "./stat-card";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("StatCard", () => {
  it("renders label and value", () => {
    render(<StatCard label="Total Exposure" value="$2,028.50" />);
    expect(screen.getByText("Total Exposure")).toBeInTheDocument();
    expect(screen.getByText("$2,028.50")).toBeInTheDocument();
  });

  it("wraps content in a link when href is provided", () => {
    render(<StatCard label="Open Findings" value="50" href="/findings" />);
    const link = screen.getByText("50").closest("a");
    expect(link?.getAttribute("href")).toBe("/findings");
  });

  it("does not render a link when href is omitted", () => {
    render(<StatCard label="Label" value="42" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("merges custom className onto the card div", () => {
    const { container } = render(
      <StatCard label="L" value="V" className="my-class" />,
    );
    const card = container.querySelector(".my-class");
    expect(card).toBeInTheDocument();
  });
});

describe("StatCardSkeleton", () => {
  it("renders two skeleton pulse elements", () => {
    const { container } = render(<StatCardSkeleton />);
    expect(container.querySelectorAll(".animate-pulse").length).toBe(2);
  });
});
