# TariffCorp — Frontend

Trade compliance web application. Surfaces financial exposure across import declarations, products, and checker findings — making the highest-leverage corrections obvious and actionable.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev
```

The app runs at `http://localhost:3000`.

> Requires the backend API running at `http://localhost:3001`. See `../backend/README.md` for setup instructions.

---

## Environment

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

This is already set by default — only change it if the backend runs on a different port.

---

## Pages

| Page | URL | Job |
|------|-----|-----|
| **Dashboard** | `/` | Ten-second financial health scan. KPIs, duty gap, top offenders by broker/port/product. Every number links to its source records. |
| **Transactions** | `/transactions` | All import declarations. Filter by status, broker, port. Unmatched transactions (no linked product) are surfaced prominently. |
| **Transaction detail** | `/transactions/:id` | Declared fields, linked product, checker finding, duty gap. |
| **Products** | `/products` | Master catalog with open findings count per product. Filter by type or findings. |
| **Product detail** | `/products/:id` | Classification fields, edit form, linked transactions, active findings. Editing a product immediately re-evaluates the checker for all linked transactions. |
| **Findings** | `/findings` | Complete checker ledger, always ordered by exposure descending. "Fix Product →" CTA per row. |

---

## Golden Path (≤4 clicks)

```
Dashboard
  → Click a product in "By Product" top offenders
      → Product detail (/products/:id)
          → Click "Edit Product" → change a field → Save
              → Toast "Product updated. Findings re-evaluated."
                  → Findings refresh automatically
```

---

## Architecture

**Next.js 16 App Router** with the coordinator pattern — route files are minimal, all orchestration lives in View components under `app/views/`.

```
app/
├── (routes)/ (public)/      # Route files — render Views only
├── views/                   # Page coordinators (one per page)
├── hooks/                   # TanStack Query hooks (one per resource)
├── components/
│   ├── structure/nav/       # Persistent navigation + theme toggle
│   └── ui/                  # Shared components (badge, skeleton, etc.)
├── services/http/rest.ts    # HTTP client (restClient)
├── types/api.ts             # All API TypeScript interfaces
├── constants/query-keys.ts  # TanStack Query key factory
└── utils/format.ts          # formatCurrency, formatDate, formatExposure
```

---

## Key Decisions

**TanStack Query** for all server state — handles loading, error, and stale states declaratively. `staleTime: 30s` on all queries. Mutations invalidate related queries in `onSuccess`.

**Coordinator pattern** — Views orchestrate data and components. Route `page.tsx` files are one-liners. This keeps pages testable and composable.

**Tailwind CSS v4 with semantic tokens** — all colors use CSS variables (`bg-card`, `text-destructive`, `border-border`) so light/dark mode switching is automatic. No hardcoded color values in components.

**Theme switching via `next-themes`** — defaults to OS preference (`prefers-color-scheme`). Manual toggle (sun/moon) in the nav bar persists to `localStorage`. `suppressHydrationWarning` on `<html>` prevents React hydration mismatch.

**URL-persisted filters** — all filter and pagination state lives in the URL query string. A page refresh restores the exact same view.

**`optimizePackageImports`** in `next.config.ts` — prevents full icon library bundles from loading on import.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Server state | TanStack Query v5 |
| HTTP client | Custom `restClient` (fetch wrapper) |
| Theme | next-themes |
| Testing | Vitest + React Testing Library |

---

## Tests

```bash
npm test              # Run full suite
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

49 tests covering format utilities, TanStack Query hooks (mocked `restClient`), and View components.

---

## Available Scripts

```bash
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm run start        # Production server
npm run tsc          # TypeScript check (no emit)
npm run lint         # ESLint
npm test             # Vitest
npm run test:watch   # Vitest watch
npm run test:coverage # Coverage report
```

---

## Known Limitations

- Transactions list sort (by exposure) is done client-side — the backend does not expose a sort parameter for transactions
- Product detail returns all linked transactions and findings without pagination
- No optimistic update on the findings ledger during product edit — the list refetches after the mutation settles
- Dashboard aggregates recomputed on every request — no caching layer on the backend

---

## Design

UI based on the Figma designs: [TarifCorp](https://www.figma.com/design/8efC3uSGdXhCLXFl4NmwKE/TarifCorp?m=auto&t=yPcgQYaY9w6Jg1Ux-1)

## Notes

Planning and change workflow used OpenSpec.
