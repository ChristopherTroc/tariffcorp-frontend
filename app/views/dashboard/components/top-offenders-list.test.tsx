import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopOffendersList } from "./top-offenders-list";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

const items = [
  { name: "Beacon Trade Group", totalExposure: 1091.5, href: "/transactions?broker=Beacon+Trade+Group" },
  { name: "GlobalTrade Brokers", totalExposure: 500, href: "/transactions?broker=GlobalTrade+Brokers" },
];

describe("TopOffendersList", () => {
  it("renders the section title", () => {
    render(<TopOffendersList title="Top Brokers" items={items} />);
    expect(screen.getByText("Top Brokers")).toBeInTheDocument();
  });

  it("renders each item name and formatted exposure", () => {
    render(<TopOffendersList title="Top Brokers" items={items} />);
    expect(screen.getByText("Beacon Trade Group")).toBeInTheDocument();
    expect(screen.getByText("$1,091.50")).toBeInTheDocument();
    expect(screen.getByText("GlobalTrade Brokers")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
  });

  it("each item is a link with the correct href", () => {
    render(<TopOffendersList title="Top Brokers" items={items} />);
    const link = screen.getByText("Beacon Trade Group").closest("a");
    expect(link?.getAttribute("href")).toBe(
      "/transactions?broker=Beacon+Trade+Group",
    );
  });

  it("renders skeleton placeholders when loading", () => {
    const { container } = render(
      <TopOffendersList title="Top Brokers" items={[]} loading />,
    );
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows 'No data yet' when items list is empty and not loading", () => {
    render(<TopOffendersList title="Top Brokers" items={[]} />);
    expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
  });
});
