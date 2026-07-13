import Link from "next/link";
import { cn } from "@/app/utils/cn";

type AlertVariant = "warning" | "danger";

interface AlertCardProps {
  title: string;
  body: string;
  href?: string;
  linkLabel?: string;
  variant?: AlertVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  warning: "bg-card border-l-4 border-l-amber-500 border-t-border border-r-border border-b-border text-foreground dark:border-l-amber-400",
  danger:  "bg-card border-l-4 border-l-destructive border-t-border border-r-border border-b-border text-foreground",
};

const LINK_CLASSES: Record<AlertVariant, string> = {
  warning: "text-primary hover:text-primary/80 font-semibold underline",
  danger:  "text-destructive hover:text-destructive/80 font-semibold underline",
};

export function AlertCard({
  title,
  body,
  href,
  linkLabel = "View →",
  variant = "warning",
  className,
}: AlertCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-5",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {href && (
        <Link
          href={href}
          className={cn("mt-2 inline-block text-sm", LINK_CLASSES[variant])}
        >
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
