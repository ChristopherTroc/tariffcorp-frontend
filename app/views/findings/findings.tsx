"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useFindings } from "@/app/hooks/use-findings";
import { Badge } from "@/app/components/ui/badge";
import { Pagination } from "@/app/components/ui/pagination";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { formatCurrency, formatExposure } from "@/app/utils/format";
import { cn } from "@/app/utils/cn";

const RULE_LABEL: Record<string, string> = {
  R1: "Asian flat tariff",
  R2: "Russia high-volume surcharge",
  R3: "EU consumables high-value duty",
};

export function ViewFindings() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page") ?? 1);
  const filters = { page, per_page: 10 };

  const { data, isLoading, isError, refetch } = useFindings(filters);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/findings?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Findings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All checker discrepancies, ordered by dollar exposure.
        </p>
      </div>

      {isLoading && <SkeletonTable rows={10} rowHeight="h-11" />}
      {isError && (
        <ErrorState
          message="Failed to load findings."
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.data.length === 0 ? (
            <EmptyState
              title="No findings yet."
              description="Seed the database and run the checker."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      "Transaction",
                      "Rule",
                      "Duty Declared",
                      "Duty Computed",
                      "Exposure ↓",
                      "Action",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((finding) => (
                    <tr
                      key={finding.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* Transaction */}
                      <td className="px-4 py-3">
                        <Link
                          href={`/transactions/${finding.transactionId}`}
                          className="font-mono text-xs text-primary hover:underline"
                        >
                          {finding.transactionId}
                        </Link>
                      </td>

                      {/* Rule */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {finding.ruleId && (
                            <Badge variant="rule">{finding.ruleId}</Badge>
                          )}
                          <span className="text-xs text-muted-foreground max-w-[140px] truncate">
                            {finding.ruleName ??
                              (finding.ruleId
                                ? RULE_LABEL[finding.ruleId]
                                : "No rule matched")}
                          </span>
                        </div>
                      </td>

                      {/* Duty declared — from transaction not available here, show computed context */}
                      <td className="px-4 py-3 text-right text-foreground whitespace-nowrap">
                        {formatCurrency(
                          finding.dutyComputed - finding.exposure,
                        )}
                      </td>

                      {/* Duty computed */}
                      <td className="px-4 py-3 text-right text-foreground whitespace-nowrap">
                        {formatCurrency(finding.dutyComputed)}
                      </td>

                      {/* Exposure */}
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span
                          className={cn(
                            "font-semibold",
                            finding.exposure > 0
                              ? "text-destructive"
                              : finding.exposure < 0
                                ? "text-emerald-600"
                                : "text-foreground",
                          )}
                        >
                          {formatExposure(finding.exposure)}
                        </span>
                      </td>

                      {/* Fix Product CTA */}
                      <td className="px-4 py-3">
                        {finding.productId ? (
                          <Link
                            href={`/products/${finding.productId}`}
                            className={[
                              "inline-flex items-center px-3 py-1 text-xs font-medium rounded-md",
                              "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                              "whitespace-nowrap",
                            ].join(" ")}
                          >
                            Fix Product →
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">
                            No product
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{data.meta.total} findings total</span>
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.total_pages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
