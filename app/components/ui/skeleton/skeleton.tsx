import { cn } from "@/app/utils/cn";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      aria-hidden="true"
    />
  );
}

export function SkeletonTable({
  rows = 5,
  rowHeight = "h-11",
}: {
  rows?: number;
  rowHeight?: string;
}) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={cn("w-full", rowHeight)} />
      ))}
    </div>
  );
}
