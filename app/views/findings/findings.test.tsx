import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewFindings } from "./findings";
import type { IFinding } from "@/app/types/api";

vi.mock("@/app/hooks/use-findings");
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

import { useFindings } from "@/app/hooks/use-findings";
const mockUseFindings = vi.mocked(useFindings);

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

describe("ViewFindings", () => {
  beforeEach(() => mockUseFindings.mockReset());

  it("renders findings with rule badges and exposure", () => {
    mockUseFindings.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: mockFindings,
        meta: { total: 2, page: 1, per_page: 50, total_pages: 1 },
      },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFindings>);

    render(<ViewFindings />);
    expect(screen.getByText("R3")).toBeInTheDocument();
    expect(screen.getByText("R1")).toBeInTheDocument();
    expect(screen.getByText("+$384.00")).toBeInTheDocument();
    expect(screen.getByText("+$100.00")).toBeInTheDocument();
  });

  it("positive exposure has destructive text class", () => {
    mockUseFindings.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: mockFindings,
        meta: { total: 2, page: 1, per_page: 50, total_pages: 1 },
      },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFindings>);

    render(<ViewFindings />);
    const exposure = screen.getAllByText("+$384.00")[0];
    expect(exposure.className).toContain("text-destructive");
  });

  it('"Fix Product →" links to /products/:id', () => {
    mockUseFindings.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: mockFindings,
        meta: { total: 2, page: 1, per_page: 50, total_pages: 1 },
      },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFindings>);

    render(<ViewFindings />);
    const fixLinks = screen.getAllByText("Fix Product →");
    expect(fixLinks[0].closest("a")?.getAttribute("href")).toBe(
      "/products/P-011",
    );
  });

  it("transaction IDs link to /transactions/:id", () => {
    mockUseFindings.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: mockFindings,
        meta: { total: 2, page: 1, per_page: 50, total_pages: 1 },
      },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFindings>);

    render(<ViewFindings />);
    const txLink = screen.getByText("TX-00011").closest("a");
    expect(txLink?.getAttribute("href")).toBe("/transactions/TX-00011");
  });

  it("shows empty state when no findings", () => {
    mockUseFindings.mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        data: [],
        meta: { total: 0, page: 1, per_page: 50, total_pages: 0 },
      },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useFindings>);

    render(<ViewFindings />);
    expect(screen.getByText(/no findings yet/i)).toBeInTheDocument();
  });
});
