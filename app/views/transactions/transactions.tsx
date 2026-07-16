"use client";

import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTransactions } from "@/app/hooks/use-transactions";
import {
  TransactionFilters,
  TransactionSearch,
} from "./components/transaction-filters";
import { Badge } from "@/app/components/ui/badge";
import { Pagination } from "@/app/components/ui/pagination";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { formatCurrency, formatDate, formatExposure } from "@/app/utils/format";
import { cn } from "@/app/utils/cn";
import type { ITransaction, ITransactionFilters } from "@/app/types/api";

const COLUMNS = [
  "ID",
  "Date",
  "Importer",
  "Broker",
  "Port",
  "Origin",
  "Units",
  "Total Value",
  "Duty Declared",
  "Finding",
] as const;

function matchesSearch(tx: ITransaction, q: string): boolean {
  if (!q) return true;
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return (
    tx.id.toLowerCase().includes(needle) ||
    tx.importer.toLowerCase().includes(needle) ||
    tx.broker.toLowerCase().includes(needle) ||
    tx.portOfEntry.toLowerCase().includes(needle)
  );
}

function FindingCell({ tx }: { tx: ITransaction }) {
  if (tx.findingExposure == null) {
    return <span className="text-muted-foreground">—</span>;
  }
  const exposure = tx.findingExposure;
  return (
    <span
      className={cn(
        "font-semibold whitespace-nowrap",
        exposure > 0
          ? "text-destructive"
          : exposure < 0
            ? "text-emerald-500"
            : "text-muted-foreground",
      )}
    >
      {formatExposure(exposure)}
    </span>
  );
}

export function ViewTransactions() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page") ?? 1);
  const status = (searchParams.get("status") ?? "") as
    | ITransactionFilters["status"]
    | "";
  const broker = searchParams.get("broker") ?? undefined;
  const portOfEntry = searchParams.get("port_of_entry") ?? undefined;
  const q = searchParams.get("q") ?? "";

  const filters: ITransactionFilters = {
    page,
    per_page: 10,
    ...(status && { status }),
    ...(broker && { broker }),
    ...(portOfEntry && { port_of_entry: portOfEntry }),
  };

  const { data, isLoading, isError, refetch } = useTransactions(filters);

  const visibleRows = useMemo(() => {
    const rows = data?.data ?? [];
    return rows.filter((tx) => matchesSearch(tx, q));
  }, [data?.data, q]);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/transactions?${params.toString()}`);
  }

  const total = data?.meta.total;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Transactions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All declared import events
            {typeof total === "number" ? ` — ${total} total` : ""}
          </p>
        </div>
        <TransactionSearch />
      </div>

      <TransactionFilters />

      {isLoading && <SkeletonTable rows={10} rowHeight="h-11" />}
      {isError && (
        <ErrorState
          message="Failed to load transactions."
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.data.length === 0 ? (
            <EmptyState
              title="No transactions found."
              description="Try adjusting your filters."
            />
          ) : visibleRows.length === 0 ? (
            <EmptyState
              title="No matches on this page."
              description="Search only filters the current page. Clear search or change filters."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {COLUMNS.map((col) => (
                      <th
                        key={col}
                        className={cn(
                          "px-3 py-2.5 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap",
                          (col === "Units" ||
                            col === "Total Value" ||
                            col === "Duty Declared" ||
                            col === "Finding") &&
                            "text-right",
                        )}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleRows.map((tx) => {
                    const isUnmatched = tx.productId === null;
                    return (
                      <tr
                        key={tx.id}
                        className={cn(
                          "cursor-pointer transition-colors hover:bg-muted/40",
                          isUnmatched && "bg-primary/5",
                        )}
                        onClick={() => router.push(`/transactions/${tx.id}`)}
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            {isUnmatched && (
                              <Badge variant="unmatched" className="w-fit">
                                Unmatched
                              </Badge>
                            )}
                            <span className="font-mono text-xs font-medium text-primary">
                              {tx.id}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-foreground">
                          {formatDate(tx.date)}
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-2.5 text-foreground">
                          {tx.importer}
                        </td>
                        <td className="max-w-[140px] truncate px-3 py-2.5 text-foreground">
                          {tx.broker}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-foreground">
                          {tx.portOfEntry}
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                            {tx.countryOfOrigin}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right text-foreground">
                          {tx.units}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap text-foreground">
                          {formatCurrency(tx.totalValue)}
                        </td>
                        <td className="px-3 py-2.5 text-right whitespace-nowrap text-foreground">
                          {formatCurrency(tx.dutyDeclared)}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <FindingCell tx={tx} />
                        </td>
                      </tr>
                    );
                  })}
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
