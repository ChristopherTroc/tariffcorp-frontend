"use client";

import { useState } from "react";
import { useUpdateProduct } from "@/app/hooks/use-products";
import type { IProduct, IUpdateProductDto, TProductType } from "@/app/types/api";
import { cn } from "@/app/utils/cn";

const PRODUCT_TYPES: TProductType[] = [
  "electronics",
  "consumable",
  "apparel",
  "furniture",
  "raw_material",
];

interface EditProductFormProps {
  product: IProduct;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormErrors {
  value?: string;
  weight?: string;
}

export function EditProductForm({
  product,
  onSuccess,
  onCancel,
}: EditProductFormProps) {
  const { mutate, isPending, isError, error } = useUpdateProduct();
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [form, setForm] = useState<IUpdateProductDto>({
    importCode: product.importCode,
    countryOfOrigin: product.countryOfOrigin,
    type: product.type,
    value: product.value,
    weight: product.weight,
    unit: product.unit,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const errs: FormErrors = {};
    if (form.value !== undefined && form.value <= 0) {
      errs.value = "Value must be a positive number";
    }
    if (form.weight !== undefined && form.weight <= 0) {
      errs.weight = "Weight must be a positive number";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    mutate(
      { id: product.id, dto: form },
      {
        onSuccess: () => {
          setToast({ type: "success", msg: "Product updated. Findings re-evaluated." });
          setTimeout(() => setToast(null), 4000);
          onSuccess?.();
        },
        onError: (err) => {
          const msg = err instanceof Error ? err.message : "Update failed";
          setToast({ type: "error", msg: `Update failed — ${msg}` });
          setTimeout(() => setToast(null), 4000);
        },
      },
    );
  }

  const inputClass = [
    "w-full px-3 py-2 text-sm rounded-md border border-border bg-background",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  ].join(" ");

  const labelClass = "block text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {toast && (
        <div
          className={cn(
            "rounded-md p-3 text-sm font-medium",
            toast.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-destructive/10 text-destructive border border-destructive/20",
          )}
        >
          {toast.msg}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Import Code</label>
          <input
            type="text"
            value={form.importCode ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, importCode: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Country of Origin</label>
          <input
            type="text"
            value={form.countryOfOrigin ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, countryOfOrigin: e.target.value }))}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Type</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as TProductType }))}
            className={inputClass}
          >
            {PRODUCT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Value (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.value ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
            className={cn(inputClass, errors.value && "border-destructive")}
          />
          {errors.value && (
            <p className="mt-1 text-xs text-destructive">{errors.value}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Weight</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.weight ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, weight: Number(e.target.value) }))}
            className={cn(inputClass, errors.weight && "border-destructive")}
          />
          {errors.weight && (
            <p className="mt-1 text-xs text-destructive">{errors.weight}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Unit</label>
          <input
            type="text"
            value={form.unit ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Update failed"}
        </p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className={[
            "px-4 py-2 text-sm font-medium rounded-md transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          ].join(" ")}
        >
          {isPending ? "Saving…" : "Save Changes"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md border border-border hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
