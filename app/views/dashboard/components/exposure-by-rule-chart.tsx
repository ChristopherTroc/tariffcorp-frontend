"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import { formatCurrency } from "@/app/utils/format";
import { Skeleton } from "@/app/components/ui/skeleton";
import { cn } from "@/app/utils/cn";

export type RuleId = "R1" | "R2" | "R3";

export interface RuleExposure {
  ruleId: RuleId;
  label: string;
  totalExposure: number;
}

const RULE_ORDER: RuleId[] = ["R1", "R2", "R3"];

const RULE_BAR_CLASS: Record<RuleId, string> = {
  R1: "bg-chart-1",
  R2: "bg-chart-2",
  R3: "bg-chart-3",
};

const SHORT_LABEL: Record<RuleId, string> = {
  R1: "R1 — Asian flat",
  R2: "R2 — Russia vol.",
  R3: "R3 — EU consump.",
};

const TOOLTIP_OFFSET_X = 14;
const TOOLTIP_OFFSET_Y = 12;

interface ExposureByRuleChartProps {
  items: RuleExposure[];
  loading?: boolean;
  unavailable?: boolean;
}

interface TooltipState {
  ruleId: RuleId;
  totalExposure: number;
  x: number;
  y: number;
}

export function ExposureByRuleChart({
  items,
  loading,
  unavailable,
}: ExposureByRuleChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const byRule = new Map(items.map((i) => [i.ruleId, i]));
  const series = RULE_ORDER.map((ruleId) => {
    const found = byRule.get(ruleId);
    return {
      ruleId,
      label: found?.label ?? SHORT_LABEL[ruleId],
      totalExposure: found?.totalExposure ?? 0,
    };
  });
  const max = Math.max(...series.map((s) => s.totalExposure), 0);
  const hasData = series.some((s) => s.totalExposure > 0);

  function showTooltip(
    event: MouseEvent,
    ruleId: RuleId,
    totalExposure: number,
  ) {
    setTooltip({
      ruleId,
      totalExposure,
      x: event.clientX + TOOLTIP_OFFSET_X,
      y: event.clientY + TOOLTIP_OFFSET_Y,
    });
  }

  function moveTooltip(event: MouseEvent) {
    setTooltip((prev) =>
      prev
        ? {
            ...prev,
            x: event.clientX + TOOLTIP_OFFSET_X,
            y: event.clientY + TOOLTIP_OFFSET_Y,
          }
        : prev,
    );
  }

  function hideTooltip() {
    setTooltip(null);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Exposure by Rule
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Underpaid duty grouped by rule trigger.
      </p>

      {loading ? (
        <div className="mt-6 flex h-40 items-end justify-around gap-6 px-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-full w-11" />
          ))}
        </div>
      ) : unavailable || !hasData ? (
        <p className="mt-8 py-10 text-center text-sm text-muted-foreground">
          Rule exposure unavailable
        </p>
      ) : (
        <>
          <div className="mt-6 flex h-44 items-end justify-around gap-6 px-4 sm:px-8">
            {series.map((item) => {
              const heightPct =
                max > 0 ? Math.max(8, (item.totalExposure / max) * 100) : 8;
              return (
                <Link
                  key={item.ruleId}
                  href={`/findings?rule=${item.ruleId}`}
                  className="group flex h-full w-16 flex-col items-center justify-end gap-2"
                >
                  <div className="flex w-full flex-1 items-end justify-center">
                    <div
                      className={cn(
                        "w-10 rounded-t-sm transition-[filter] duration-150",
                        "hover:brightness-110 sm:w-11",
                        RULE_BAR_CLASS[item.ruleId],
                      )}
                      style={{ height: `${heightPct}%` }}
                      onMouseEnter={(e) =>
                        showTooltip(e, item.ruleId, item.totalExposure)
                      }
                      onMouseMove={moveTooltip}
                      onMouseLeave={hideTooltip}
                    />
                  </div>
                  <span className="text-center text-[11px] leading-tight text-muted-foreground">
                    {SHORT_LABEL[item.ruleId]}
                  </span>
                </Link>
              );
            })}
          </div>

          {tooltip && (
            <div
              className={[
                "pointer-events-none fixed z-50 rounded-md border border-border/40",
                "bg-background/50 px-2.5 py-1.5 text-center shadow-sm backdrop-blur-md",
              ].join(" ")}
              style={{ left: tooltip.x, top: tooltip.y }}
              role="tooltip"
            >
              <span className="block text-xs font-semibold text-destructive">
                {formatCurrency(tooltip.totalExposure)}
              </span>
              <span className="mt-0.5 block text-[10px] text-muted-foreground">
                Underpaid · View findings
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function aggregateExposureByRule(
  findings: Array<{ ruleId: string | null; exposure: number }>,
): RuleExposure[] {
  const totals: Record<RuleId, number> = { R1: 0, R2: 0, R3: 0 };
  let sawRule = false;

  for (const f of findings) {
    if (f.ruleId !== "R1" && f.ruleId !== "R2" && f.ruleId !== "R3") continue;
    sawRule = true;
    // Underpaid duty only (positive exposure)
    if (f.exposure > 0) {
      totals[f.ruleId] += f.exposure;
    }
  }

  if (!sawRule) return [];

  return RULE_ORDER.map((ruleId) => ({
    ruleId,
    label: SHORT_LABEL[ruleId],
    totalExposure: totals[ruleId],
  }));
}
