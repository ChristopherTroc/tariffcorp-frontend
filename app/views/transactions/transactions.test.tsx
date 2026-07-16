import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewTransactions } from "./transactions";
import type { ITransaction } from "@/app/types/api";

const mockPush = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("@/app/hooks/use-transactions");
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: mockPush }),
}));
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { useTransactions } from "@/app/hooks/use-transactions";
const mockUseTransactions = vi.mocked(useTransactions);

const rows: ITransaction[] = [
  {
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
  {
    id: "TX-00043",
    date: "2026-01-05T00:00:00.000Z",
    importer: "Other Co",
    broker: "Beacon Trade Group",
    portOfEntry: "Seattle",
    importCode: "1234.56.78",
    countryOfOrigin: "RU",
    units: 10,
    unitValue: 50,
    totalValue: 500,
    dutyDeclared: 10,
    productId: null,
  },
];

function mockList(data = rows) {
  mockUseTransactions.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      data,
      meta: { total: 30, page: 1, per_page: 10, total_pages: 3 },
    },
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useTransactions>);
}

describe("ViewTransactions", () => {
  beforeEach(() => {
    mockUseTransactions.mockReset();
    mockPush.mockReset();
    searchParams = new URLSearchParams();
  });

  it("renders header with total count", () => {
    mockList();
    render(<ViewTransactions />);
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText(/All declared import events — 30 total/i)).toBeInTheDocument();
  });

  it("shows Finding placeholder when exposure is unavailable", () => {
    mockList();
    render(<ViewTransactions />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("shows finding exposure when provided", () => {
    mockList([{ ...rows[0], findingExposure: 100 }]);
    render(<ViewTransactions />);
    expect(screen.getByText("+$100.00")).toBeInTheDocument();
  });

  it("emphasizes unmatched rows", () => {
    mockList();
    render(<ViewTransactions />);
    // Status tab + row badge
    expect(screen.getAllByText("Unmatched").length).toBeGreaterThan(1);
  });

  it("navigates to detail on row click", () => {
    mockList();
    render(<ViewTransactions />);
    fireEvent.click(screen.getByText("TX-00001"));
    expect(mockPush).toHaveBeenCalledWith("/transactions/TX-00001");
  });

  it("filters current page rows by search query", () => {
    searchParams = new URLSearchParams("q=Beacon");
    mockList();
    render(<ViewTransactions />);
    expect(screen.getByText("TX-00043")).toBeInTheDocument();
    expect(screen.queryByText("TX-00001")).not.toBeInTheDocument();
  });

  it("renders error state with retry", () => {
    const refetch = vi.fn();
    mockUseTransactions.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch,
    } as unknown as ReturnType<typeof useTransactions>);
    render(<ViewTransactions />);
    expect(screen.getByText(/failed to load transactions/i)).toBeInTheDocument();
  });
});
