"use client";

import { useMemo, useTransition } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useFindings } from "@/app/hooks/use-findings";
import { useDashboard } from "@/app/hooks/use-dashboard";
import { Badge, ruleBadgeVariant } from "@/app/components/ui/badge";
import { Pagination } from "@/app/components/ui/pagination";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { formatCurrency, formatExposure } from "@/app/utils/format";
import { cn } from "@/app/utils/cn";
import type { IFinding } from "@/app/types/api";

const RULE_IDS = ["R1", "R2", "R3"] as const;

const RULE_LABEL: Record<string, string> = {
  R1: "Asian flat tariff",
  R2: "Russia high-volume surcharge",
  R3: "EU consumables high-value duty",
};

export function ViewFindings() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const page = Number(searchParams.get("page") ?? 1);
  const rule = searchParams.get("rule") ?? "";
  const filters = { page, per_page: 10 };

  const { data, isLoading, isError, refetch } = useFindings(filters);
  const { data: dashboard } = useDashboard();

  const totalExposure = dashboard?.data?.totalExposure;

  const visibleRows = useMemo(() => {
    const rows = data?.data ?? [];
    if (!rule || !RULE_IDS.includes(rule as (typeof RULE_IDS)[number])) {
      return rows;
    }
    return rows.filter((f) => f.ruleId === rule);
  }, [data?.data, rule]);

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    startTransition(() => {
      router.push(`/findings?${params.toString()}`);
    });
  }

  function handlePageChange(newPage: number) {
    pushParams((params) => {
      params.set("page", String(newPage));
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Findings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All checker discrepancies · sorted by dollar exposure
          </p>
        </div>
        {typeof totalExposure === "number" && (
          <div className="text-right">
            <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
              Total Exposure
            </p>
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums",
                totalExposure > 0
                  ? "text-destructive"
                  : totalExposure < 0
                    ? "text-emerald-500"
                    : "text-foreground",
              )}
            >
              {formatCurrency(Math.abs(totalExposure))}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={!rule}
          onClick={() =>
            pushParams((params) => {
              params.delete("rule");
              params.delete("page");
            })
          }
        >
          All rules
        </FilterChip>
        {RULE_IDS.map((id) => (
          <FilterChip
            key={id}
            active={rule === id}
            onClick={() =>
              pushParams((params) => {
                params.set("rule", id);
                params.delete("page");
              })
            }
          >
            {id}
          </FilterChip>
        ))}
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
          ) : visibleRows.length === 0 ? (
            <EmptyState
              title="No matches on this page."
              description="Rule filter only applies to the current page. Clear the filter or change pages."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full min-w-[720px] table-fixed text-sm">
                <colgroup>
                  <col className="w-[11%]" />
                  <col className="w-[11%]" />
                  <col className="w-[24%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[12%]" />
                  <col className="w-[18%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border">
                    <th className={thClass()}>Transaction</th>
                    <th className={thClass()}>Product</th>
                    <th className={thClass()}>Rule</th>
                    <th className={thClass("text-right")}>Declared</th>
                    <th className={thClass("text-right")}>Computed</th>
                    <th className={thClass("text-right")}>Exposure ↓</th>
                    <th className={thClass("text-right")}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleRows.map((finding) => (
                    <FindingRow key={finding.id} finding={finding} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>{data.meta.total} total</span>
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.total_pages}
              onPageChange={handlePageChange}
              className="mt-0"
            />
          </div>
        </>
      )}
    </div>
  );
}

function thClass(extra?: string) {
  return cn(
    "px-3 py-2.5 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap",
    extra,
  );
}

function FindingRow({ finding }: { finding: IFinding }) {
  const declared = finding.dutyComputed - finding.exposure;
  const ruleLabel =
    finding.ruleName ??
    (finding.ruleId ? RULE_LABEL[finding.ruleId] : "No rule matched");

  return (
    <tr className="transition-colors hover:bg-muted/40">
      <td className="truncate px-3 py-2.5">
        <Link
          href={`/transactions/${finding.transactionId}`}
          className="font-mono text-xs font-medium text-primary hover:underline"
        >
          {finding.transactionId}
        </Link>
      </td>
      <td className="truncate px-3 py-2.5">
        {finding.productId ? (
          <Link
            href={`/products/${finding.productId}`}
            className="text-sm font-medium text-foreground hover:text-primary hover:underline"
          >
            {finding.productId}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </td>
      <td className="px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          {finding.ruleId ? (
            <Badge variant={ruleBadgeVariant(finding.ruleId)} className="shrink-0">
              {finding.ruleId}
            </Badge>
          ) : null}
          <span className="truncate text-xs text-muted-foreground">
            {ruleLabel}
          </span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-right whitespace-nowrap text-muted-foreground">
        {formatCurrency(declared)}
      </td>
      <td className="px-3 py-2.5 text-right whitespace-nowrap text-foreground">
        {formatCurrency(finding.dutyComputed)}
      </td>
      <td className="px-3 py-2.5 text-right whitespace-nowrap">
        <span
          className={cn(
            "font-semibold",
            finding.exposure > 0
              ? "text-destructive"
              : finding.exposure < 0
                ? "text-emerald-500"
                : "text-foreground",
          )}
        >
          {formatExposure(finding.exposure)}
        </span>
      </td>
      <td className="px-3 py-2.5 text-right">
        {finding.productId ? (
          <Link
            href={`/products/${finding.productId}`}
            className={[
              "inline-flex items-center gap-1.5 rounded-md border border-primary/50",
              "bg-transparent px-2.5 py-1.5 text-xs font-medium text-primary",
              "hover:bg-primary/10 transition-colors whitespace-nowrap",
            ].join(" ")}
          >
            <KeyIcon />
            Fix Product
          </Link>
        ) : (
          <span className="text-xs text-muted-foreground italic">No product</span>
        )}
      </td>
    </tr>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function KeyIcon() {
  return (
    <svg
      className="size-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <circle cx="8" cy="15" r="4" />
      <path d="M12 15h8l-2-2m0 4l2-2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
