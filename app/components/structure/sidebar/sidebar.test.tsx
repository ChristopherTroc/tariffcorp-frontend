import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "./sidebar";

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

vi.mock("@/app/hooks/use-dashboard", () => ({
  useDashboard: vi.fn(() => ({
    data: { data: { openFindingsCount: 21 } },
    isLoading: false,
    isError: false,
  })),
}));

import { usePathname } from "next/navigation";
import { useDashboard } from "@/app/hooks/use-dashboard";

const mockUsePathname = vi.mocked(usePathname);
const mockUseDashboard = vi.mocked(useDashboard);

describe("Sidebar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
    mockUseDashboard.mockReturnValue({
      data: { data: { openFindingsCount: 21 } },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useDashboard>);
  });

  it("renders all four navigation links", () => {
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Findings")).toBeInTheDocument();
  });

  it("applies active class to the current page link", () => {
    mockUsePathname.mockReturnValue("/transactions");
    render(<Sidebar />);
    const transactionsLink = screen.getByText("Transactions").closest("a");
    expect(transactionsLink?.className).toContain("text-primary");
  });

  it("does not apply active class to inactive links", () => {
    mockUsePathname.mockReturnValue("/transactions");
    render(<Sidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink?.className).toContain("text-muted-foreground");
  });

  it("Dashboard link is active only on exact /", () => {
    mockUsePathname.mockReturnValue("/");
    render(<Sidebar />);
    const dashboardLink = screen.getByText("Dashboard").closest("a");
    expect(dashboardLink?.className).toContain("text-primary");
  });

  it("shows Findings badge when openFindingsCount > 0", () => {
    render(<Sidebar />);
    expect(screen.getByText("21")).toBeInTheDocument();
  });

  it("hides Findings badge when openFindingsCount is zero", () => {
    mockUseDashboard.mockReturnValue({
      data: { data: { openFindingsCount: 0 } },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useDashboard>);
    render(<Sidebar />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("toggles mobile drawer via hamburger", () => {
    render(<Sidebar />);
    const hamburger = screen.getByLabelText("Toggle menu");
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(hamburger);
    expect(hamburger).toHaveAttribute("aria-expanded", "false");
  });

  it("renders brand and tenant footer", () => {
    render(<Sidebar />);
    expect(screen.getAllByText("TariffCorp").length).toBeGreaterThan(0);
    expect(screen.getByText(/Compliance Intelligence/i)).toBeInTheDocument();
    expect(screen.getByText(/Acme Corp/i)).toBeInTheDocument();
  });
});
