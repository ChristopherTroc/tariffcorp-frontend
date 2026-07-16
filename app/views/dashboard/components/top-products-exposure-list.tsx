import Link from "next/link";
import { formatCurrency } from "@/app/utils/format";
import { Skeleton } from "@/app/components/ui/skeleton";
import type { ITopOffenderProduct } from "@/app/types/api";

interface TopProductsExposureListProps {
  items: ITopOffenderProduct[];
  loading?: boolean;
}

export function TopProductsExposureList({
  items,
  loading,
}: TopProductsExposureListProps) {
  const maxExposure = Math.max(...items.map((i) => i.totalExposure), 0);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Top Products by Exposure
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Products contributing the most underpaid duty.
      </p>

      {loading ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 py-4 text-center text-sm text-muted-foreground">
          No data yet
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const pct =
              maxExposure > 0
                ? Math.max(4, (item.totalExposure / maxExposure) * 100)
                : 0;
            return (
              <li key={item.id}>
                <Link
                  href={`/products/${item.id}`}
                  className="group block space-y-1 rounded-md px-1 py-0.5 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm text-foreground group-hover:text-primary">
                      {item.name}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-destructive">
                      {formatCurrency(item.totalExposure)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-destructive/80"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
