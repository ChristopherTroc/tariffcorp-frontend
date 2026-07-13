import Link from "next/link";
import { cn } from "@/app/utils/cn";

interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <p className="text-base font-medium text-foreground">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      )}
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className={[
            "mt-4 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md",
            "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
          ].join(" ")}
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
