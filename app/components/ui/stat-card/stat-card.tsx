import Link from "next/link";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/app/utils/cn";

type ValueTone = "default" | "destructive";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  href?: string;
  valueTone?: ValueTone;
  className?: string;
}

const VALUE_TONE_CLASS: Record<ValueTone, string> = {
  default: "text-foreground",
  destructive: "text-destructive",
};

export function StatCard({
  label,
  value,
  description,
  href,
  valueTone = "default",
  className,
}: StatCardProps) {
  const content = (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-5",
        href && "cursor-pointer transition-colors hover:border-primary/50",
        className,
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold tracking-tight sm:text-3xl",
          VALUE_TONE_CLASS[valueTone],
        )}
      >
        {value}
      </p>
      {description && (
        <p className="mt-1.5 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export function StatCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}
