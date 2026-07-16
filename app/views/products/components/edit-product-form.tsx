"use client";

import { useEffect, useState } from "react";
import { useUpdateProduct } from "@/app/hooks/use-products";
import type { IProduct, IUpdateProductDto } from "@/app/types/api";
import { cn } from "@/app/utils/cn";

interface EditProductFormProps {
  product: IProduct;
  formId?: string;
  showActions?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
  onPendingChange?: (isPending: boolean) => void;
  linkedTransactionCount?: number;
}

interface FormErrors {
  value?: string;
  weight?: string;
}

export function EditProductForm({
  product,
  formId = "product-classification-form",
  showActions = true,
  onSuccess,
  onCancel,
  onPendingChange,
  linkedTransactionCount,
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

  useEffect(() => {
    onPendingChange?.(isPending);
    return () => onPendingChange?.(false);
  }, [isPending, onPendingChange]);

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
    if (isPending) return;
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

  const labelClass =
    "block text-[11px] font-medium tracking-wide text-muted-foreground uppercase mb-1";

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-4">
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

      {typeof linkedTransactionCount === "number" && linkedTransactionCount > 0 && (
        <div className="rounded-md border border-primary/35 bg-primary/10 px-4 py-3 text-sm text-foreground backdrop-blur-sm">
          Saving will immediately re-evaluate the checker for all{" "}
          {linkedTransactionCount} linked transaction
          {linkedTransactionCount !== 1 ? "s" : ""}.
        </div>
      )}

      {/* Figma edit grid: Name, Import Code, Country of Origin, Unit Value, Weight */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            value={product.name}
            disabled
            className={cn(inputClass, "opacity-70")}
          />
        </div>

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
            onChange={(e) =>
              setForm((f) => ({ ...f, countryOfOrigin: e.target.value }))
            }
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Unit Value ($)</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={form.value ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, value: Number(e.target.value) }))
            }
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
            onChange={(e) =>
              setForm((f) => ({ ...f, weight: Number(e.target.value) }))
            }
            className={cn(inputClass, errors.weight && "border-destructive")}
          />
          {errors.weight && (
            <p className="mt-1 text-xs text-destructive">{errors.weight}</p>
          )}
        </div>
      </div>

      {isError && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Update failed"}
        </p>
      )}

      {showActions && (
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
      )}
    </form>
  );
}
