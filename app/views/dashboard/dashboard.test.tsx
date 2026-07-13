import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewDashboard } from "./dashboard";
import type { IDashboardStats } from "@/app/types/api";

vi.mock("@/app/hooks/use-dashboard");
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import { useDashboard } from "@/app/hooks/use-dashboard";
const mockUseDashboard = vi.mocked(useDashboard);

const mockStats: IDashboardStats = {
  totalExposure: 2028.5,
  totalDutyDeclared: 1952,
  totalDutyComputed: 3980.5,
  openFindingsCount: 50,
  unmatchedTransactionsCount: 2,
  topOffenders: {
    byBroker: [{ name: "Beacon Trade Group", totalExposure: 1091.5 }],
    byPort: [{ name: "Long Beach", totalExposure: 852 }],
    byProduct: [{ id: "P-011", name: "Espresso beans 1kg", totalExposure: 441 }],
  },
};

describe("ViewDashboard", () => {
  beforeEach(() => {
    mockUseDashboard.mockReset();
  });

  it("renders skeleton on loading", () => {
    mockUseDashboard.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboard>);

    const { container } = render(<ViewDashboard />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders error state with retry on failure", () => {
    const mockRefetch = vi.fn();
    mockUseDashboard.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useDashboard>);

    render(<ViewDashboard />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it("renders KPI values formatted as currency", () => {
    mockUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockStats },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboard>);

    render(<ViewDashboard />);
    expect(screen.getByText("$2,028.50")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("renders unmatched alert with link to filtered transactions", () => {
    mockUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockStats },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboard>);

    render(<ViewDashboard />);
    expect(screen.getByText(/2 Unmatched/i)).toBeInTheDocument();
    const link = screen.getByText(/view unmatched/i).closest("a");
    expect(link?.getAttribute("href")).toBe("/transactions?status=unmatched");
  });

  it("top product links to /products/:id", () => {
    mockUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockStats },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboard>);

    render(<ViewDashboard />);
    const productLink = screen.getByText("Espresso beans 1kg").closest("a");
    expect(productLink?.getAttribute("href")).toBe("/products/P-011");
  });

  it("open findings KPI links to /findings", () => {
    mockUseDashboard.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockStats },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useDashboard>);

    render(<ViewDashboard />);
    const findingsLink = screen.getByText("50").closest("a");
    expect(findingsLink?.getAttribute("href")).toBe("/findings");
  });
});
