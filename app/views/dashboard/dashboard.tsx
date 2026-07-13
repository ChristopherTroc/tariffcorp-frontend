"use client";

import { useDashboard } from "@/app/hooks/use-dashboard";
import { StatCard, StatCardSkeleton } from "@/app/components/ui/stat-card";
import { AlertCard } from "@/app/components/ui/alert-card";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { TopOffendersList } from "./components/top-offenders-list";
import { formatCurrency } from "@/app/utils/format";

export function ViewDashboard() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const stats = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <StatCardSkeleton key={i} />
          ))}
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

  const exposureGap = stats.totalDutyComputed - stats.totalDutyDeclared;

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

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Financial health overview across all import declarations.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Exposure"
          value={formatCurrency(stats.totalExposure)}
        />
        <StatCard
          label="Duty Declared"
          value={formatCurrency(stats.totalDutyDeclared)}
        />
        <StatCard
          label="Duty Owed"
          value={formatCurrency(stats.totalDutyComputed)}
        />
        <StatCard
          label="Open Findings"
          value={stats.openFindingsCount}
          href="/findings"
        />
      </div>

      {/* Duty gap comparison + unmatched alerts */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Duty declared vs owed */}
        <div className="rounded-lg border border-border bg-card p-5">
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Duty Gap (Declared vs. Owed)
          </p>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Declared</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(stats.totalDutyDeclared)}
              </p>
            </div>
            <div className="text-muted-foreground text-lg">→</div>
            <div>
              <p className="text-xs text-muted-foreground">Owed</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(stats.totalDutyComputed)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-destructive">
            {exposureGap > 0 ? "+" : ""}
            {formatCurrency(exposureGap)} gap
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Additional duty owed across all findings
          </p>
        </div>

        {/* Unmatched transactions */}
        {stats.unmatchedTransactionsCount > 0 && (
          <AlertCard
            variant="warning"
            title={`${stats.unmatchedTransactionsCount} Unmatched Transaction${stats.unmatchedTransactionsCount !== 1 ? "s" : ""}`}
            body="Transactions without a linked product. The checker cannot fully evaluate these."
            href="/transactions?status=unmatched"
            linkLabel="View unmatched transactions →"
          />
        )}
      </div>

      {/* Top offenders */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Top Offenders
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TopOffendersList
            title="By Broker"
            items={stats.topOffenders.byBroker.map((b) => ({
              name: b.name,
              totalExposure: b.totalExposure,
              href: `/transactions?broker=${encodeURIComponent(b.name)}`,
            }))}
          />
          <TopOffendersList
            title="By Port"
            items={stats.topOffenders.byPort.map((p) => ({
              name: p.name,
              totalExposure: p.totalExposure,
              href: `/transactions?port_of_entry=${encodeURIComponent(p.name)}`,
            }))}
          />
          <TopOffendersList
            title="By Product"
            items={stats.topOffenders.byProduct.map((p) => ({
              name: p.name,
              totalExposure: p.totalExposure,
              href: `/products/${p.id}`,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
