import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AlertCard } from "./alert-card";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("AlertCard", () => {
  it("renders title and body", () => {
    render(<AlertCard title="Warning title" body="Some description" />);
    expect(screen.getByText("Warning title")).toBeInTheDocument();
    expect(screen.getByText("Some description")).toBeInTheDocument();
  });

  it("renders link with default label when href is provided", () => {
    render(<AlertCard title="T" body="B" href="/transactions" />);
    const link = screen.getByText("View →").closest("a");
    expect(link?.getAttribute("href")).toBe("/transactions");
  });

  it("renders link with custom linkLabel", () => {
    render(<AlertCard title="T" body="B" href="/products" linkLabel="Go →" />);
    expect(screen.getByText("Go →")).toBeInTheDocument();
  });

  it("does not render a link when href is omitted", () => {
    render(<AlertCard title="T" body="B" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("applies warning variant border class by default", () => {
    const { container } = render(<AlertCard title="T" body="B" />);
    expect(container.firstChild).toHaveClass("border-l-amber-500");
  });

  it("applies danger variant border class", () => {
    const { container } = render(<AlertCard title="T" body="B" variant="danger" />);
    expect(container.firstChild).toHaveClass("border-l-destructive");
  });

  it("merges custom className", () => {
    const { container } = render(
      <AlertCard title="T" body="B" className="extra-class" />,
    );
    expect(container.firstChild).toHaveClass("extra-class");
  });
});
