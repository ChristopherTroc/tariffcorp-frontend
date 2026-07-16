import { cn } from "@/app/utils/cn";

type BadgeVariant =
  | "default"
  | "matched"
  | "unmatched"
  | "destructive"
  | "rule"
  | "rule-r1"
  | "rule-r2"
  | "rule-r3"
  | "muted";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  matched:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  unmatched:
    "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
  // Fallback muted rule chip
  rule: "border border-border bg-muted font-mono text-foreground",
  // Figma rule colors: R1 gold/amber, R2 blue, R3 purple
  "rule-r1":
    "border border-primary/30 bg-primary/15 font-mono text-primary",
  "rule-r2":
    "border border-chart-2/30 bg-chart-2/15 font-mono text-chart-2",
  "rule-r3":
    "border border-chart-3/30 bg-chart-3/15 font-mono text-chart-3",
  muted: "bg-muted text-muted-foreground",
};

/** Map checker rule ids to Figma-aligned badge variants. */
export function ruleBadgeVariant(
  ruleId: "R1" | "R2" | "R3" | string | null | undefined,
): BadgeVariant {
  if (ruleId === "R1") return "rule-r1";
  if (ruleId === "R2") return "rule-r2";
  if (ruleId === "R3") return "rule-r3";
  return "rule";
}

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
