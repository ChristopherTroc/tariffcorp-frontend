"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTransactions } from "@/app/hooks/use-transactions";
import { TransactionFilters } from "./components/transaction-filters";
import { Badge } from "@/app/components/ui/badge";
import { Pagination } from "@/app/components/ui/pagination";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { formatCurrency, formatDate } from "@/app/utils/format";
import { cn } from "@/app/utils/cn";
import type { ITransactionFilters } from "@/app/types/api";

export function ViewTransactions() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page") ?? 1);
  const status = (searchParams.get("status") ?? "") as ITransactionFilters["status"] | "";
  const broker = searchParams.get("broker") ?? undefined;
  const portOfEntry = searchParams.get("port_of_entry") ?? undefined;

  const filters: ITransactionFilters = {
    page,
    per_page: 10,
    ...(status && { status }),
    ...(broker && { broker }),
    ...(portOfEntry && { port_of_entry: portOfEntry }),
  };

  const { data, isLoading, isError, refetch } = useTransactions(filters);

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/transactions?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All declared import events.
        </p>
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
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["ID", "Date", "Importer", "Broker", "Port", "Origin", "Units", "Total Value", "Duty Declared"].map((col) => (
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
                  {data.data.map((tx) => {
                    const isUnmatched = tx.productId === null;
                    return (
                      <tr
                        key={tx.id}
                        className={cn(
                          "hover:bg-muted/40 transition-colors cursor-pointer",
                          isUnmatched && "bg-amber-50 dark:bg-amber-950/40",
                        )}
                        onClick={() => router.push(`/transactions/${tx.id}`)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isUnmatched && (
                            <Badge variant="unmatched" className="mb-0.5 block w-fit">
                              Unmatched
                            </Badge>
                          )}
                          <span className="font-mono text-xs text-foreground">{tx.id}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-foreground">
                          {formatDate(tx.date)}
                        </td>
                        <td className="px-4 py-3 max-w-[140px] truncate text-foreground">
                          {tx.importer}
                        </td>
                        <td className="px-4 py-3 max-w-[140px] truncate text-foreground">
                          {tx.broker}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-foreground">
                          {tx.portOfEntry}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {tx.countryOfOrigin}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {tx.units}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground whitespace-nowrap">
                          {formatCurrency(tx.totalValue)}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground whitespace-nowrap">
                          {formatCurrency(tx.dutyDeclared)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{data.meta.total} transactions total</span>
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
