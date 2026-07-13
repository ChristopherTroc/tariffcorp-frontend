import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TransactionFilters } from "./transaction-filters";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

describe("TransactionFilters", () => {
  beforeEach(() => mockPush.mockReset());

  it("renders All, Matched, and Unmatched status buttons", () => {
    render(<TransactionFilters />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Matched")).toBeInTheDocument();
    expect(screen.getByText("Unmatched")).toBeInTheDocument();
  });

  it("renders broker and port text inputs", () => {
    render(<TransactionFilters />);
    expect(screen.getByPlaceholderText(/filter by broker/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/filter by port/i)).toBeInTheDocument();
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

  it("active status button reflects current searchParams", () => {
    vi.doMock("next/navigation", () => ({
      useRouter: () => ({ push: mockPush }),
      useSearchParams: () => new URLSearchParams("status=unmatched"),
    }));
  });

  it("pre-fills broker input from searchParams", () => {
    vi.doMock("next/navigation", () => ({
      useRouter: () => ({ push: mockPush }),
      useSearchParams: () => new URLSearchParams("broker=EuroTrade"),
    }));
  });

  it("broker input onChange triggers router push after debounce", async () => {
    vi.useFakeTimers();
    render(<TransactionFilters />);

    const brokerInput = screen.getByPlaceholderText(/filter by broker/i);
    await act(async () => {
      fireEvent.change(brokerInput, { target: { value: "Acme" } });
      vi.advanceTimersByTime(300);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("broker=Acme"));
    vi.useRealTimers();
  });

  it("port input onChange triggers router push after debounce", async () => {
    vi.useFakeTimers();
    render(<TransactionFilters />);

    const portInput = screen.getByPlaceholderText(/filter by port/i);
    await act(async () => {
      fireEvent.change(portInput, { target: { value: "Miami" } });
      vi.advanceTimersByTime(300);
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("port_of_entry=Miami"));
    vi.useRealTimers();
  });

  it("port input onChange does not push before debounce delay elapses", async () => {
    vi.useFakeTimers();
    render(<TransactionFilters />);

    const portInput = screen.getByPlaceholderText(/filter by port/i);
    await act(async () => {
      fireEvent.change(portInput, { target: { value: "LA" } });
      vi.advanceTimersByTime(100); // before the 300ms debounce
    });

    expect(mockPush).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
