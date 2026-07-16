"use client";

import Link from "next/link";
import { useTransactionDetail } from "@/app/hooks/use-transactions";
import { Badge, ruleBadgeVariant } from "@/app/components/ui/badge";
import { Skeleton } from "@/app/components/ui/skeleton";
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
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

interface ViewTransactionDetailProps {
  id: string;
}

export function ViewTransactionDetail({ id }: ViewTransactionDetailProps) {
  const { data, isLoading, isError, refetch } = useTransactionDetail(id);
  const detail = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load transaction."
        onRetry={() => void refetch()}
      />
    );
  }

  if (!detail) {
    return (
      <EmptyState
        title="Transaction not found."
        ctaLabel="Back to transactions"
        ctaHref="/transactions"
      />
    );
  }

  const { transaction: tx, product, finding } = detail;
  const isUnmatched = tx.productId === null;
  const exposure = finding?.exposure ?? 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-2 border-b border-border pb-4">
        <Link
          href="/transactions"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <span aria-hidden>←</span>
          Back
        </Link>
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="font-mono text-lg font-semibold text-foreground">
            {tx.id}
          </h1>
          <Badge variant={isUnmatched ? "unmatched" : "matched"}>
            {isUnmatched ? "Unmatched" : "Matched"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(tx.date)} · {tx.portOfEntry} · {tx.broker}
        </p>
      </div>

      {isUnmatched && (
        <div
          className={[
            "rounded-lg border border-primary/35 bg-primary/10 px-5 py-4",
            "backdrop-blur-sm",
          ].join(" ")}
        >
          <p className="text-sm font-semibold text-primary">
            This transaction is not linked to any product.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            The checker cannot apply tariff rules without a matched product.
          </p>
          <Link
            href="/products"
            className="mt-2 inline-block text-sm font-semibold text-primary hover:text-primary/80"
          >
            Browse product catalog →
          </Link>
        </div>
      )}

      {/* Declaration + Finding */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Declaration
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            <Field label="Importer" value={tx.importer} />
            <Field label="Broker" value={tx.broker} />
            <Field label="Port of Entry" value={tx.portOfEntry} />
            <Field
              label="Origin"
              value={
                <span className="font-mono text-sm">{tx.countryOfOrigin}</span>
              }
            />
            <Field
              label="Import Code"
              value={
                <span className="font-mono text-sm">{tx.importCode}</span>
              }
            />
            <Field label="Units" value={tx.units} />
            <Field label="Unit Value" value={formatCurrency(tx.unitValue)} />
            <Field label="Total Value" value={formatCurrency(tx.totalValue)} />
            <Field
              label="Duty Declared"
              value={formatCurrency(tx.dutyDeclared)}
            />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Checker Finding
          </h2>
          {finding ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {finding.ruleId && (
                  <Badge variant={ruleBadgeVariant(finding.ruleId)}>
                    {finding.ruleId}
                  </Badge>
                )}
                <span className="text-sm font-semibold text-foreground">
                  {finding.ruleName ?? "Unknown rule"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-2 backdrop-blur-sm">
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Declared
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {formatCurrency(tx.dutyDeclared)}
                  </p>
                </div>
                <div className="rounded-md border border-border/60 bg-muted/40 px-2.5 py-2 backdrop-blur-sm">
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Computed
                  </p>
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {formatCurrency(finding.dutyComputed)}
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-md border px-2.5 py-2 backdrop-blur-sm",
                    exposure > 0
                      ? "border-destructive/30 bg-destructive/10"
                      : exposure < 0
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-border/60 bg-muted/40",
                  )}
                >
                  <p className="text-[11px] tracking-wide text-muted-foreground uppercase">
                    Gap
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-lg font-bold",
                      exposure > 0
                        ? "text-destructive"
                        : exposure < 0
                          ? "text-emerald-500"
                          : "text-foreground",
                    )}
                  >
                    {formatExposure(exposure)}
                  </p>
                </div>
              </div>

              {product && (
                <Link
                  href={`/products/${product.id}`}
                  className={[
                    "inline-flex w-full items-center justify-center gap-2 rounded-md",
                    "bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
                    "hover:bg-primary/90 transition-colors",
                  ].join(" ")}
                >
                  Fix Product
                </Link>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              No finding computed for this transaction.
            </p>
          )}
        </section>
      </div>

      {/* Linked product */}
      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Linked Product
          </h2>
          {product && (
            <Link
              href={`/products/${product.id}`}
              className="text-sm font-semibold text-primary hover:text-primary/80"
            >
              View detail →
            </Link>
          )}
        </div>
        {product ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Field label="Name" value={product.name} />
            <Field label="Type" value={product.type} />
            <Field
              label="Import Code"
              value={
                <span className="font-mono text-sm">{product.importCode}</span>
              }
            />
            <Field
              label="Origin"
              value={
                <span className="font-mono text-sm">
                  {product.countryOfOrigin}
                </span>
              }
            />
            <Field label="Value" value={formatCurrency(product.value)} />
            <Field
              label="Weight"
              value={`${product.weight} ${product.unit}`}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No product linked to this transaction.
          </p>
        )}
      </section>
    </div>
  );
}
