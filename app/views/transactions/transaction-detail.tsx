"use client";

import Link from "next/link";
import { useTransactionDetail } from "@/app/hooks/use-transactions";
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

interface ViewTransactionDetailProps {
  id: string;
}

export function ViewTransactionDetail({ id }: ViewTransactionDetailProps) {
  const { data, isLoading, isError, refetch } = useTransactionDetail(id);
  const detail = data?.data;

  if (isLoading) return <SkeletonTable rows={6} />;
  if (isError)
    return (
      <ErrorState
        message="Failed to load transaction."
        onRetry={() => void refetch()}
      />
    );
  if (!detail)
    return <EmptyState title="Transaction not found." ctaLabel="Back to transactions" ctaHref="/transactions" />;

  const { transaction: tx, product, finding } = detail;
  const isUnmatched = tx.productId === null;
  const exposure = finding?.exposure ?? 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/transactions" className="hover:text-foreground">
          Transactions
        </Link>
        <span>/</span>
        <span className="font-mono text-foreground">{tx.id}</span>
      </div>

      {/* Unmatched callout */}
      {isUnmatched && (
        <div className="rounded-lg border border-border border-l-4 border-l-amber-500 bg-card p-4 dark:border-l-amber-400">
          <p className="text-sm font-semibold text-foreground">
            This transaction is not linked to any product.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            The checker cannot apply tariff rules without a matched product.
          </p>
          <Link
            href="/products"
            className="mt-2 inline-block text-sm font-semibold text-primary underline hover:text-primary/80"
          >
            Browse product catalog →
          </Link>
        </div>
      )}

      {/* Transaction fields */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Declaration
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Field label="ID" value={<span className="font-mono text-sm">{tx.id}</span>} />
          <Field label="Date" value={formatDate(tx.date)} />
          <Field label="Importer" value={tx.importer} />
          <Field label="Broker" value={tx.broker} />
          <Field label="Port of Entry" value={tx.portOfEntry} />
          <Field label="Origin" value={<span className="font-mono">{tx.countryOfOrigin}</span>} />
          <Field label="Import Code" value={<span className="font-mono text-sm">{tx.importCode}</span>} />
          <Field label="Units" value={tx.units} />
          <Field label="Unit Value" value={formatCurrency(tx.unitValue)} />
          <Field label="Total Value" value={formatCurrency(tx.totalValue)} />
          <Field label="Duty Declared" value={formatCurrency(tx.dutyDeclared)} />
          <Field
            label="Status"
            value={
              <Badge variant={isUnmatched ? "unmatched" : "matched"}>
                {isUnmatched ? "Unmatched" : "Matched"}
              </Badge>
            }
          />
        </div>
      </div>

      {/* Linked product */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Linked Product
        </h2>
        {product ? (
          <div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Field label="Name" value={product.name} />
              <Field label="Type" value={product.type} />
              <Field label="Origin" value={<span className="font-mono">{product.countryOfOrigin}</span>} />
              <Field label="Import Code" value={<span className="font-mono text-sm">{product.importCode}</span>} />
              <Field label="Value" value={formatCurrency(product.value)} />
            </div>
            <Link
              href={`/products/${product.id}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View product detail →
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No product linked to this transaction.
          </p>
        )}
      </div>

      {/* Checker finding */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
          Checker Finding
        </h2>
        {finding ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {finding.ruleId && (
                <Badge variant="rule">{finding.ruleId}</Badge>
              )}
              <span className="text-base font-medium text-foreground">
                {finding.ruleName ?? "Unknown rule"}
              </span>
            </div>

            {/* Duty breakdown */}
            <div className="flex items-end gap-8 flex-wrap">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Declared
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(tx.dutyDeclared)}
                </p>
              </div>
              <div className="text-muted-foreground text-lg pb-1">→</div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Computed
                </p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(finding.dutyComputed)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Exposure
                </p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    exposure > 0
                      ? "text-destructive"
                      : exposure < 0
                        ? "text-emerald-600"
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
                  "inline-flex items-center px-4 py-2 text-sm font-medium rounded-md",
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                ].join(" ")}
              >
                Fix Product →
              </Link>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            No finding computed for this transaction.
          </p>
        )}
      </div>
    </div>
  );
}
