import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useDashboard } from "./use-dashboard";
import type { IDashboardStats } from "@/app/types/api";

vi.mock("@/app/services/http/rest", () => ({
  restClient: { get: vi.fn() },
}));

import { restClient } from "@/app/services/http/rest";
const mockGet = vi.mocked(restClient.get);

const mockStats: IDashboardStats = {
  totalExposure: 2028.5,
  totalDutyDeclared: 1952,
  totalDutyComputed: 3980.5,
  openFindingsCount: 50,
  unmatchedTransactionsCount: 2,
  topOffenders: {
    byBroker: [{ name: "Broker A", totalExposure: 1000 }],
    byPort: [{ name: "LA", totalExposure: 500 }],
    byProduct: [{ id: "P-001", name: "Widget", totalExposure: 441 }],
  },
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useDashboard", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("returns dashboard stats on success", async () => {
    mockGet.mockResolvedValue({ data: mockStats });

    const { result } = renderHook(() => useDashboard(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data.totalExposure).toBe(2028.5);
    expect(result.current.data?.data.openFindingsCount).toBe(50);
    expect(mockGet).toHaveBeenCalledWith("/dashboard/stats");
  });

  it("is loading initially", () => {
    mockGet.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useDashboard(), {
      wrapper: makeWrapper(),
    });
    expect(result.current.isLoading).toBe(true);
  });

  it("returns error state on failure", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));
    const { result } = renderHook(() => useDashboard(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
