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

function mockUpdate(overrides: Record<string, unknown> = {}) {
  mockUseUpdate.mockReturnValue({
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
    ...overrides,
  } as unknown as ReturnType<typeof useUpdateProduct>);
}

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

function mockLoaded(detail: IProductDetail = mockDetail) {
  mockUseDetail.mockReturnValue({
    isLoading: false,
    isError: false,
    data: { data: detail },
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useProductDetail>);
}

describe("ViewProductDetail", () => {
  beforeEach(() => {
    mockUseDetail.mockReset();
    mockUseUpdate.mockReset();
    mockUpdate();
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
    mockUseDetail.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch: vi.fn(),
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

  it("renders view-mode header with Edit product", () => {
    mockLoaded();
    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText("Espresso beans 1kg")).toBeInTheDocument();
    expect(screen.getByText(/1 open finding/i)).toBeInTheDocument();
    expect(screen.getByText(/consumable · P-011/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /edit product/i }),
    ).toBeInTheDocument();
  });

  it("shows read-only Classification with total exposure", () => {
    mockLoaded();
    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText("Classification")).toBeInTheDocument();
    expect(screen.getByText("Import Code")).toBeInTheDocument();
    expect(screen.getByText("0901.21.00")).toBeInTheDocument();
    expect(screen.getByText("Total Exposure")).toBeInTheDocument();
    expect(screen.getAllByText("$216.00").length).toBeGreaterThan(0);
    expect(screen.queryByDisplayValue("0901.21.00")).not.toBeInTheDocument();
  });

  it("enters edit mode with Save changes and editable fields", () => {
    mockLoaded();
    render(<ViewProductDetail id="P-011" />);
    fireEvent.click(screen.getByRole("button", { name: /edit product/i }));
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("0901.21.00")).toBeInTheDocument();
    expect(screen.getByText(/re-evaluate the checker/i)).toBeInTheDocument();
  });

  it("disables Save and shows Saving… while mutation is pending", () => {
    mockLoaded();
    mockUpdate({ isPending: true });
    render(<ViewProductDetail id="P-011" />);
    fireEvent.click(screen.getByRole("button", { name: /edit product/i }));
    const save = screen.getByRole("button", { name: /saving/i });
    expect(save).toBeDisabled();
    expect(save).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("button", { name: /cancel/i })).toBeDisabled();
  });

  it("cancels edit mode without keeping the form open", () => {
    mockLoaded();
    render(<ViewProductDetail id="P-011" />);
    fireEvent.click(screen.getByRole("button", { name: /edit product/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(
      screen.getByRole("button", { name: /edit product/i }),
    ).toBeInTheDocument();
    expect(screen.queryByDisplayValue("0901.21.00")).not.toBeInTheDocument();
  });

  it("keeps findings and linked transactions visible in edit mode", () => {
    mockLoaded();
    render(<ViewProductDetail id="P-011" />);
    fireEvent.click(screen.getByRole("button", { name: /edit product/i }));
    expect(screen.getByText("R3")).toBeInTheDocument();
    expect(screen.getByText("EuroTrade")).toBeInTheDocument();
    expect(screen.getByText("Miami")).toBeInTheDocument();
  });

  it("renders finding TX link and gap", () => {
    mockLoaded();
    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText("+$216.00")).toBeInTheDocument();
    const txLinks = screen.getAllByRole("link", { name: "TX-00011" });
    expect(txLinks[0]).toHaveAttribute("href", "/transactions/TX-00011");
  });

  it("shows empty message when product has no findings", () => {
    mockLoaded({ ...mockDetail, findings: [] });
    render(<ViewProductDetail id="P-011" />);
    expect(screen.getByText(/no findings for this product/i)).toBeInTheDocument();
  });

  it("shows empty message when product has no linked transactions", () => {
    mockLoaded({ ...mockDetail, transactions: [] });
    render(<ViewProductDetail id="P-011" />);
    expect(
      screen.getByText(/no transactions linked to this product/i),
    ).toBeInTheDocument();
  });
});
