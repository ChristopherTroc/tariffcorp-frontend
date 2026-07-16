import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewDashboard } from "./dashboard";
import type { IDashboardStats, IFinding } from "@/app/types/api";

vi.mock("@/app/hooks/use-dashboard");
vi.mock("@/app/hooks/use-findings");
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
import { useFindings } from "@/app/hooks/use-findings";

const mockUseDashboard = vi.mocked(useDashboard);
const mockUseFindings = vi.mocked(useFindings);

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

const mockFindings: IFinding[] = [
  {
    id: "F1",
    ruleId: "R1",
    ruleName: "Asian flat tariff",
    dutyComputed: 100,
    exposure: 50,
    transactionId: "T1",
    productId: "P-011",
  },
  {
    id: "F2",
    ruleId: "R3",
    ruleName: "EU consumables high-value duty",
    dutyComputed: 200,
    exposure: 80,
    transactionId: "T2",
    productId: "P-012",
  },
];

function mockLoadedDashboard(stats: IDashboardStats = mockStats) {
  mockUseDashboard.mockReturnValue({
    isLoading: false,
    isError: false,
    data: { data: stats },
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useDashboard>);
}

function mockLoadedFindings(findings: IFinding[] = mockFindings) {
  mockUseFindings.mockReturnValue({
    isLoading: false,
    isError: false,
    data: { data: findings, meta: { total: findings.length, page: 1, per_page: 100, total_pages: 1 } },
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useFindings>);
}

describe("ViewDashboard", () => {
  beforeEach(() => {
    mockUseDashboard.mockReset();
    mockUseFindings.mockReset();
    mockLoadedFindings();
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
    mockLoadedDashboard();
    render(<ViewDashboard />);
    expect(screen.getByText("$2,028.50")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("Total Exposure")).toBeInTheDocument();
    expect(screen.getByText("Duty Declared")).toBeInTheDocument();
    expect(screen.getByText("Duty Owed")).toBeInTheDocument();
  });

  it("renders unmatched banner with link to filtered transactions", () => {
    mockLoadedDashboard();
    render(<ViewDashboard />);
    expect(screen.getByText(/2 unmatched transaction/i)).toBeInTheDocument();
    const link = screen.getByText("View →").closest("a");
    expect(link?.getAttribute("href")).toBe("/transactions?status=unmatched");
  });

  it("hides unmatched banner when count is zero", () => {
    mockLoadedDashboard({ ...mockStats, unmatchedTransactionsCount: 0 });
    render(<ViewDashboard />);
    expect(screen.queryByText(/unmatched transaction/i)).not.toBeInTheDocument();
  });

  it("top product links to /products/:id", () => {
    mockLoadedDashboard();
    render(<ViewDashboard />);
    const productLink = screen.getByText("Espresso beans 1kg").closest("a");
    expect(productLink?.getAttribute("href")).toBe("/products/P-011");
  });

  it("open findings KPI links to /findings", () => {
    mockLoadedDashboard();
    render(<ViewDashboard />);
    const findingsLink = screen.getByText("50").closest("a");
    expect(findingsLink?.getAttribute("href")).toBe("/findings");
  });

  it("renders exposure by rule section from findings", () => {
    mockLoadedDashboard();
    render(<ViewDashboard />);
    expect(screen.getByText(/Exposure by Rule/i)).toBeInTheDocument();
    expect(screen.getByText(/R1 — Asian flat/i)).toBeInTheDocument();
  });

  it("renders top brokers and ports sections", () => {
    mockLoadedDashboard();
    render(<ViewDashboard />);
    expect(screen.getByText(/Top Brokers by Exposure/i)).toBeInTheDocument();
    expect(screen.getByText(/Top Ports by Exposure/i)).toBeInTheDocument();
    expect(screen.getByText("Beacon Trade Group")).toBeInTheDocument();
    expect(screen.getByText("Long Beach")).toBeInTheDocument();
  });
});
