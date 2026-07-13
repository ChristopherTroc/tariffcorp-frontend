"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { cn } from "@/app/utils/cn";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "matched", label: "Matched" },
  { value: "unmatched", label: "Unmatched" },
] as const;

export function TransactionFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const status = searchParams.get("status") ?? "";
  const broker = searchParams.get("broker") ?? "";
  const portOfEntry = searchParams.get("port_of_entry") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page"); // reset to page 1 on filter change
      startTransition(() => {
        router.push(`/transactions?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Status filter */}
      <div className="flex gap-1 rounded-md border border-border p-1 bg-muted">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => updateParam("status", opt.value)}
            className={cn(
              "px-3 py-1 text-sm rounded font-medium transition-colors",
              status === opt.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Broker filter */}
      <input
        type="text"
        placeholder="Filter by broker…"
        defaultValue={broker}
        onChange={(e) => {
          const val = e.target.value;
          const timer = setTimeout(() => updateParam("broker", val), 300);
          return () => clearTimeout(timer);
        }}
        className={[
          "px-3 py-1.5 text-sm rounded-md border border-border bg-background",
          "placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
        ].join(" ")}
      />

      {/* Port filter */}
      <input
        type="text"
        placeholder="Filter by port…"
        defaultValue={portOfEntry}
        onChange={(e) => {
          const val = e.target.value;
          const timer = setTimeout(() => updateParam("port_of_entry", val), 300);
          return () => clearTimeout(timer);
        }}
        className={[
          "px-3 py-1.5 text-sm rounded-md border border-border bg-background",
          "placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
        ].join(" ")}
      />
    </div>
  );
}
