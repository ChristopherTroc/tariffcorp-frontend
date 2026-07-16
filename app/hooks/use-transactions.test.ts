import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useTransactions, useTransactionDetail } from "./use-transactions";
import type { ITransaction, ITransactionDetail } from "@/app/types/api";

vi.mock("@/app/services/http/rest", () => ({
  restClient: { get: vi.fn() },
}));

import { restClient } from "@/app/services/http/rest";
const mockGet = vi.mocked(restClient.get);

const mockTransaction: ITransaction = {
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
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe("useTransactions", () => {
  beforeEach(() => mockGet.mockReset());

  it("fetches paginated transaction list", async () => {
    mockGet.mockResolvedValue({
      data: [mockTransaction],
      meta: { total: 1, page: 1, per_page: 20, total_pages: 1 },
    });

    const { result } = renderHook(() => useTransactions(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].id).toBe("TX-00001");
  });

  it("passes filters as params", async () => {
    mockGet.mockResolvedValue({ data: [], meta: { total: 0, page: 1, per_page: 20, total_pages: 0 } });

    const { result } = renderHook(
      () => useTransactions({ status: "unmatched", page: 2 }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith("/transactions", {
      params: { status: "unmatched", page: 2 },
    });
  });
});

describe("useTransactionDetail", () => {
  beforeEach(() => mockGet.mockReset());

  it("fetches transaction detail with product and finding", async () => {
    const detail: ITransactionDetail = {
      transaction: mockTransaction,
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
    mockGet.mockResolvedValue({ data: detail });

    const { result } = renderHook(() => useTransactionDetail("TX-00001"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.finding?.ruleId).toBe("R1");
    expect(result.current.data?.data.product?.name).toBe("Wireless keyboard");
  });

  it("is disabled when id is empty", () => {
    const { result } = renderHook(() => useTransactionDetail(""), {
      wrapper: makeWrapper(),
    });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
