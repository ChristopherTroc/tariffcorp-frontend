import Link from "next/link";
import { formatCurrency } from "@/app/utils/format";
import { Skeleton } from "@/app/components/ui/skeleton";

interface TopOffenderItem {
  name: string;
  totalExposure: number;
  href: string;
}

interface TopOffendersListProps {
  title: string;
  items: TopOffenderItem[];
  loading?: boolean;
  numbered?: boolean;
}

export function TopOffendersList({
  title,
  items,
  loading,
  numbered = true,
}: TopOffendersListProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          No data yet
        </p>
      ) : (
        <ul className="space-y-0.5">
          {items.map((item, index) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={[
                  "group flex items-center justify-between gap-2 rounded px-2 py-1.5",
                  "transition-colors hover:bg-muted",
                ].join(" ")}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  {numbered && (
                    <span className="w-4 shrink-0 font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                  <span className="truncate text-sm text-foreground group-hover:text-primary">
                    {item.name}
                  </span>
                </span>
                <span className="ml-2 shrink-0 text-sm font-semibold text-destructive">
                  {formatCurrency(item.totalExposure)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
