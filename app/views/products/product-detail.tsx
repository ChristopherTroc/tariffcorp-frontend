"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useProductDetail } from "@/app/hooks/use-products";
import { EditProductForm } from "./components/edit-product-form";
import { Badge, ruleBadgeVariant } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { formatCurrency, formatDate, formatExposure } from "@/app/utils/format";
import { cn } from "@/app/utils/cn";
import type { IFinding, IProduct, ITransaction } from "@/app/types/api";

const FORM_ID = "product-classification-form";

interface ViewProductDetailProps {
  id: string;
}

export function ViewProductDetail({ id }: ViewProductDetailProps) {
  const { data, isLoading, isError, refetch } = useProductDetail(id);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const handlePendingChange = useCallback((pending: boolean) => {
    setIsSaving(pending);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load product."
        onRetry={() => void refetch()}
      />
    );
  }

  if (!data?.data) {
    return (
      <EmptyState
        title="Product not found."
        ctaLabel="Back to products"
        ctaHref="/products"
      />
    );
  }

  const { product, transactions, findings } = data.data;
  const totalExposure = findings.reduce((sum, f) => sum + f.exposure, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/products"
            className="mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Back to products"
          >
            <span aria-hidden className="text-lg leading-none">
              ←
            </span>
          </Link>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-lg font-semibold tracking-tight text-foreground">
                {product.name}
              </h1>
              {findings.length > 0 && (
                <Badge variant="destructive">
                  {findings.length} open finding
                  {findings.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-sm capitalize text-muted-foreground">
              {product.type.replace("_", " ")} · {product.id}
            </p>
          </div>
        </div>

        {isEditing ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
              className={[
                "inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2.5",
                "text-sm font-medium text-foreground hover:bg-muted transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              Cancel
            </button>
            <button
              type="submit"
              form={FORM_ID}
              disabled={isSaving}
              aria-busy={isSaving}
              className={[
                "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5",
                "bg-primary text-sm font-semibold text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "disabled:cursor-not-allowed disabled:opacity-50",
              ].join(" ")}
            >
              {isSaving ? <SpinnerIcon /> : <CheckIcon />}
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={[
              "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5",
              "border border-border bg-card text-sm font-medium text-foreground",
              "hover:bg-muted transition-colors",
            ].join(" ")}
          >
            <PencilIcon />
            Edit product
          </button>
        )}
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Classification
        </h2>
        {isEditing ? (
          <EditProductForm
            product={product}
            formId={FORM_ID}
            showActions={false}
            linkedTransactionCount={transactions.length}
            onSuccess={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
            onPendingChange={handlePendingChange}
          />
        ) : (
          <ClassificationReadonly
            product={product}
            totalExposure={totalExposure}
          />
        )}
      </section>

      <ActiveFindingsSection findings={findings} transactions={transactions} />
      <LinkedTransactionsSection transactions={transactions} />
    </div>
  );
}

function ClassificationReadonly({
  product,
  totalExposure,
}: {
  product: IProduct;
  totalExposure: number;
}) {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Import Code", value: product.importCode },
    { label: "Country of Origin", value: product.countryOfOrigin },
    {
      label: "Type",
      value: (
        <span className="capitalize">{product.type.replace("_", " ")}</span>
      ),
    },
    { label: "Unit Value", value: formatCurrency(product.value) },
    {
      label: "Weight",
      value: `${product.weight} ${product.unit}`,
    },
    {
      label: "Total Exposure",
      value: (
        <span
          className={cn(
            "font-semibold",
            totalExposure > 0
              ? "text-destructive"
              : totalExposure < 0
                ? "text-emerald-500"
                : "text-foreground",
          )}
        >
          {formatCurrency(Math.abs(totalExposure))}
          {totalExposure < 0 ? " (overpaid)" : ""}
        </span>
      ),
    },
  ];

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      {fields.map((field) => (
        <div key={field.label}>
          <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            {field.label}
          </dt>
          <dd className="mt-1 text-sm font-medium text-foreground">
            {field.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function ActiveFindingsSection({
  findings,
  transactions,
}: {
  findings: IFinding[];
  transactions: ITransaction[];
}) {
  const txById = new Map(transactions.map((t) => [t.id, t]));
  const sortedFindings = [...findings].sort((a, b) => b.exposure - a.exposure);

  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Active Findings ({findings.length})
      </h2>
      {findings.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No findings for this product.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Transaction", "Rule", "Declared", "Computed", "Gap"].map(
                  (col) => (
                    <th
                      key={col}
                      className={cn(
                        "px-2 py-2 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap",
                        (col === "Declared" ||
                          col === "Computed" ||
                          col === "Gap") &&
                          "text-right",
                      )}
                    >
                      {col}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedFindings.map((f) => {
                const declared = txById.get(f.transactionId)?.dutyDeclared;
                return (
                  <tr key={f.id}>
                    <td className="px-2 py-2.5">
                      <Link
                        href={`/transactions/${f.transactionId}`}
                        className="font-mono text-xs font-medium text-primary hover:underline"
                      >
                        {f.transactionId}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5">
                      {f.ruleId ? (
                        <Badge variant={ruleBadgeVariant(f.ruleId)}>
                          {f.ruleId}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2.5 text-right whitespace-nowrap text-foreground">
                      {declared == null ? "—" : formatCurrency(declared)}
                    </td>
                    <td className="px-2 py-2.5 text-right whitespace-nowrap text-foreground">
                      {formatCurrency(f.dutyComputed)}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-2.5 text-right whitespace-nowrap font-semibold",
                        f.exposure > 0
                          ? "text-destructive"
                          : f.exposure < 0
                            ? "text-emerald-500"
                            : "text-foreground",
                      )}
                    >
                      {formatExposure(f.exposure)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function LinkedTransactionsSection({
  transactions,
}: {
  transactions: ITransaction[];
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Linked Transactions ({transactions.length})
      </h2>
      {transactions.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No transactions linked to this product.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {[
                  "ID",
                  "Date",
                  "Broker",
                  "Port",
                  "Units",
                  "Total Value",
                  "Duty Declared",
                ].map((col) => (
                  <th
                    key={col}
                    className={cn(
                      "px-2 py-2 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap",
                      (col === "Units" ||
                        col === "Total Value" ||
                        col === "Duty Declared") &&
                        "text-right",
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-2 py-2.5">
                    <Link
                      href={`/transactions/${tx.id}`}
                      className="font-mono text-xs font-medium text-primary hover:underline"
                    >
                      {tx.id}
                    </Link>
                  </td>
                  <td className="px-2 py-2.5 whitespace-nowrap text-foreground">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-2 py-2.5 text-foreground">{tx.broker}</td>
                  <td className="px-2 py-2.5 text-foreground">
                    {tx.portOfEntry}
                  </td>
                  <td className="px-2 py-2.5 text-right text-foreground">
                    {tx.units}
                  </td>
                  <td className="px-2 py-2.5 text-right whitespace-nowrap text-foreground">
                    {formatCurrency(tx.totalValue)}
                  </td>
                  <td className="px-2 py-2.5 text-right whitespace-nowrap text-foreground">
                    {formatCurrency(tx.dutyDeclared)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function PencilIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path d="M12 20h9" strokeLinecap="round" />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="size-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
      />
    </svg>
  );
}
