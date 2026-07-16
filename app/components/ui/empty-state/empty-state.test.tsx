import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="No results found." />);
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="T" description="Try a different search." />);
    expect(screen.getByText("Try a different search.")).toBeInTheDocument();
  });

  it("does not render description when omitted", () => {
    render(<EmptyState title="T" />);
    expect(screen.queryByText("Try a different search.")).not.toBeInTheDocument();
  });

  it("renders CTA link with correct href when both ctaLabel and ctaHref are provided", () => {
    render(<EmptyState title="T" ctaLabel="Go back" ctaHref="/products" />);
    const link = screen.getByText("Go back").closest("a");
    expect(link?.getAttribute("href")).toBe("/products");
  });

  it("does not render CTA when only ctaLabel is provided without ctaHref", () => {
    render(<EmptyState title="T" ctaLabel="Go back" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not render CTA when only ctaHref is provided without ctaLabel", () => {
    render(<EmptyState title="T" ctaHref="/products" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(
      <EmptyState title="T" className="my-class" />,
    );
    expect(container.firstChild).toHaveClass("my-class");
  });
});
