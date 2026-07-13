import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewProductDetail } from "./product-detail";
import type { IProductDetail } from "@/app/types/api";

vi.mock("@/app/hooks/use-products");
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
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

  it("renders skeleton while loading", () => {
    mockUseDetail.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    const { container } = render(<ViewProductDetail id="P-011" />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("renders error state with retry button on failure", () => {
    const mockRefetch = vi.fn();
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: mockRefetch,
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText(/failed to load product/i)).toBeInTheDocument();
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
  });

  it("renders empty state when data is missing", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-999" />);
    expect(screen.getByText(/product not found/i)).toBeInTheDocument();
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
  });

  it("opens edit form when Edit Product button is clicked", () => {
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

  it("cancel button closes the edit form", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    fireEvent.click(screen.getByText("Edit Product"));
    expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancel"));
    expect(screen.queryByText(/Save Changes/i)).not.toBeInTheDocument();
  });

  it("renders finding with rule badge and exposure value", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText("R3")).toBeInTheDocument();
    expect(screen.getByText("+$216.00")).toBeInTheDocument();
  });

  it("renders linked transaction row with broker and port", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: mockDetail },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText("EuroTrade")).toBeInTheDocument();
    expect(screen.getByText("Miami")).toBeInTheDocument();
  });

  it("shows empty message when product has no findings", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: { ...mockDetail, findings: [] } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText(/no findings for this product/i)).toBeInTheDocument();
  });

  it("shows empty message when product has no linked transactions", () => {
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: false,
      data: { data: { ...mockDetail, transactions: [] } },
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useProductDetail>);

    render(<ViewProductDetail id="P-011" />);
    expect(
      screen.getByText(/no transactions linked to this product/i),
    ).toBeInTheDocument();
  });
});
