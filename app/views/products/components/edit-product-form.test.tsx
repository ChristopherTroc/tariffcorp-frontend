import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EditProductForm } from "./edit-product-form";
import type { IProduct } from "@/app/types/api";

vi.mock("@/app/hooks/use-products");

import { useUpdateProduct } from "@/app/hooks/use-products";
const mockUseUpdate = vi.mocked(useUpdateProduct);

const mockProduct: IProduct = {
  id: "P-001",
  name: "Wireless keyboard",
  type: "electronics",
  importCode: "8471.30.01",
  countryOfOrigin: "CN",
  value: 120,
  weight: 0.6,
  unit: "kg",
};

function defaultMutate() {
  return {
    mutate: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    isSuccess: false,
  } as unknown as ReturnType<typeof useUpdateProduct>;
}

describe("EditProductForm", () => {
  beforeEach(() => mockUseUpdate.mockReset());

  it("renders form fields pre-populated with product data", () => {
    mockUseUpdate.mockReturnValue(defaultMutate());
    render(<EditProductForm product={mockProduct} />);

    expect(
      (screen.getByDisplayValue("8471.30.01") as HTMLInputElement).value,
    ).toBe("8471.30.01");
    expect((screen.getByDisplayValue("CN") as HTMLInputElement).value).toBe("CN");
    expect((screen.getByDisplayValue("120") as HTMLInputElement).value).toBe("120");
  });

  it("renders Figma edit fields (name disabled, import code, origin, value, weight)", () => {
    mockUseUpdate.mockReturnValue(defaultMutate());
    render(<EditProductForm product={mockProduct} />);

    expect(screen.getByDisplayValue("Wireless keyboard")).toBeDisabled();
    expect(screen.getByDisplayValue("8471.30.01")).toBeInTheDocument();
    expect(screen.getByDisplayValue("CN")).toBeInTheDocument();
    expect(screen.getByDisplayValue("120")).toBeInTheDocument();
    expect(screen.getByDisplayValue("0.6")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("shows validation error when value is set to 0", async () => {
    mockUseUpdate.mockReturnValue(defaultMutate());
    render(<EditProductForm product={mockProduct} />);

    const valueInput = screen.getByDisplayValue("120");
    await act(async () => {
      fireEvent.change(valueInput, { target: { value: "0" } });
      fireEvent.submit(valueInput.closest("form")!);
    });

    expect(
      screen.getByText(/value must be a positive number/i),
    ).toBeInTheDocument();
  });

  it("shows validation error when weight is set to 0", async () => {
    mockUseUpdate.mockReturnValue(defaultMutate());
    render(<EditProductForm product={mockProduct} />);

    const weightInput = screen.getByDisplayValue("0.6");
    await act(async () => {
      fireEvent.change(weightInput, { target: { value: "0" } });
      fireEvent.submit(weightInput.closest("form")!);
    });

    expect(
      screen.getByText(/weight must be a positive number/i),
    ).toBeInTheDocument();
  });

  it("calls mutate with updated form data on valid submit", () => {
    const mockMutate = vi.fn();
    mockUseUpdate.mockReturnValue({
      ...defaultMutate(),
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useUpdateProduct>);

    render(<EditProductForm product={mockProduct} />);
    const originInput = screen.getByDisplayValue("CN");
    fireEvent.change(originInput, { target: { value: "US" } });
    fireEvent.click(screen.getByText("Save Changes"));

    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "P-001", dto: expect.objectContaining({ countryOfOrigin: "US" }) }),
      expect.any(Object),
    );
  });

  it("does not call mutate when validation fails", () => {
    const mockMutate = vi.fn();
    mockUseUpdate.mockReturnValue({
      ...defaultMutate(),
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useUpdateProduct>);

    render(<EditProductForm product={mockProduct} />);
    const valueInput = screen.getByDisplayValue("120");
    fireEvent.change(valueInput, { target: { value: "-5" } });
    fireEvent.click(screen.getByText("Save Changes"));

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows Saving… and disables button when isPending", () => {
    mockUseUpdate.mockReturnValue({
      ...defaultMutate(),
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateProduct>);

    render(<EditProductForm product={mockProduct} />);
    const btn = screen.getByText("Saving…") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = vi.fn();
    mockUseUpdate.mockReturnValue(defaultMutate());
    render(<EditProductForm product={mockProduct} onCancel={onCancel} />);

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows API error message when isError is true", () => {
    mockUseUpdate.mockReturnValue({
      ...defaultMutate(),
      isError: true,
      error: new Error("Server error"),
    } as unknown as ReturnType<typeof useUpdateProduct>);

    render(<EditProductForm product={mockProduct} />);
    expect(screen.getByText("Server error")).toBeInTheDocument();
  });

  it("onChange for importCode field updates state (field value changes)", () => {
    mockUseUpdate.mockReturnValue(defaultMutate());
    render(<EditProductForm product={mockProduct} />);
    const importCodeInput = screen.getByDisplayValue("8471.30.01") as HTMLInputElement;
    fireEvent.change(importCodeInput, { target: { value: "9999.99.99" } });
    expect(importCodeInput.value).toBe("9999.99.99");
  });

  it("onChange for weight field updates state", () => {
    mockUseUpdate.mockReturnValue(defaultMutate());
    render(<EditProductForm product={mockProduct} />);
    const weightInput = screen.getByDisplayValue("0.6") as HTMLInputElement;
    fireEvent.change(weightInput, { target: { value: "1.2" } });
    expect(weightInput.value).toBe("1.2");
  });

  it("onSuccess callback closes the form via onSuccess prop", async () => {
    const onSuccess = vi.fn();
    let capturedCallbacks: Record<string, (...args: unknown[]) => void> = {};
    const mockMutate = vi.fn((_args, callbacks) => {
      capturedCallbacks = callbacks;
    });
    mockUseUpdate.mockReturnValue({
      ...defaultMutate(),
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useUpdateProduct>);

    render(<EditProductForm product={mockProduct} onSuccess={onSuccess} />);
    fireEvent.click(screen.getByText("Save Changes"));
    expect(mockMutate).toHaveBeenCalled();
    capturedCallbacks.onSuccess?.();
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("onError callback shows error toast", async () => {
    let capturedCallbacks: Record<string, (...args: unknown[]) => void> = {};
    const mockMutate = vi.fn((_args, callbacks) => {
      capturedCallbacks = callbacks;
    });
    mockUseUpdate.mockReturnValue({
      ...defaultMutate(),
      mutate: mockMutate,
    } as unknown as ReturnType<typeof useUpdateProduct>);

    render(<EditProductForm product={mockProduct} />);
    await act(async () => {
      fireEvent.click(screen.getByText("Save Changes"));
      capturedCallbacks.onError?.(new Error("Network error"));
    });
    expect(screen.getByText(/update failed — Network error/i)).toBeInTheDocument();
  });
});
