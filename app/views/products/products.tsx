"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useProducts } from "@/app/hooks/use-products";
import { Badge } from "@/app/components/ui/badge";
import { Pagination } from "@/app/components/ui/pagination";
import { SkeletonTable } from "@/app/components/ui/skeleton";
import { ErrorState } from "@/app/components/ui/error-state";
import { EmptyState } from "@/app/components/ui/empty-state";
import { formatCurrency } from "@/app/utils/format";
import type { IProductFilters, TProductType } from "@/app/types/api";
import { cn } from "@/app/utils/cn";

const PRODUCT_TYPES: TProductType[] = [
  "electronics",
  "consumable",
  "apparel",
  "furniture",
  "raw_material",
];

export function ViewProducts() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get("page") ?? 1);
  const type = (searchParams.get("type") ?? "") as TProductType | "";
  const hasFindings = searchParams.get("has_findings");

  const filters: IProductFilters = {
    page,
    per_page: 10,
    ...(type && { type }),
    ...(hasFindings === "true" && { has_findings: true }),
  };

  const { data, isLoading, isError, refetch } = useProducts(filters);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Products
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Master product catalog.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={type}
          onChange={(e) => updateParam("type", e.target.value)}
          className={[
            "px-3 py-1.5 text-sm rounded-md border border-border bg-background",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          ].join(" ")}
        >
          <option value="">All types</option>
          {PRODUCT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.replace("_", " ")}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            updateParam(
              "has_findings",
              hasFindings === "true" ? "" : "true",
            )
          }
          className={cn(
            "px-3 py-1.5 text-sm rounded-md border transition-colors font-medium",
            hasFindings === "true"
              ? "border-destructive bg-destructive/10 text-destructive"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {hasFindings === "true" ? "✓ With findings" : "With findings"}
        </button>
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
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {["ID", "Name", "Type", "Import Code", "Origin", "Value", "Open Findings"].map(
                      (col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.data.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-muted/40 transition-colors cursor-pointer"
                      onClick={() => router.push(`/products/${product.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">
                        {product.id}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground max-w-[180px] truncate">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-foreground capitalize">
                        {product.type.replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-foreground whitespace-nowrap">
                        {product.importCode}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                          {product.countryOfOrigin}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-foreground whitespace-nowrap">
                        {formatCurrency(product.value)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.openFindingsCount > 0 ? (
                          <Badge variant="destructive">
                            {product.openFindingsCount}
                          </Badge>
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

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{data.meta.total} products total</span>
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.total_pages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
