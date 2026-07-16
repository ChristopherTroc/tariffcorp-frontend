# Architecture

Project structure and design patterns for the TariffCorp frontend.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Coordinator Pattern](#coordinator-pattern)
- [Naming Conventions](#naming-conventions)
- [Module Organization](#module-organization)
- [Data Flow Strategy](#data-flow-strategy)
- [Import Strategy](#import-strategy)
- [Implementation Guidelines](#implementation-guidelines)
- [Quality Integration](#quality-integration)

---

## Architecture Overview

The app uses a **coordinator pattern** where Views orchestrate data fetching, URL/filter state, component composition, and user interactions.

### Key Principle

Route `page.tsx` files stay thin. Views under `app/views/` are the coordinators that integrate TanStack Query hooks with UI components while keeping concerns separated.

---

## Project Structure

```
app/
├── page.tsx                         # Dashboard route → ViewDashboard
├── findings/page.tsx
├── products/
│   ├── page.tsx
│   └── [id]/page.tsx
├── transactions/
│   ├── page.tsx
│   └── [id]/page.tsx
├── layout.tsx                       # Root shell: Providers + Sidebar + main
├── providers.tsx                    # ThemeProvider + QueryClientProvider
├── globals.css                      # Tailwind v4 + semantic design tokens
├── components/
│   ├── structure/
│   │   └── sidebar/                 # Persistent nav + findings badge
│   └── ui/                          # Shared UI (badge, pagination, etc.)
├── views/                           # Page coordinators
│   ├── dashboard/
│   ├── transactions/
│   ├── products/
│   └── findings/
├── hooks/                           # TanStack Query hooks (per resource)
├── services/
│   └── http/rest.ts                 # REST client (fetch wrapper)
├── constants/
│   └── query-keys.ts                # Query key factory
├── types/
│   └── api.ts                       # API TypeScript interfaces
└── utils/
    ├── cn.ts                        # className helper
    └── format.ts                    # currency / date / exposure formatters
```

---

## Coordinator Pattern

### Views as Central Orchestrators

Views integrate multiple concerns into cohesive page experiences:

**View responsibilities:**

- page structure and UX
- data fetching via hooks (`useDashboard`, `useTransactions`, …)
- URL query params for filters and pagination
- component composition
- user interaction handling

**Route responsibilities:**

- map URL → View only (no data fetching in `page.tsx`)
- may wrap the View in `Suspense` when the View reads `useSearchParams`

**Benefits:**

- clear separation between routing and page logic
- predictable data flow
- easier testing (Views and hooks tested in isolation)
- scalable feature folders under `views/`

---

## Naming Conventions

| Context                   | Pattern            | Examples                                           |
| ------------------------- | ------------------ | -------------------------------------------------- |
| **Files & Directories**   | `kebab-case`       | `edit-product-form/`, `stat-card.tsx`              |
| **React Components**      | `PascalCase`       | `ViewDashboard`, `Sidebar`, `StatCard`             |
| **TypeScript Interfaces** | `IPascalCase`      | `ITransaction`, `IProductFilters`                  |
| **Type Aliases**          | `TPascalCase`      | `TProductType`                                     |
| **Variables & Functions** | `camelCase`        | `openFindingsCount`, `formatCurrency()`            |
| **Custom Hooks**          | `useCamelCase`     | `useDashboard`, `useProducts`                      |
| **Constants**             | `UPPER_SNAKE_CASE` / factories | `QUERY_KEYS.dashboard()`               |

---

## Module Organization

Modules stay small and grow only when needed.

### Simple utility

```
utils/
├── format.ts
└── format.test.ts
```

### UI component

```
badge/
├── badge.tsx
├── badge.test.tsx
└── index.ts            # barrel export
```

### View / feature

```
products/
├── products.tsx              # list coordinator
├── products.test.tsx
├── product-detail.tsx
├── product-detail.test.tsx
└── components/
    ├── edit-product-form.tsx
    └── edit-product-form.test.tsx
```

### Guidelines

- start minimal; add files when complexity appears
- co-locate tests next to the unit under test
- use barrel `index.ts` for shared components
- prefer URL state over ad-hoc client stores

---

## Data Flow Strategy

### Client-side server state (primary)

- Views call TanStack Query hooks (`useDashboard`, `useTransactions`, `useProducts`, `useFindings`)
- Hooks call `restClient` against `NEXT_PUBLIC_API_URL`
- Mutations invalidate related query keys (e.g. product update → findings / dashboard)
- Typical `staleTime`: 30s

### URL as UI state

- Filters and pagination live in the query string (`page`, `status`, `broker`, `q`, `rule`, …)
- Refresh restores the same view
- Dashboard deep-links into list filters (e.g. `/findings?rule=R1`, `/transactions?broker=…&q=…`)

### Local UI state

- Component-local React state for drafts, drawers, edit mode, debounced search input
- Theme via `next-themes`

Learn more: [TanStack Query](https://tanstack.com/query/latest)

---

## Import Strategy

TypeScript path mapping (`@/*` → project root) enables:

```typescript
import { Sidebar } from "@/app/components/structure/sidebar";
import { restClient } from "@/app/services/http/rest";
import { useDashboard } from "@/app/hooks/use-dashboard";
import type { IFinding } from "@/app/types/api";
```

### Patterns

- **Cross-feature:** `@/app/...` aliases
- **Within a feature:** relative imports for local components
- **Barrels:** `index.ts` for shared UI / structure modules

---

## Implementation Guidelines

### What the app uses

- **REST HTTP layer** — `restClient` (`get` / `post` / `patch`) over `fetch`
- **TanStack Query hooks** — one hook module per resource
- **Coordinator Views** — dashboard, transactions, products, findings
- **Shared UI + Sidebar** — design-system pieces + app shell
- **Semantic Tailwind tokens** — light/dark via CSS variables + `next-themes`
- **Co-located Vitest tests** — hooks, utils, views, UI

### Quality standards

- TypeScript strict mode
- ESLint (Next core-web-vitals + TypeScript)
- Prefer coverage on business logic (hooks, formatters, View behavior)
- Keep route files thin: render a View (plus `Suspense` when needed)

---

## Quality Integration

### Development-time

- TypeScript strict mode
- ESLint feedback in the editor
- Vitest for unit / component tests

### Verification commands

```bash
npm run lint          # ESLint
npm run tsc           # Typecheck (no emit)
npm test              # Vitest
npm run test:coverage # Coverage report
```

Learn more: [ESLint](https://eslint.org/docs/latest/) | [TypeScript](https://www.typescriptlang.org/docs/) | [Vitest](https://vitest.dev/)

---

## Related Documentation

- **[← Back to README](../README.md)** — setup, pages, and tech stack
- **[Development](development.md)** — scripts, quality tools, and testing
