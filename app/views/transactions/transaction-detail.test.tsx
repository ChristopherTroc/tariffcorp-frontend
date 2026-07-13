import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewTransactionDetail } from "./transaction-detail";
import type { ITransactionDetail } from "@/app/types/api";

vi.mock("@/app/hooks/use-transactions");
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useTransactionDetail } from "@/app/hooks/use-transactions";
const mockUseDetail = vi.mocked(useTransactionDetail);

const matchedDetail: ITransactionDetail = {
  transaction: {
    id: "TX-00001",
    date: "2026-01-04T00:00:00.000Z",
    importer: "Acme Imports LLC",
    broker: "GlobalTrade Brokers",
    portOfEntry: "Los Angeles",
    importCode: "8471.30.01",
    countryOfOrigin: "CN",
    units: 25,
    unitValue: 120,
    totalValue: 3000,
    dutyDeclared: 0,
    productId: "P-001",
  },
  product: {
    id: "P-001",
    name: "Wireless keyboard",
    type: "electronics",
    importCode: "8471.30.01",
    countryOfOrigin: "CN",
    value: 120,
    weight: 0.6,
    unit: "kg",
  },
  finding: {
    id: "f-1",
    ruleId: "R1",
    ruleName: "Asian flat tariff",
    dutyComputed: 100,
    exposure: 100,
    transactionId: "TX-00001",
    productId: "P-001",
  },
};

describe("ViewTransactionDetail", () => {
  beforeEach(() => mockUseDetail.mockReset());

  it("renders skeleton while loading", () => {
    mockUseDetail.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionDetail>);

    const { container } = render(<ViewTransactionDetail id="TX-00001" />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders error state with retry button on failure", () => {
    const mockRefetch = vi.fn();
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useTransactionDetail>);

    render(<ViewTransactionDetail id="TX-00001" />);
    expect(screen.getByText(/failed to load transaction/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/try again/i));
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when data is missing", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionDetail>);

    render(<ViewTransactionDetail id="TX-99999" />);
    expect(screen.getByText(/transaction not found/i)).toBeInTheDocument();
  });

  it("renders transaction fields, product and finding for matched transaction", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: matchedDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionDetail>);

    render(<ViewTransactionDetail id="TX-00001" />);
    expect(screen.getAllByText("TX-00001").length).toBeGreaterThan(0);
    expect(screen.getByText("Wireless keyboard")).toBeInTheDocument();
    expect(screen.getByText(/Asian flat tariff/i)).toBeInTheDocument();
    expect(screen.getByText("R1")).toBeInTheDocument();
  });

  it("shows amber callout for unmatched transaction", () => {
    const unmatched: ITransactionDetail = {
      ...matchedDetail,
      transaction: { ...matchedDetail.transaction, productId: null },
      product: null,
      finding: null,
    };
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: unmatched },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionDetail>);

    render(<ViewTransactionDetail id="TX-00043" />);
    expect(screen.getByText(/not linked to any product/i)).toBeInTheDocument();
  });

  it("shows muted text when no finding computed", () => {
    const noFinding: ITransactionDetail = { ...matchedDetail, finding: null };
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: noFinding },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionDetail>);

    render(<ViewTransactionDetail id="TX-00001" />);
    expect(screen.getByText(/no finding computed/i)).toBeInTheDocument();
  });

  it("positive exposure is styled with destructive color", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: matchedDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionDetail>);

    render(<ViewTransactionDetail id="TX-00001" />);
    const exposureEl = screen.getByText("+$100.00");
    expect(exposureEl.className).toContain("text-destructive");
  });

  it("product detail link points to /products/:id", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: matchedDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionDetail>);

    render(<ViewTransactionDetail id="TX-00001" />);
    const link = screen.getByText(/view product detail/i).closest("a");
    expect(link?.getAttribute("href")).toBe("/products/P-001");
  });

  it("shows no product section text when product is null but transaction is matched by finding", () => {
    const noProduct: ITransactionDetail = { ...matchedDetail, product: null };
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: noProduct },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useTransactionDetail>);

    render(<ViewTransactionDetail id="TX-00001" />);
    expect(screen.getByText(/no product linked to this transaction/i)).toBeInTheDocument();
  });
});
