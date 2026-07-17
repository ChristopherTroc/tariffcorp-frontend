"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/app/utils/cn";
import { ThemeToggle } from "@/app/components/ui/theme-toggle";
import { useDashboard } from "@/app/hooks/use-dashboard";

const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/transactions", label: "Transactions", icon: TransactionsIcon },
  { href: "/products", label: "Products", icon: ProductsIcon },
  { href: "/findings", label: "Findings", icon: FindingsIcon },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const { data } = useDashboard();
  const openFindingsCount = data?.data?.openFindingsCount ?? 0;

  // Close the mobile drawer when the route changes (render-time adjust).
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (mobileOpen) setMobileOpen(false);
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Mobile top bar */}
      <div
        className={[
          "sticky top-0 z-40 flex h-14 items-center justify-between",
          "border-b border-border bg-sidebar px-4 md:hidden",
        ].join(" ")}
      >
        <Link href="/" className="flex items-center gap-2">
          <BrandMark />
          <span className="text-sm font-semibold text-sidebar-foreground">
            TariffCorp
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button
            type="button"
            className={[
              "rounded-md p-2 text-muted-foreground",
              "hover:bg-muted hover:text-foreground",
            ].join(" ")}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <MenuIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-background/60 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[196px] flex-col border-r border-border bg-sidebar",
          "transition-transform duration-200 md:static md:translate-x-0 md:shrink-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="border-b border-border px-[17px] py-4">
          <Link href="/" className="flex items-center gap-[7px]">
            <BrandMark />
            <span className="text-[12.25px] font-semibold tracking-tight text-sidebar-foreground">
              TariffCorp
            </span>
          </Link>
          <p className="mt-1 font-mono text-[11px] tracking-wide text-muted-foreground uppercase">
            Compliance Intelligence
          </p>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 px-[10px] py-3.5">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            const showBadge = href === "/findings" && openFindingsCount > 0;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-[3.5px] px-[10px] py-[7px] text-[12.25px] font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="flex items-center gap-[9px]">
                  <Icon className="size-[15px] shrink-0" />
                  {label}
                </span>
                {showBadge && (
                  <span
                    className={[
                      "rounded-[3.5px] border border-destructive/25",
                      "bg-destructive/15 px-1.5 py-0.5",
                      "font-mono text-[10px] text-destructive",
                    ].join(" ")}
                  >
                    {openFindingsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-border px-3.5 py-3.5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[1px] text-muted-foreground uppercase">
                Align 
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                Single-tenant · Read-only
              </p>
            </div>
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function BrandMark() {
  return (
    <span className="flex size-[21px] items-center justify-center rounded-[3.5px] bg-primary">
      <svg
        viewBox="0 0 16 16"
        className="size-[13px] text-primary-foreground"
        fill="currentColor"
        aria-hidden
      >
        <path d="M2 3.5h12v2H9.5V13h-3V5.5H2v-2z" />
      </svg>
    </span>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      )}
    </svg>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function TransactionsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  );
}

function ProductsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.3 7L12 12l8.7-5M12 22V12" />
    </svg>
  );
}

function FindingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}
