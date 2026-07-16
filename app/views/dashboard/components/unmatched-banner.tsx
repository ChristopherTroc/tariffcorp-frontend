import Link from "next/link";
import { cn } from "@/app/utils/cn";

interface UnmatchedBannerProps {
  count: number;
  className?: string;
}

export function UnmatchedBanner({ count, className }: UnmatchedBannerProps) {
  if (count <= 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-primary/35",
        "bg-primary/10 px-5 py-4 backdrop-blur-sm",
        "sm:flex-row sm:items-center sm:justify-between sm:py-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center text-primary"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
          </svg>
        </span>
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-primary">
            {count} unmatched transaction{count !== 1 ? "s" : ""}
          </p>
          <p className="mt-1 text-muted-foreground">
            These transactions have no linked product. The checker cannot fully
            evaluate them.
          </p>
        </div>
      </div>
      <Link
        href="/transactions?status=unmatched"
        className="shrink-0 self-start text-sm font-semibold text-primary hover:text-primary/80 sm:self-center"
      >
        View →
      </Link>
    </div>
  );
}
