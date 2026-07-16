"use client";

import { useMemo } from "react";
import { useDashboard } from "@/app/hooks/use-dashboard";
import { useFindings } from "@/app/hooks/use-findings";
import { StatCard, StatCardSkeleton } from "@/app/components/ui/stat-card";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { TopOffendersList } from "./components/top-offenders-list";
import { TopProductsExposureList } from "./components/top-products-exposure-list";
import { UnmatchedBanner } from "./components/unmatched-banner";
import {
  ExposureByRuleChart,
  aggregateExposureByRule,
} from "./components/exposure-by-rule-chart";
import { formatCurrency } from "@/app/utils/format";

export function ViewDashboard() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const findingsQuery = useFindings({ page: 1, per_page: 100 });
  const stats = data?.data;

  const ruleExposure = useMemo(() => {
    const findings = findingsQuery.data?.data;
    if (!findings) return [];
    return aggregateExposureByRule(findings);
  }, [findingsQuery.data?.data]);

  const findingsBreakdown = useMemo(() => {
    const findings = findingsQuery.data?.data;
    if (!findings || findings.length === 0) return null;
    let under = 0;
    let over = 0;
    for (const f of findings) {
      if (f.exposure > 0) under += 1;
      else if (f.exposure < 0) over += 1;
    }
    return { under, over };
  }, [findingsQuery.data?.data]);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div>
          <div className="h-6 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="h-14 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load dashboard data."
        onRetry={() => void refetch()}
      />
    );
  }

  if (!stats) return null;

  if (
    stats.openFindingsCount === 0 &&
    stats.unmatchedTransactionsCount === 0 &&
    stats.totalExposure === 0
  ) {
    return (
      <EmptyState
        title="No compliance issues found."
        description="All declarations are within expected parameters."
      />
    );
  }

  const openFindingsDescription =
    findingsBreakdown != null
      ? `${findingsBreakdown.under} underpayments · ${findingsBreakdown.over} overpayments`
      : "Open checker findings";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Financial health across all import declarations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Exposure"
          value={formatCurrency(stats.totalExposure)}
          description="Underpaid duty across open findings"
          valueTone="destructive"
        />
        <StatCard
          label="Open Findings"
          value={stats.openFindingsCount}
          description={openFindingsDescription}
          href="/findings"
        />
        <StatCard
          label="Duty Declared"
          value={formatCurrency(stats.totalDutyDeclared)}
          description="Sum of all declared duties"
        />
        <StatCard
          label="Duty Owed"
          value={formatCurrency(stats.totalDutyComputed)}
          description="Checker-computed correct total"
        />
      </div>

      <UnmatchedBanner count={stats.unmatchedTransactionsCount} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ExposureByRuleChart
          items={ruleExposure}
          loading={findingsQuery.isLoading}
          unavailable={
            !findingsQuery.isLoading &&
            (findingsQuery.isError || ruleExposure.length === 0)
          }
        />
        <TopProductsExposureList items={stats.topOffenders.byProduct} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TopOffendersList
          title="Top Brokers by Exposure"
          items={stats.topOffenders.byBroker.map((b) => ({
            name: b.name,
            totalExposure: b.totalExposure,
            href: `/transactions?broker=${encodeURIComponent(b.name)}&q=${encodeURIComponent(b.name)}`,
          }))}
        />
        <TopOffendersList
          title="Top Ports by Exposure"
          items={stats.topOffenders.byPort.map((p) => ({
            name: p.name,
            totalExposure: p.totalExposure,
            href: `/transactions?port_of_entry=${encodeURIComponent(p.name)}&q=${encodeURIComponent(p.name)}`,
          }))}
        />
      </div>
    </div>
  );
}
