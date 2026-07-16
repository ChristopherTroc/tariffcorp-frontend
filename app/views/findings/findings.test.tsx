import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewFindings } from "./findings";
import type { IFinding } from "@/app/types/api";

const mockPush = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("@/app/hooks/use-findings");
vi.mock("@/app/hooks/use-dashboard");
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: mockPush }),
}));

import { useFindings } from "@/app/hooks/use-findings";
import { useDashboard } from "@/app/hooks/use-dashboard";
const mockUseFindings = vi.mocked(useFindings);
const mockUseDashboard = vi.mocked(useDashboard);

const mockFindings: IFinding[] = [
  {
    id: "f-1",
    ruleId: "R3",
    ruleName: "EU consumables high-value duty",
    dutyComputed: 384,
    exposure: 384,
    transactionId: "TX-00011",
    productId: "P-011",
  },
  {
    id: "f-2",
    ruleId: "R1",
    ruleName: "Asian flat tariff",
    dutyComputed: 100,
    exposure: 100,
    transactionId: "TX-00001",
    productId: "P-001",
  },
];

function mockList(data = mockFindings) {
  mockUseFindings.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      data,
      meta: { total: data.length, page: 1, per_page: 10, total_pages: 1 },
    },
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useFindings>);
}

describe("ViewFindings", () => {
  beforeEach(() => {
    mockUseFindings.mockReset();
    mockUseDashboard.mockReset();
    mockPush.mockReset();
    searchParams = new URLSearchParams();
    mockUseDashboard.mockReturnValue({
      data: { data: { totalExposure: 4023 } },
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useDashboard>);
  });

  it("renders header with Total Exposure from dashboard", () => {
    mockList();
    render(<ViewFindings />);
    expect(screen.getByText("Findings")).toBeInTheDocument();
    expect(screen.getByText(/All checker discrepancies/i)).toBeInTheDocument();
    expect(screen.getByText("Total Exposure")).toBeInTheDocument();
    expect(screen.getByText("$4,023.00")).toBeInTheDocument();
  });

  it("renders All rules / R1 / R2 / R3 chips", () => {
    mockList();
    render(<ViewFindings />);
    expect(screen.getByRole("button", { name: "All rules" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "R1" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "R2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "R3" })).toBeInTheDocument();
  });

  it("filters current page rows by rule query param", () => {
    searchParams = new URLSearchParams("rule=R1");
    mockList();
    render(<ViewFindings />);
    expect(screen.getByText("TX-00001")).toBeInTheDocument();
    expect(screen.queryByText("TX-00011")).not.toBeInTheDocument();
  });

  it("sets rule in URL when chip clicked", () => {
    mockList();
    render(<ViewFindings />);
    fireEvent.click(screen.getByRole("button", { name: "R2" }));
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/rule=R2/));
  });

  it("renders findings with rule badges and exposure", () => {
    mockList();
    render(<ViewFindings />);
    expect(screen.getAllByText("R3").length).toBeGreaterThan(0);
    expect(screen.getByText("+$384.00")).toBeInTheDocument();
    expect(screen.getByText("+$100.00")).toBeInTheDocument();
    expect(screen.getByText("EU consumables high-value duty")).toBeInTheDocument();
  });

  it("positive exposure has destructive text class", () => {
    mockList();
    render(<ViewFindings />);
    const exposure = screen.getAllByText("+$384.00")[0];
    expect(exposure.className).toContain("text-destructive");
  });

  it("Fix Product links to /products/:id", () => {
    mockList();
    render(<ViewFindings />);
    const fixLinks = screen.getAllByText("Fix Product");
    expect(fixLinks[0].closest("a")?.getAttribute("href")).toBe(
      "/products/P-011",
    );
  });

  it("product id links to /products/:id", () => {
    mockList();
    render(<ViewFindings />);
    const productLinks = screen.getAllByRole("link", { name: "P-011" });
    expect(productLinks[0]).toHaveAttribute("href", "/products/P-011");
  });

  it("transaction IDs link to /transactions/:id", () => {
    mockList();
    render(<ViewFindings />);
    expect(screen.getByText("TX-00011").closest("a")).toHaveAttribute(
      "href",
      "/transactions/TX-00011",
    );
  });

  it("calls retry when error state button is clicked", () => {
    const mockRefetch = vi.fn();
    mockUseFindings.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useFindings>);

    render(<ViewFindings />);
    fireEvent.click(screen.getByText("Try again"));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("shows skeleton when loading", () => {
    mockUseFindings.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFindings>);

    const { container } = render(<ViewFindings />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows empty state when no findings", () => {
    mockList([]);
    render(<ViewFindings />);
    expect(screen.getByText(/no findings yet/i)).toBeInTheDocument();
  });

  it("shows No product when productId is null", () => {
    mockList([
      {
        ...mockFindings[0],
        productId: null,
      },
    ]);
    render(<ViewFindings />);
    expect(screen.getByText(/no product/i)).toBeInTheDocument();
  });
});
