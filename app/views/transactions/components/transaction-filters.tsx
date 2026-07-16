"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
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

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`/transactions?${params.toString()}`);
      });
    },
    [router, searchParams, startTransition],
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {STATUS_OPTIONS.map((opt) => {
        const active = status === opt.value;
        return (
          <button
            key={opt.value || "all"}
            type="button"
            onClick={() => updateParam("status", opt.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface TransactionSearchProps {
  className?: string;
}

/**
 * Header search — filters current page client-side via `q`.
 * Also surfaces dashboard deep-links (`broker` / `port_of_entry`) in the field;
 * editing or clearing search removes those server filters.
 */
export function TransactionSearch({ className }: TransactionSearchProps) {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const broker = searchParams.get("broker") ?? "";
  const portOfEntry = searchParams.get("port_of_entry") ?? "";
  const seeded = q || broker || portOfEntry;

  // Remount when URL seed changes from navigation (e.g. dashboard deep-link).
  return (
    <TransactionSearchInput
      key={seeded}
      initialValue={seeded}
      className={className}
    />
  );
}

function TransactionSearchInput({
  initialValue,
  className,
}: {
  initialValue: string;
  className?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(initialValue);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function pushQ(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set("q", next);
    else params.delete("q");
    // Clearing/changing search drops dashboard broker/port deep-link filters.
    params.delete("broker");
    params.delete("port_of_entry");
    params.delete("page");
    startTransition(() => {
      router.push(`/transactions?${params.toString()}`);
    });
  }

  return (
    <div className={cn("relative w-full max-w-xs", className)}>
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
        placeholder="Search ID, importer, broker..."
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => pushQ(next), 250);
        }}
        className={[
          "w-full rounded-md border border-border bg-card py-2 pr-3 pl-9 text-sm",
          "placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        ].join(" ")}
        aria-label="Search transactions on this page"
      />
    </div>
  );
}
