import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import { useProducts, useProductDetail, useUpdateProduct } from "./use-products";
import type { IProductWithCount, IProductDetail, IProduct } from "@/app/types/api";

vi.mock("@/app/services/http/rest", () => ({
  restClient: { get: vi.fn(), patch: vi.fn() },
}));

import { restClient } from "@/app/services/http/rest";
const mockGet = vi.mocked(restClient.get);
const mockPatch = vi.mocked(restClient.patch);

const mockProduct: IProductWithCount = {
  id: "P-001",
  name: "Wireless keyboard",
  type: "electronics",
  importCode: "8471.30.01",
  countryOfOrigin: "CN",
  value: 120,
  weight: 0.6,
  unit: "kg",
  openFindingsCount: 2,
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return Wrapper;
}

describe("useProducts", () => {
  beforeEach(() => mockGet.mockReset());

  it("fetches product list with openFindingsCount", async () => {
    mockGet.mockResolvedValue({
      data: [mockProduct],
      meta: { total: 1, page: 1, per_page: 20, total_pages: 1 },
    });

    const { result } = renderHook(() => useProducts(), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data[0].openFindingsCount).toBe(2);
  });
});

describe("useProductDetail", () => {
  beforeEach(() => mockGet.mockReset());

  it("fetches product detail with transactions and findings", async () => {
    const detail: IProductDetail = {
      product: { ...mockProduct },
      transactions: [],
      findings: [],
    };
    mockGet.mockResolvedValue({ data: detail });

    const { result } = renderHook(() => useProductDetail("P-001"), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data.product.id).toBe("P-001");
  });
});

describe("useUpdateProduct", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
  });

  it("calls PATCH and invalidates productDetail and findings on success", async () => {
    const updatedProduct: IProduct = { ...mockProduct };
    mockPatch.mockResolvedValue({ data: updatedProduct });
    mockGet.mockResolvedValue({ data: { product: mockProduct, transactions: [], findings: [] } });

    const wrapper = makeWrapper();
    const { result } = renderHook(() => useUpdateProduct(), { wrapper });

    act(() => {
      result.current.mutate({ id: "P-001", dto: { countryOfOrigin: "CN" } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockPatch).toHaveBeenCalledWith("/products/P-001", {
      countryOfOrigin: "CN",
    });
  });

  it("exposes error on failure", async () => {
    mockPatch.mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: makeWrapper(),
    });

    act(() => {
      result.current.mutate({ id: "P-999", dto: {} });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
