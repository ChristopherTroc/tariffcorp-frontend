"use client";

import { useState } from "react";
import Link from "next/link";
import { useProductDetail } from "@/app/hooks/use-products";
import { EditProductForm } from "./components/edit-product-form";
import { Badge } from "@/app/components/ui/badge";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { formatCurrency, formatDate, formatExposure } from "@/app/utils/format";
import { cn } from "@/app/utils/cn";

interface FieldProps {
  label: string;
  value: React.ReactNode;
}

function Field({ label, value }: FieldProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-base font-medium text-foreground">{value}</p>
    </div>
  );
}

interface ViewProductDetailProps {
  id: string;
}

export function ViewProductDetail({ id }: ViewProductDetailProps) {
  const { data, isLoading, isError, refetch } = useProductDetail(id);
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <SkeletonTable rows={6} />;
  if (isError)
    return (
      <ErrorState
        message="Failed to load product."
        onRetry={() => void refetch()}
      />
    );
  if (!data?.data)
    return (
      <EmptyState
        title="Product not found."
        ctaLabel="Back to products"
        ctaHref="/products"
      />
    );

  const { product, transactions, findings } = data.data;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium">{product.name}</span>
      </div>

      {/* Product fields + edit */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5 capitalize">
              {product.type.replace("_", " ")} · {product.id}
            </p>
          </div>
          <button
            onClick={() => setEditOpen((o) => !o)}
            className={[
              "px-4 py-2 text-sm font-medium rounded-md transition-colors shrink-0",
              "bg-primary text-primary-foreground hover:bg-primary/90",
            ].join(" ")}
          >
            {editOpen ? "Cancel Edit" : "Edit Product"}
          </button>
        </div>

        {editOpen ? (
          <div className="space-y-4">
            <div className="rounded-md border border-border border-l-4 border-l-amber-500 bg-card p-3 text-sm text-foreground dark:border-l-amber-400">
              Editing this product will immediately re-evaluate the checker for all {transactions.length} linked transaction{transactions.length !== 1 ? "s" : ""}.
            </div>
            <EditProductForm
              product={product}
              onSuccess={() => setEditOpen(false)}
              onCancel={() => setEditOpen(false)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            <Field label="Import Code" value={<span className="font-mono text-sm">{product.importCode}</span>} />
            <Field label="Country of Origin" value={<span className="font-mono">{product.countryOfOrigin}</span>} />
            <Field label="Type" value={<span className="capitalize">{product.type.replace("_", " ")}</span>} />
            <Field label="Value" value={formatCurrency(product.value)} />
            <Field label="Weight" value={`${product.weight} ${product.unit}`} />
          </div>
        )}
      </div>

      {/* Active findings */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Active Findings ({findings.length})
        </h2>
        {findings.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No findings for this product.
          </p>
        ) : (
          <div className="space-y-2">
            {findings
              .sort((a, b) => b.exposure - a.exposure)
              .map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between gap-4 py-2 px-3 rounded-md bg-muted/40"
                >
                  <div className="flex items-center gap-2">
                    {f.ruleId && <Badge variant="rule">{f.ruleId}</Badge>}
                    <span className="text-sm text-foreground">{f.ruleName}</span>
                    <Link
                      href={`/transactions/${f.transactionId}`}
                      className="text-xs text-muted-foreground hover:text-primary font-mono"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {f.transactionId}
                    </Link>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold shrink-0",
                      f.exposure > 0
                        ? "text-destructive"
                        : f.exposure < 0
                          ? "text-emerald-600"
                          : "text-foreground",
                    )}
                  >
                    {formatExposure(f.exposure)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Linked transactions */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
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
                  {["ID", "Date", "Broker", "Port", "Units", "Total Value", "Duty Declared"].map(
                    (col) => (
                      <th
                        key={col}
                        className="pb-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground pr-4 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => {}}
                  >
                    <td className="py-2 pr-4">
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="font-mono text-xs text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tx.id}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap text-foreground">
                      {formatDate(tx.date)}
                    </td>
                    <td className="py-2 pr-4 text-foreground">{tx.broker}</td>
                    <td className="py-2 pr-4 text-foreground">{tx.portOfEntry}</td>
                    <td className="py-2 pr-4 text-right text-foreground">{tx.units}</td>
                    <td className="py-2 pr-4 text-right text-foreground whitespace-nowrap">
                      {formatCurrency(tx.totalValue)}
                    </td>
                    <td className="py-2 text-right text-foreground whitespace-nowrap">
                      {formatCurrency(tx.dutyDeclared)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
