"use client";

import { cn } from "@/app/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={cn("flex items-center justify-center gap-2 mt-4", className)}
    >
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={[
          "px-3 py-1.5 text-sm rounded-md border border-border",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "hover:bg-muted transition-colors",
        ].join(" ")}
      >
        Previous
      </button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={[
          "px-3 py-1.5 text-sm rounded-md border border-border",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "hover:bg-muted transition-colors",
        ].join(" ")}
      >
        Next
      </button>
    </div>
  );
}
