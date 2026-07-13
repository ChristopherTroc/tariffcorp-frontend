import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Nav } from "./nav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    onClick,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

import { usePathname } from "next/navigation";
const mockUsePathname = vi.mocked(usePathname);

describe("Nav", () => {
  it("renders all four navigation links", () => {
    render(<Nav />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Findings")).toBeInTheDocument();
  });

  it("applies active class to the current page link", () => {
    mockUsePathname.mockReturnValue("/transactions");
    render(<Nav />);
    const transactionsLink = screen.getByText("Transactions").closest("a");
    expect(transactionsLink?.className).toContain("text-primary");
  });

  it("does not apply active class to inactive links", () => {
    mockUsePathname.mockReturnValue("/transactions");
    render(<Nav />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink?.className).toContain("text-muted-foreground");
  });

  it("Dashboard link is active only on exact /", () => {
    mockUsePathname.mockReturnValue("/");
    render(<Nav />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink?.className).toContain("text-primary");
  });
});
