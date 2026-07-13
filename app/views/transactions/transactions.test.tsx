import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ViewTransactionDetail } from "./transaction-detail";
import type { ITransactionDetail } from "@/app/types/api";

vi.mock("@/app/hooks/use-transactions");
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
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
    const noFinding: ITransactionDetail = {
      ...matchedDetail,
      finding: null,
    };
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
});
