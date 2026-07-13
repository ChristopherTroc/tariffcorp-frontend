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
}

export function TopOffendersList({
  title,
  items,
  loading,
}: TopOffendersListProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
        {title}
      </h3>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          No data yet
        </p>
      ) : (
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted transition-colors group"
              >
                <span className="text-sm text-foreground truncate max-w-[60%] group-hover:text-primary">
                  {item.name}
                </span>
                <span className="text-sm font-semibold text-destructive ml-2 shrink-0">
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
