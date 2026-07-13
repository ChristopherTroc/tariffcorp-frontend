import { cn } from "@/app/utils/cn";

type BadgeVariant =
  | "default"
  | "matched"
  | "unmatched"
  | "destructive"
  | "rule"
  | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  matched: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  unmatched: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
  rule: "bg-muted text-foreground font-mono",
  muted: "bg-muted text-muted-foreground",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
