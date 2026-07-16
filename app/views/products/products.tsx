"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "@/app/hooks/use-products";
import { Pagination } from "@/app/components/ui/pagination";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { formatCurrency } from "@/app/utils/format";
import type { IProductFilters, IProductWithCount, TProductType } from "@/app/types/api";
import { cn } from "@/app/utils/cn";

function ProductSearchInput({
  initialValue,
  onSearch,
}: {
  initialValue: string;
  onSearch: (value: string) => void;
}) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, []);

  return (
    <div className="relative w-full max-w-xs">
      <svg
        className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        placeholder="Search name or code..."
        value={searchValue}
        onChange={(e) => {
          const val = e.target.value;
          setSearchValue(val);
          if (searchTimer.current) clearTimeout(searchTimer.current);
          searchTimer.current = setTimeout(() => onSearch(val), 250);
        }}
        className={[
          "w-full rounded-md border border-border bg-card py-2 pr-3 pl-9 text-sm",
          "placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ].join(" ")}
        aria-label="Search products on this page"
      />
    </div>
  );
}

const PRODUCT_TYPES: TProductType[] = [
  "apparel",
  "consumable",
  "electronics",
  "furniture",
  "raw_material",
];

const TYPE_LABEL: Record<TProductType, string> = {
  apparel: "Apparel",
  consumable: "Consumable",
  electronics: "Electronics",
  furniture: "Furniture",
  raw_material: "Raw Material",
};

function matchesSearch(product: IProductWithCount, q: string): boolean {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  return (
    product.id.toLowerCase().includes(needle) ||
    product.name.toLowerCase().includes(needle) ||
    product.importCode.toLowerCase().includes(needle)
  );
}

export function ViewProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const page = Number(searchParams.get("page") ?? 1);
  const type = (searchParams.get("type") ?? "") as TProductType | "";
  const hasFindings = searchParams.get("has_findings");
  const q = searchParams.get("q") ?? "";

  const filters: IProductFilters = {
    page,
    per_page: 10,
    ...(type && { type }),
    ...(hasFindings === "true" && { has_findings: true }),
  };

  const { data, isLoading, isError, refetch } = useProducts(filters);

  const visibleRows = useMemo(() => {
    const rows = data?.data ?? [];
    return rows.filter((p) => matchesSearch(p, q));
  }, [data?.data, q]);

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  }

  function handlePageChange(newPage: number) {
    pushParams((params) => {
      params.set("page", String(newPage));
    });
  }

  const total = data?.meta.total;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            Products
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Master catalog
            {typeof total === "number" ? ` — ${total} SKUs` : ""}
          </p>
        </div>
        <ProductSearchInput
          key={q}
          initialValue={q}
          onSearch={(val) => {
            pushParams((params) => {
              if (val) params.set("q", val);
              else params.delete("q");
            });
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip
          active={!type}
          onClick={() =>
            pushParams((params) => {
              params.delete("type");
              params.delete("page");
            })
          }
        >
          All types
        </FilterChip>
        {PRODUCT_TYPES.map((t) => (
          <FilterChip
            key={t}
            active={type === t}
            onClick={() =>
              pushParams((params) => {
                params.set("type", t);
                params.delete("page");
              })
            }
          >
            {TYPE_LABEL[t]}
          </FilterChip>
        ))}
        <FilterChip
          active={hasFindings === "true"}
          tone="destructive"
          onClick={() =>
            pushParams((params) => {
              if (hasFindings === "true") params.delete("has_findings");
              else params.set("has_findings", "true");
              params.delete("page");
            })
          }
        >
          With findings
        </FilterChip>
      </div>

      {isLoading && <SkeletonTable rows={10} rowHeight="h-11" />}
      {isError && (
        <ErrorState
          message="Failed to load products."
          onRetry={() => void refetch()}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.data.length === 0 ? (
            <EmptyState
              title="No products found."
              description="Try adjusting your filters."
            />
          ) : visibleRows.length === 0 ? (
            <EmptyState
              title="No matches on this page."
              description="Search only filters the current page. Clear search or change filters."
            />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      "ID",
                      "Name",
                      "Type",
                      "Import Code",
                      "Origin",
                      "Value / Unit",
                      "Open Findings",
                    ].map((col) => (
                      <th
                        key={col}
                        className={cn(
                          "px-3 py-2.5 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase whitespace-nowrap",
                          (col === "Value / Unit" || col === "Open Findings") &&
                            "text-right",
                        )}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleRows.map((product) => (
                    <tr
                      key={product.id}
                      className="cursor-pointer transition-colors hover:bg-muted/40"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <td className="px-3 py-2.5 font-mono text-xs font-medium whitespace-nowrap text-primary">
                        {product.id}
                      </td>
                      <td className="max-w-[180px] truncate px-3 py-2.5 font-medium text-foreground">
                        {product.name}
                      </td>
                      <td className="px-3 py-2.5 capitalize text-foreground">
                        {product.type.replace("_", " ")}
                      </td>
                      <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap text-foreground">
                        {product.importCode}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          {product.countryOfOrigin}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap text-foreground">
                        {formatCurrency(product.value)}
                        <span className="ml-1 text-xs text-muted-foreground">
                          / {product.unit}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        {product.openFindingsCount > 0 ? (
                          <span className="font-semibold text-destructive">
                            [{product.openFindingsCount}]
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <span>{data.meta.total} total</span>
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.total_pages}
              onPageChange={handlePageChange}
              className="mt-0"
            />
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({
  children,
  active,
  onClick,
  tone = "primary",
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  tone?: "primary" | "destructive";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? tone === "destructive"
            ? "border-destructive bg-destructive/10 text-destructive"
            : "border-primary bg-primary/10 text-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
