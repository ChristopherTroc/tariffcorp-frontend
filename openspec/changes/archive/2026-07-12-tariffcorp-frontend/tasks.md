# Tasks: TariffCorp Frontend

## Task 1 — Project scaffold

**Goal:** Set up the Next.js project on top of the existing template. Configure environment, Vitest, and `next.config.js`.

**Files to create/modify:**
- `.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`
- `next.config.js` — add `experimental.optimizePackageImports` for any icon library used (e.g. `lucide-react`)
- `vitest.config.ts` — confirm jsdom environment, 80% coverage thresholds, path aliases
- `vitest.setup.ts` — RTL setup, any global mocks

**Acceptance:** `npm run dev` starts without errors; `npm test` runs (even with 0 tests); `npm run build` passes.

---

## Task 2 — Foundation layer: types, query keys, formatters

**Goal:** Establish the shared data contracts and utility functions that every other task depends on.

**Files to create:**
- `app/types/api.ts` — all interfaces from the PRD: `ITransaction`, `IProduct`, `IProductWithCount`, `IFinding`, `ITransactionDetail`, `IProductDetail`, `IDashboardStats`, `IPaginatedResponse<T>`, `IPaginatedMeta`, `IUpdateProductDto`, `TProductType`
- `app/constants/query-keys.ts` — `QUERY_KEYS` factory for all six resources
- `app/utils/format.ts` — `formatCurrency`, `formatDate`, `formatExposure`
- `app/utils/format.test.ts` — Vitest unit tests covering normal values, zero, negatives, edge cases

**Acceptance:** `npm test` passes all format tests; `npm run tsc` finds no errors in new files.

---

## Task 3 — HTTP hooks layer

**Goal:** One custom TanStack Query hook file per resource, each tested with a mocked `restClient`.

**Files to create:**
- `app/hooks/use-dashboard.ts` — `useDashboard()`
- `app/hooks/use-transactions.ts` — `useTransactions(filters?)`, `useTransactionDetail(id)`
- `app/hooks/use-products.ts` — `useProducts(filters?)`, `useProductDetail(id)`, `useUpdateProduct()` mutation
- `app/hooks/use-findings.ts` — `useFindings(filters?)`
- `app/hooks/use-dashboard.test.ts` — mock `restClient.get`, assert query returns data
- `app/hooks/use-transactions.test.ts` — test list + detail hooks
- `app/hooks/use-products.test.ts` — test list, detail, and mutation (including invalidation)
- `app/hooks/use-findings.test.ts` — test list hook

Mock pattern for all tests:
```typescript
vi.mock('@/app/services/http/rest', () => ({
  restClient: { get: vi.fn(), patch: vi.fn() },
}))
```

**Acceptance:** All hook tests pass; `useUpdateProduct` invalidates `productDetail` and `findings` keys on success.

---

## Task 4 — Shared layout: navigation + page shell + theme switching

**Goal:** Persistent top navigation with active state, responsive behavior, and manual light/dark theme toggle.

**Dependencies to install:** `next-themes`

**Files to create:**
- `app/providers.tsx` — `ThemeProvider` (attribute="class", defaultTheme="system", enableSystem) wrapping `QueryClientProvider`
- `app/components/ui/theme-toggle/theme-toggle.tsx` — sun icon (dark mode) / moon icon (light mode) button using `useTheme()`. Renders a `size-8` placeholder on server to avoid hydration mismatch; shows real button after `useEffect` mount.
- `app/components/ui/theme-toggle/index.ts` — barrel export
- `app/components/structure/nav/nav.tsx` — four links + `ThemeToggle` at right edge of desktop nav; toggle also visible on mobile alongside hamburger
- `app/components/structure/nav/nav.test.tsx` — assert all four links render; active link has correct class
- `app/components/structure/nav/index.ts` — barrel export
- `app/layout.tsx` — `Providers` (includes `ThemeProvider`) wrapping all children; `<Nav />`; max-width container
- `app/globals.css` — dark mode tokens under `.dark { }` (not `@media prefers-color-scheme`) so `next-themes` class strategy works correctly

**Acceptance:** Nav renders on all pages; active link updates on navigation; theme toggle switches between light/dark; OS default is respected on first load; layout is responsive at 768px.

---

## Task 5 — Dashboard page

**Goal:** Ten-second scan page consuming `GET /dashboard/stats`. All states handled. Typographic hierarchy serves both the CFO scan and the analyst drill-down.

**Files to create:**
- `app/components/ui/stat-card/` — `StatCard` component: label (`text-sm uppercase tracking-wide text-muted-foreground`), value (`text-3xl font-bold`), optional link. Skeleton variant.
- `app/components/ui/alert-card/` — `AlertCard` component: title, body copy, link. Variants: `warning` (amber tokens) and `danger` (`bg-destructive/10`).
- `app/views/dashboard/dashboard.tsx` — `ViewDashboard` ('use client'): calls `useDashboard()`, renders:
  - 4 KPI cards (Total Exposure, Duty Declared, Duty Owed, Open Findings)
  - Duty comparison card — `totalDutyDeclared` vs `totalDutyComputed` side-by-side with delta in `text-destructive font-bold`
  - Unmatched transactions alert card → links to `/transactions?status=unmatched`
  - 3 top-offender lists (by Broker, Port, Product)
- `app/views/dashboard/components/top-offenders-list.tsx` — ranked list rows: name left-aligned, exposure right-aligned in `text-destructive font-semibold`. Each row is a link.
- `app/views/dashboard/dashboard.test.tsx` — mock `useDashboard`, assert KPI values render formatted, assert duty gap comparison renders, assert links point to correct URLs, assert skeleton on loading, assert error state with retry button
- `app/(routes)/(public)/(home)/page.tsx` — renders `<ViewDashboard />`

**Tailwind notes:** KPI value `text-3xl font-bold`, label `text-sm uppercase tracking-wide text-muted-foreground`. Semantic tokens only — no literal colors.

**Acceptance:** Dashboard loads real data; all 3 states render correctly; duty declared vs. owed comparison is visible; every number links to the correct page.

---

## Task 6 — Transactions pages

**Goal:** Paginated list with URL-persisted filters and sorting + detail view with product/finding sections. Unmatched transactions are prominent, never hidden.

**Files to create:**

**List (`/transactions`):**
- `app/views/transactions/transactions.tsx` — `ViewTransactions` ('use client'): reads filters + sort from `useSearchParams`, calls `useTransactions(filters)`, renders filter bar + sortable `DataTable` + pagination
- `app/views/transactions/components/transaction-filters.tsx` — status select (All/Matched/Unmatched), broker input (debounced 300ms), port_of_entry input (debounced 300ms). Filter change resets page to 1.
- `app/views/transactions/components/transaction-row.tsx` — table row with status badge; unmatched rows `bg-amber-50`; clicking row navigates to `/transactions/:id`
- `app/views/transactions/transactions.test.tsx` — mock hook, assert filter UI, assert unmatched rows have amber background, assert pagination, assert sort param updates URL

Sort behavior: default sort is by finding exposure DESC (highest dollar risk first); fallback to date DESC for unmatched. Column headers for Date, Total Value, Duty Declared are clickable — toggle sort direction, reflect in URL (`?sort=totalValue&dir=desc`).

**Detail (`/transactions/:id`):**
- `app/views/transactions/transaction-detail.tsx` — `ViewTransactionDetail` ('use client'): calls `useTransactionDetail(id)`, renders:
  1. Transaction fields grid (`text-xs uppercase tracking-widest text-muted-foreground` labels, `text-base font-medium` values)
  2. Linked Product card — product fields + link to `/products/:id`. If null: amber callout "This transaction is not linked to any product. The checker cannot fully evaluate it." + link to products catalog
  3. Checker Finding card — rule ID badge + rule name, declared duty, computed duty, exposure gap (`text-2xl font-bold text-destructive` if positive). If null: muted empty state
- `app/views/transactions/transaction-detail.test.tsx` — test matched case, unmatched case (amber callout), no finding case, positive/negative gap coloring

**Routes:**
- `app/(routes)/(public)/transactions/page.tsx` — `<ViewTransactions />`
- `app/(routes)/(public)/transactions/[id]/page.tsx` — `<ViewTransactionDetail />`

**Acceptance:** Filters and sort params update URL and trigger refetch; unmatched callout shows correctly; duty gap red when positive, green when negative; default sort shows highest exposure first.

---

## Task 7 — Products pages

**Goal:** Catalog list with findings badge + detail with edit form (PATCH mutation, optimistic update).

**Files to create:**

**List (`/products`):**
- `app/views/products/products.tsx` — `ViewProducts` ('use client'): type filter + has_findings toggle (URL-persisted), `useProducts(filters)`, renders table with `openFindingsCount` badge
- `app/views/products/components/findings-count-badge.tsx` — `bg-destructive/10 text-destructive` if > 0; muted "—" if 0
- `app/views/products/products.test.tsx`

**Detail (`/products/:id`):**
- `app/views/products/product-detail.tsx` — `ViewProductDetail` ('use client'): `useProductDetail(id)`, product fields, Edit button, correction callout, linked transactions table, active findings list (exposure DESC)
- `app/views/products/components/edit-product-form.tsx` — fields: `importCode`, `countryOfOrigin`, `type` (enum select), `value`, `weight`, `unit`. Client-side validation (type enum, positive numbers). On submit: `useUpdateProduct()` mutation with optimistic update. Success/error toast on settle.
- `app/views/products/product-detail.test.tsx` — test product fields render, edit form submit, optimistic update, toast feedback

**Routes:**
- `app/(routes)/(public)/products/page.tsx`
- `app/(routes)/(public)/products/[id]/page.tsx`

**Acceptance:** Edit form validates before submit; optimistic update shows immediately; findings list and product detail both refresh after PATCH settles; "Fix Product" CTA visible on findings sub-list.

---

## Task 8 — Findings page

**Goal:** Full ledger ordered by exposure DESC with "Fix Product →" CTA per row.

**Files to create:**
- `app/views/findings/findings.tsx` — `ViewFindings` ('use client'): `useFindings(filters)`, table + pagination. No sort controls — exposure DESC is fixed.
- `app/views/findings/components/finding-row.tsx` — transaction link, product link, rule badge (R1/R2/R3 in `bg-muted text-xs rounded px-1.5`), duty declared, duty computed, exposure (`text-destructive` if > 0, `text-emerald-600` if < 0), "Fix Product →" button
- `app/views/findings/components/rule-badge.tsx` — R1/R2/R3 badge with rule name
- `app/views/findings/findings.test.tsx` — assert exposure colors, assert "Fix Product" links to correct product, assert pagination
- `app/(routes)/(public)/findings/page.tsx`

**Acceptance:** Findings load ordered by exposure DESC; positive exposure is red, negative is green; "Fix Product →" routes to `/products/:id`; pagination works.

---

## Task 9 — Polish: empty states, error boundaries, responsive review, golden path

**Goal:** Complete all three states on every async operation and verify the end-to-end golden path works in ≤4 clicks.

**Checklist:**
- [ ] Every list has: loading skeleton, error message + retry button, empty state copy
- [ ] Every detail has: loading skeleton, 404 not-found state, error fallback
- [ ] Every mutation has: loading indicator on button, success toast, error toast
- [ ] Responsive review at 768px, 1024px, 1440px — no broken layouts
- [ ] Golden path works end-to-end: Dashboard → top product → Edit → Save → findings refresh
- [ ] URL state: refresh on any filtered page restores filters and page number
- [ ] `npm run build` passes with no TS errors
- [ ] `npm test` passes with ≥80% coverage
- [ ] `npm run lint` passes

**Files to create/modify:**
- `app/components/ui/skeleton/` — reusable skeleton block and table skeleton
- `app/components/ui/error-state/` — inline error with retry callback
- `app/components/ui/empty-state/` — centered copy + optional CTA
- `app/components/ui/toast/` — success/error toast (or integrate existing template utility)
- Update any View missing one of the three states

**Acceptance:** All checklist items pass; golden path verified manually end-to-end.
