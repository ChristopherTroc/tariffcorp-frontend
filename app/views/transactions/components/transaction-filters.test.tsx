import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  TransactionFilters,
  TransactionSearch,
} from "./transaction-filters";

const mockPush = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => searchParams,
}));

describe("TransactionFilters", () => {
  beforeEach(() => {
    mockPush.mockReset();
    searchParams = new URLSearchParams();
  });

  it("renders All, Matched, and Unmatched status buttons", () => {
    render(<TransactionFilters />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Matched")).toBeInTheDocument();
    expect(screen.getByText("Unmatched")).toBeInTheDocument();
  });

  it("does not render broker or port text inputs", () => {
    render(<TransactionFilters />);
    expect(
      screen.queryByPlaceholderText(/filter by broker/i),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/filter by port/i),
    ).not.toBeInTheDocument();
  });

  it("clicking Matched pushes status=matched to router", () => {
    render(<TransactionFilters />);
    fireEvent.click(screen.getByText("Matched"));
    expect(mockPush).toHaveBeenCalledWith("/transactions?status=matched");
  });

  it("clicking Unmatched pushes status=unmatched to router", () => {
    render(<TransactionFilters />);
    fireEvent.click(screen.getByText("Unmatched"));
    expect(mockPush).toHaveBeenCalledWith("/transactions?status=unmatched");
  });

  it("clicking All pushes URL without status param", () => {
    render(<TransactionFilters />);
    fireEvent.click(screen.getByText("All"));
    expect(mockPush).toHaveBeenCalledWith("/transactions?");
  });
});

describe("TransactionSearch", () => {
  beforeEach(() => {
    mockPush.mockReset();
    searchParams = new URLSearchParams();
  });

  it("debounces q param updates", async () => {
    vi.useFakeTimers();
    render(<TransactionSearch />);
    const input = screen.getByPlaceholderText(/search id, importer, broker/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "TX-00001" } });
      vi.advanceTimersByTime(250);
    });
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("q=TX-00001"),
    );
    vi.useRealTimers();
  });

  it("seeds the input from broker deep-link when q is absent", () => {
    searchParams = new URLSearchParams("broker=Beacon+Trade+Group");
    render(<TransactionSearch />);
    expect(
      screen.getByPlaceholderText(/search id, importer, broker/i),
    ).toHaveValue("Beacon Trade Group");
  });

  it("clears broker and port filters when search is cleared", async () => {
    vi.useFakeTimers();
    searchParams = new URLSearchParams(
      "broker=Beacon+Trade+Group&q=Beacon+Trade+Group",
    );
    render(<TransactionSearch />);
    const input = screen.getByPlaceholderText(/search id, importer, broker/i);
    await act(async () => {
      fireEvent.change(input, { target: { value: "" } });
      vi.advanceTimersByTime(250);
    });
    expect(mockPush).toHaveBeenCalledWith("/transactions?");
    vi.useRealTimers();
  });
});
