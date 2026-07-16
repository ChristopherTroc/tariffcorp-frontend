import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewProducts } from "./products";
import type { IProductWithCount } from "@/app/types/api";

const mockPush = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("@/app/hooks/use-products");
vi.mock("next/navigation", () => ({
  useSearchParams: () => searchParams,
  useRouter: () => ({ push: mockPush }),
}));

import { useProducts } from "@/app/hooks/use-products";
const mockUseProducts = vi.mocked(useProducts);

const rows: IProductWithCount[] = [
  {
    id: "P-001",
    name: "Wireless keyboard",
    type: "electronics",
    importCode: "8471.30.01",
    countryOfOrigin: "CN",
    value: 120,
    weight: 0.6,
    unit: "kg",
    openFindingsCount: 0,
  },
  {
    id: "P-011",
    name: "Espresso beans 1kg",
    type: "consumable",
    importCode: "0901.21.00",
    countryOfOrigin: "IT",
    value: 24,
    weight: 1,
    unit: "kg",
    openFindingsCount: 2,
  },
];

function mockList(data = rows) {
  mockUseProducts.mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      data,
      meta: { total: 42, page: 1, per_page: 10, total_pages: 5 },
    },
    refetch: vi.fn(),
  } as unknown as ReturnType<typeof useProducts>);
}

describe("ViewProducts", () => {
  beforeEach(() => {
    mockUseProducts.mockReset();
    mockPush.mockReset();
    searchParams = new URLSearchParams();
  });

  it("renders header with SKU total", () => {
    mockList();
    render(<ViewProducts />);
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText(/Master catalog — 42 SKUs/i)).toBeInTheDocument();
  });

  it("renders type chips including With findings", () => {
    mockList();
    render(<ViewProducts />);
    expect(screen.getByRole("button", { name: "All types" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apparel" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "With findings" }),
    ).toBeInTheDocument();
  });

  it("keeps type and With findings chips active together", () => {
    searchParams = new URLSearchParams("type=electronics&has_findings=true");
    mockList();
    render(<ViewProducts />);

    const electronics = screen.getByRole("button", { name: "Electronics" });
    const withFindings = screen.getByRole("button", { name: "With findings" });
    const allTypes = screen.getByRole("button", { name: "All types" });
    expect(electronics.className).toContain("bg-primary/10");
    expect(withFindings.className).toContain("bg-destructive/10");
    expect(allTypes.className).not.toContain("bg-primary/10");
  });

  it("preserves has_findings when selecting a type", () => {
    searchParams = new URLSearchParams("has_findings=true");
    mockList();
    render(<ViewProducts />);
    fireEvent.click(screen.getByRole("button", { name: "Consumable" }));
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/type=consumable/),
    );
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringMatching(/has_findings=true/),
    );
  });

  it("shows open findings count without inventing exposure dollars", () => {
    mockList();
    render(<ViewProducts />);
    expect(screen.getByText("[2]")).toBeInTheDocument();
    expect(screen.queryByText(/\+\$/)).toBeNull();
  });

  it("shows em dash when product has no open findings", () => {
    mockList([rows[0]]);
    render(<ViewProducts />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("navigates to detail on row click", () => {
    mockList();
    render(<ViewProducts />);
    fireEvent.click(screen.getByText("P-001"));
    expect(mockPush).toHaveBeenCalledWith("/products/P-001");
  });

  it("filters current page rows by search query", () => {
    searchParams = new URLSearchParams("q=Espresso");
    mockList();
    render(<ViewProducts />);
    expect(screen.getByText("P-011")).toBeInTheDocument();
    expect(screen.queryByText("P-001")).not.toBeInTheDocument();
  });

  it("renders error state with retry", () => {
    const refetch = vi.fn();
    mockUseProducts.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch,
    } as unknown as ReturnType<typeof useProducts>);

    render(<ViewProducts />);
    expect(screen.getByText(/failed to load products/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/try again/i));
    expect(refetch).toHaveBeenCalled();
  });
});
