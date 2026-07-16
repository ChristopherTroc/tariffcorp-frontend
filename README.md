# TariffCorp — Frontend

Trade compliance web application. Surfaces financial exposure across import declarations, products, and checker findings — making the highest-leverage corrections obvious and actionable.

## Design

UI based on the Figma designs: [TarifCorp](https://www.figma.com/design/8efC3uSGdXhCLXFl4NmwKE/TarifCorp?m=auto&t=yPcgQYaY9w6Jg1Ux-1)

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

**Next.js 16 App Router** with the coordinator pattern — route files stay thin; orchestration lives in View components under `app/views/`. See [`docs/architecture.md`](docs/architecture.md) for the full layout.

```
app/
├── page.tsx / findings/ / products/ / transactions/   # Routes → Views
├── views/                   # Page coordinators
├── hooks/                   # TanStack Query hooks (one per resource)
├── components/
│   ├── structure/sidebar/   # Persistent navigation + theme toggle
│   └── ui/                  # Shared components (badge, skeleton, etc.)
├── services/http/rest.ts    # HTTP client (restClient)
├── types/api.ts             # All API TypeScript interfaces
├── constants/query-keys.ts  # TanStack Query key factory
└── utils/format.ts          # formatCurrency, formatDate, formatExposure
```

---

## Key Decisions

**TanStack Query** for all server state — loading, error, and stale states. `staleTime: 30s` on queries. Product updates invalidate products, findings, and dashboard.

**Coordinator pattern** — Views orchestrate data and components. Route `page.tsx` files render a View (optionally wrapped in `Suspense` for URL search params).

**Tailwind CSS v4 with semantic tokens** — colors use CSS variables (`bg-card`, `text-destructive`, `border-border`) so light/dark switching is automatic.

**Theme switching via `next-themes`** — defaults to dark (`defaultTheme="dark"`, system preference disabled). Manual toggle in the sidebar persists to `localStorage`.

**URL-persisted filters** — filter and pagination state live in the query string. Refresh restores the same view.

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

Vitest + React Testing Library covering format utilities, TanStack Query hooks (mocked `restClient`), Views, and shared UI. Target coverage thresholds: 80% (see `vitest.config.ts`).

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

## Notes

Planning and change workflow used OpenSpec.
