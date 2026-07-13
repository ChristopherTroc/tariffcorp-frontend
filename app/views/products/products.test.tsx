import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ViewProductDetail } from "./product-detail";
import type { IProductDetail } from "@/app/types/api";

vi.mock("@/app/hooks/use-products");
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn() }),
}));

import { useProductDetail, useUpdateProduct } from "@/app/hooks/use-products";
const mockUseDetail = vi.mocked(useProductDetail);
const mockUseUpdate = vi.mocked(useUpdateProduct);

const mockDetail: IProductDetail = {
  product: {
    id: "P-011",
    name: "Espresso beans 1kg",
    type: "consumable",
    importCode: "0901.21.00",
    countryOfOrigin: "IT",
    value: 24,
    weight: 1,
    unit: "kg",
  },
  transactions: [
    {
      id: "TX-00011",
      date: "2026-02-15T00:00:00.000Z",
      importer: "CafeImports LLC",
      broker: "EuroTrade",
      portOfEntry: "Miami",
      importCode: "0901.21.00",
      countryOfOrigin: "IT",
      units: 60,
      unitValue: 24,
      totalValue: 1440,
      dutyDeclared: 0,
      productId: "P-011",
    },
  ],
  findings: [
    {
      id: "f-11",
      ruleId: "R3",
      ruleName: "EU consumables high-value duty",
      dutyComputed: 216,
      exposure: 216,
      transactionId: "TX-00011",
      productId: "P-011",
    },
  ],
};

describe("ViewProductDetail", () => {
  beforeEach(() => {
    mockUseDetail.mockReset();
    mockUseUpdate.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      isSuccess: false,
    } as unknown as ReturnType<typeof useUpdateProduct>);
  });

  it("renders product fields", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    expect(screen.getAllByText("Espresso beans 1kg").length).toBeGreaterThan(0);
    expect(screen.getAllByText("0901.21.00").length).toBeGreaterThan(0);
    expect(screen.getByText("R3")).toBeInTheDocument();
  });

  it("opens edit form when Edit Product clicked", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    fireEvent.click(screen.getByText("Edit Product"));
    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
  });

  it("shows correction callout when edit form is open", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    fireEvent.click(screen.getByText("Edit Product"));
    expect(screen.getByText(/re-evaluate the checker/i)).toBeInTheDocument();
  });

  it("shows findings ordered by exposure with exposure value", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText("+$216.00")).toBeInTheDocument();
  });
});
