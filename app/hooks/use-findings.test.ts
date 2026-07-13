import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useFindings } from "./use-findings";
import type { IFinding } from "@/app/types/api";

vi.mock("@/app/services/http/rest", () => ({
  restClient: { get: vi.fn() },
}));

import { restClient } from "@/app/services/http/rest";
const mockGet = vi.mocked(restClient.get);

const mockFinding: IFinding = {
  id: "f-1",
  ruleId: "R3",
  ruleName: "EU consumables high-value duty",
  dutyComputed: 384,
  exposure: 384,
  transactionId: "TX-00011",
  productId: "P-011",
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("useFindings", () => {
  beforeEach(() => mockGet.mockReset());

  it("fetches findings list", async () => {
    mockGet.mockResolvedValue({
      data: [mockFinding],
      meta: { total: 1, page: 1, per_page: 50, total_pages: 1 },
    });

    const { result } = renderHook(() => useFindings(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0].ruleId).toBe("R3");
    expect(result.current.data?.data[0].exposure).toBe(384);
  });

  it("passes pagination filters", async () => {
    mockGet.mockResolvedValue({ data: [], meta: { total: 0, page: 2, per_page: 50, total_pages: 0 } });

    const { result } = renderHook(() => useFindings({ page: 2, per_page: 50 }), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockGet).toHaveBeenCalledWith("/findings", {
      params: { page: 2, per_page: 50 },
    });
  });
});
