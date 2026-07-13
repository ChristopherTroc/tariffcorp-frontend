import Link from "next/link";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/app/utils/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  href?: string;
  className?: string;
}

export function StatCard({ label, value, href, className }: StatCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-6",
        href && "hover:border-primary/50 transition-colors cursor-pointer",
        className,
      )}
    >
      <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-3">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-9 w-36" />
    </div>
  );
}
