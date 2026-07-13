import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("mobile menu is hidden by default", () => {
    render(<Nav />);
    const mobileLinks = screen.getAllByText("Dashboard");
    // Only one Dashboard link (desktop) — mobile menu is not mounted
    expect(mobileLinks.length).toBe(1);
  });

  it("clicking the hamburger button shows mobile menu links", () => {
    render(<Nav />);
    const hamburger = screen.getByLabelText("Toggle menu");
    fireEvent.click(hamburger);
    // After toggle, both desktop and mobile links are in DOM
    expect(screen.getAllByText("Dashboard").length).toBe(2);
    expect(screen.getAllByText("Transactions").length).toBe(2);
  });

  it("clicking hamburger again hides the mobile menu", () => {
    render(<Nav />);
    const hamburger = screen.getByLabelText("Toggle menu");
    fireEvent.click(hamburger);
    fireEvent.click(hamburger);
    expect(screen.getAllByText("Dashboard").length).toBe(1);
  });

  it("clicking a mobile link closes the menu", () => {
    render(<Nav />);
    const hamburger = screen.getByLabelText("Toggle menu");
    fireEvent.click(hamburger);
    // There are now 2 Dashboard links; click the second one (mobile)
    const mobileDashboardLinks = screen.getAllByText("Dashboard");
    fireEvent.click(mobileDashboardLinks[1]);
    // Mobile menu should be closed — back to 1 Dashboard link
    expect(screen.getAllByText("Dashboard").length).toBe(1);
  });
});
