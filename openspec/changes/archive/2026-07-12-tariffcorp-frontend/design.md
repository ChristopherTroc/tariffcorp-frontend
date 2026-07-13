# Design: TariffCorp Frontend

## Architecture Overview

Next.js App Router with the **coordinator pattern** from the existing template. Route files are minimal; all orchestration lives in View components. Client-side server state managed by TanStack Query via the pre-configured `restClient` adapter.

```
app/
├── (routes)/
│   └── (public)/
│       ├── (home)/page.tsx           → ViewDashboard
│       ├── transactions/
│       │   ├── page.tsx              → ViewTransactions
│       │   └── [id]/page.tsx         → ViewTransactionDetail
│       ├── products/
│       │   ├── page.tsx              → ViewProducts
│       │   └── [id]/page.tsx         → ViewProductDetail
│       └── findings/page.tsx         → ViewFindings
├── components/
│   ├── structure/
│   │   └── nav/                      # top navigation
│   └── ui/
│       ├── stat-card/                # KPI cards
│       ├── alert-card/               # unmatched / gap alerts
│       ├── data-table/               # reusable paginated table
│       ├── badge/                    # status, rule, findings-count badges
│       ├── skeleton/                 # loading placeholders
│       └── toast/                    # success/error feedback
├── views/
│   ├── dashboard/
│   ├── transactions/
│   ├── products/
│   └── findings/
├── hooks/
│   ├── use-dashboard.ts
│   ├── use-transactions.ts
│   ├── use-products.ts
│   └── use-findings.ts
├── types/api.ts
├── constants/query-keys.ts
└── utils/format.ts
```

## Styling Conventions (Tailwind CSS v4)

- **Semantic tokens only** — never literal colors (`bg-white`, `bg-blue-500`). Use `bg-background`, `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-primary`, `bg-destructive`, etc.
- **Mobile-first** — base classes for mobile, `md:` / `lg:` for larger viewports.
- **v4 utilities** — `size-*` over `w-* h-*`, `h-dvh`, `text-balance`, `text-pretty`, `@container` where applicable.
- **Class strings** — strings over 100 chars broken into arrays joined with `cn()`. Static class names only — no interpolated `bg-${color}-500`.
- **`focus-visible:`** for keyboard focus rings, not `focus:`.
- **`tailwind-merge`** (`cn()`) for all conditional class composition.

Domain-specific color semantics:
| Concept | Token |
|---------|-------|
| Positive exposure (underpaid) | `text-destructive` / `bg-destructive/10` |
| Negative exposure (overpaid) | `text-emerald-600` / `bg-emerald-50` (or semantic equivalent) |
| Unmatched transaction | `bg-amber-50 border-amber-200 text-amber-800` |
| Matched / healthy | `bg-emerald-50 text-emerald-700` |
| Rule badge R1 | `bg-primary/10 text-primary` |
| Rule badge R2 | `bg-secondary/10 text-secondary-foreground` |
| Rule badge R3 | `bg-accent/10 text-accent-foreground` |

## Data Layer

### TypeScript types (`app/types/api.ts`)

All API response shapes as interfaces with `I` prefix. Key types:

```typescript
ITransaction, IProduct, IProductWithCount, IFinding,
ITransactionDetail, IProductDetail, IDashboardStats,
IPaginatedResponse<T>, IPaginatedMeta, IUpdateProductDto,
TProductType
```

### Query key factory (`app/constants/query-keys.ts`)

```typescript
export const QUERY_KEYS = {
  dashboard:         ()           => ['dashboard', 'stats']  as const,
  transactions:      (f?: object) => ['transactions', f]     as const,
  transactionDetail: (id: string) => ['transactions', id]    as const,
  products:          (f?: object) => ['products', f]         as const,
  productDetail:     (id: string) => ['products', id]        as const,
  findings:          (f?: object) => ['findings', f]         as const,
}
```

### Custom hooks (`app/hooks/`)

One file per resource. All hooks use `restClient` from `@/app/services/http/rest`. `staleTime: 30_000` on all queries. Mutations invalidate related keys in `onSuccess`.

```typescript
// use-dashboard.ts
export function useDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(),
    queryFn: () => restClient.get<{ data: IDashboardStats }>('/dashboard/stats'),
    staleTime: 30_000,
  })
}

// use-products.ts
export function useProducts(filters?: IProductFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.products(filters),
    queryFn: () => restClient.get<IPaginatedResponse<IProductWithCount>>('/products', { params: filters }),
    staleTime: 30_000,
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateProductDto }) =>
      restClient.patch<{ data: IProduct }>(`/products/${id}`, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.productDetail(id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.findings() })
    },
  })
}
```

## Utility Functions (`app/utils/format.ts`)

Pure functions, no DOM, fully unit-tested:

```typescript
formatCurrency(value: number): string  // "$1,234.56"
formatDate(iso: string): string        // "Apr 12, 2026"
formatExposure(value: number): string  // "+$100.00" or "-$50.00"
```

## Page Designs

### Dashboard (`/`)

Single `useQuery` call for `GET /dashboard/stats` — no waterfall risk.

```
┌──────────────────────────────────────────────────────────────┐
│  Total Exposure │ Duty Declared │ Duty Owed │ Open Findings  │
├──────────────────────────────────────────────────────────────┤
│  [Duty Gap: Declared vs. Owed]   [Unmatched Transactions]   │
├──────────────────────────────────────────────────────────────┤
│  Top Brokers        │  Top Ports       │  Top Products       │
└──────────────────────────────────────────────────────────────┘
```

**Typographic hierarchy** (serves both the 10-second scan and the detailed read):
- KPI value: `text-3xl font-bold tracking-tight text-foreground`
- KPI label: `text-sm font-medium text-muted-foreground uppercase tracking-wide`
- Section headers: `text-lg font-semibold text-foreground`
- Offender rows: `text-sm text-foreground` + exposure `text-destructive font-semibold`

**Comparison card — Duty Declared vs. Owed:**
Shows `totalDutyDeclared` and `totalDutyComputed` side-by-side with the delta (`totalDutyComputed - totalDutyDeclared`) prominently in `text-destructive` if positive. This is the financial gap signal that substitutes for a "vs last month" comparison (not available from the API).

- KPI cards: `bg-card border-border rounded-lg`, value in `text-3xl font-bold`, label in `text-muted-foreground text-sm uppercase tracking-wide`
- Alert cards: `bg-amber-50 border-amber-200` (unmatched) / `bg-destructive/10 border-destructive/20` (gap)
- Top offenders: each row `flex justify-between`, exposure right-aligned in `text-destructive font-semibold`
- Loading: skeleton placeholders matching card dimensions
- Empty: centered copy in `text-muted-foreground`

### Transactions (`/transactions`)

Filters bar above table. Filters and active sort persisted in URL via `useSearchParams`. Debounce 300ms on text inputs.

Table columns: ID | Date | Importer | Broker | Port | Origin | Units | Total Value | Duty Declared | Status

- **Default sort:** transactions with a linked finding sorted by `exposure DESC` first (highest dollar impact); unmatched transactions follow. Chronological sort available as secondary option via column header click.
- Sortable columns: Date, Total Value, Duty Declared — sort direction reflected in URL (`?sort=totalValue&dir=desc`)
- Unmatched rows: `bg-amber-50` — visually distinct, never filtered out by default
- Status badge: `bg-emerald-100 text-emerald-700` (matched) / `bg-amber-100 text-amber-700` (unmatched)
- Pagination controls below table

### Transaction Detail (`/transactions/:id`)

`GET /transactions/:id` returns transaction + product + finding in a single call — no waterfall.

**Typographic hierarchy for detail view** (studied for minutes, not scanned in seconds):
- Section label: `text-xs font-medium text-muted-foreground uppercase tracking-widest`
- Field value: `text-base font-medium text-foreground`
- Gap / exposure amount: `text-2xl font-bold text-destructive` (if positive) or `text-emerald-600` (if negative)

Three sections stacked vertically:
1. **Transaction fields** — grid of labeled value pairs
2. **Linked Product** — card with product fields + link to `/products/:id`. If null: amber callout — "This transaction is not linked to any product. The checker cannot fully evaluate it." with a link to the products catalog
3. **Checker Finding** — rule badge + rule name + duty declared / computed / gap breakdown. Gap in `text-destructive` font-bold if positive. If null: muted empty state — "No finding computed for this transaction."

### Products (`/products`)

Filters: `type` select + `has_findings` toggle, URL-persisted.
Default sort: `openFindingsCount` DESC (passed as API param).

Table columns: ID | Name | Type | Import Code | Origin | Value | Open Findings

- Findings badge: `bg-destructive/10 text-destructive` if > 0; muted "—" if 0

### Product Detail (`/products/:id`)

`GET /products/:id` returns product + transactions + findings in one call.

Layout:
```
┌──────────────────────────────────────────┐
│  Product fields          [Edit button]   │
│  Correction callout                      │
├──────────────────────────────────────────┤
│  Linked Transactions table               │
├──────────────────────────────────────────┤
│  Active Findings (exposure DESC)         │
└──────────────────────────────────────────┘
```

Edit form fields: `importCode`, `countryOfOrigin`, `type` (enum select), `value`, `weight`, `unit`. Client-side validation before submit. On save: optimistic update → `PATCH` → invalidate queries → toast.

### Findings (`/findings`)

`GET /findings` — always `exposure DESC` (backend enforces it).

Table columns: Transaction | Product | Rule | Duty Declared | Duty Computed | Exposure

- Exposure: `text-destructive font-medium` if > 0; `text-emerald-600` if < 0
- Rule badge: ID (R1/R2/R3) in `bg-muted rounded text-xs px-1.5 py-0.5` + name
- "Fix Product →" button per row: `bg-primary text-primary-foreground` small button → `/products/:id`

## Information Architecture

Each page has a single job. Cross-links are mandatory, not aspirational:

| From | To | Via |
|------|----|-----|
| Dashboard KPI | Filtered list | Link on every number |
| Dashboard top offender (product) | Product detail | Row click |
| Dashboard top offender (broker) | Transactions filtered by broker | Row click |
| Transaction list row | Transaction detail | Row click |
| Transaction detail | Product detail | Linked Product card link |
| Transaction detail | Findings (filtered) | Finding card link |
| Product list row | Product detail | Row click |
| Product detail finding | Transaction detail | Finding row link |
| Product detail | Edit form | Edit button |
| Findings row | Transaction detail | Transaction link |
| Findings row | Product detail (edit) | "Fix Product →" CTA |

**Rule editor:** The backend has three hardcoded rules (R1/R2/R3). Adding or editing rules is **out of scope** for this challenge. The rule name and ID are surfaced read-only in transaction detail and findings views.

## Theme Switching

Implemented via `next-themes` with `attribute="class"` and `defaultTheme="system"`.

- **Default:** respects OS `prefers-color-scheme` — dark if the system is dark, light if light.
- **Manual override:** `ThemeToggle` button in the nav bar (sun icon in dark mode, moon icon in light mode). Clicking toggles between `light` and `dark` and persists the choice in `localStorage`.
- **Token strategy:** dark mode tokens defined under `.dark { }` in `globals.css` (not `@media`). `next-themes` adds/removes the `dark` class on `<html>`.
- **Hydration safety:** `ThemeToggle` renders a placeholder `size-8` div on the server and defers the real button until after mount (`useEffect`) to prevent React hydration mismatch.

```
app/
├── providers.tsx                          # ThemeProvider wraps QueryClientProvider
├── components/
│   └── ui/
│       └── theme-toggle/
│           ├── theme-toggle.tsx           # sun/moon button using useTheme()
│           └── index.ts
└── components/
    └── structure/
        └── nav/nav.tsx                    # ThemeToggle injected next to nav links
```

## Navigation

Persistent top nav in `app/components/structure/nav/`:
- Links: Dashboard | Transactions | Products | Findings
- Active: `text-primary border-b-2 border-primary`
- Inactive: `text-muted-foreground hover:text-foreground`
- **Theme toggle** — sun/moon button at the right edge of the desktop nav; visible alongside hamburger on mobile
- Mobile: collapses to hamburger menu at `sm:`; theme toggle remains visible at all viewport sizes

## Responsive Layout

| Breakpoint | KPI cards | Top offenders | Table |
|------------|-----------|--------------|-------|
| base (mobile) | 1 col stacked | stacked | horizontal scroll |
| `md` (768px) | 2×2 grid | 1 col stacked | full |
| `lg` (1024px) | 4 in a row | 3 side-by-side | full |
| `xl` (1440px) | 4 in a row, max-width centered | 3 side-by-side | full |

## Testing Strategy

- `app/utils/format.ts` — pure unit tests, no DOM
- `app/hooks/*.ts` — `vi.mock('@/app/services/http/rest')`, test query behavior
- `app/components/ui/**` — RTL with semantic queries (`getByRole`, `getByText`)
- `app/views/**` — integration tests with mocked hooks, assert rendered output
- 80% coverage threshold enforced by `vitest.config.ts`
