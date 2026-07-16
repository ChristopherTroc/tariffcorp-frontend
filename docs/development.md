# Development

Development workflow, quality tools, and testing for the TariffCorp frontend.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Process](#development-process)
- [Code Quality](#code-quality)
- [Testing Framework](#testing-framework)
- [Testing Patterns](#testing-patterns)
- [Related Documentation](#related-documentation)

---

## Prerequisites

- **Node.js** matching `.nvmrc` (v24.16.0)
- **Backend API** at `http://localhost:3001` (see `../backend/README.md`)
- Optional `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

```bash
npm install
npm run dev          # http://localhost:3000
```

---

## Development Process

### Daily workflow

```bash
npm run dev          # Next.js dev server (hot reload)
npm run test:watch   # Vitest watch mode
npm run lint         # ESLint
npm run tsc          # TypeScript check (no emit)
```

### Quality & verification

```bash
npm run test           # full Vitest suite
npm run test:coverage  # coverage report (text + lcov + html)
npm run lint           # ESLint
npm run tsc            # typecheck
```

### Build

```bash
npm run build        # production build
npm run start        # serve production build
```

---

## Code Quality

| Tool           | Purpose              | How it runs        |
| -------------- | -------------------- | ------------------ |
| **TypeScript** | static type checking | IDE + `npm run tsc` |
| **ESLint**     | lint / Next rules    | IDE + `npm run lint` |
| **Vitest**     | unit / component tests | `npm test` / watch |

Config:

- ESLint: `eslint.config.mjs` (Next core-web-vitals + TypeScript)
- TypeScript: `tsconfig.json` (strict)
- Path alias: `@/*` → project root

Learn more: [ESLint](https://eslint.org/docs/latest/) | [TypeScript](https://www.typescriptlang.org/docs/)

---

## Testing Framework

- **Runner:** [Vitest](https://vitest.dev/guide/) (jsdom)
- **Components:** [React Testing Library](https://testing-library.com/docs/)
- **Setup:** `vitest.setup.ts`
- **Config:** `vitest.config.ts`
- **Coverage:** v8 provider; reporters `text`, `lcov`, `html`

### Coverage thresholds

Configured in `vitest.config.ts`:

- Branches / Functions / Lines / Statements: **80%** minimum

Excluded from coverage collection (examples): `*.config.*`, `vitest.setup.ts`, `app/layout.tsx`, `app/page.tsx`, `.next/**`.

---

## Testing Patterns

Tests are co-located next to the unit under test.

### Where tests live

```bash
# UI
app/components/ui/badge/badge.test.tsx
app/components/structure/sidebar/sidebar.test.tsx

# Views
app/views/dashboard/dashboard.test.tsx
app/views/transactions/transactions.test.tsx
app/views/products/products.test.tsx
app/views/findings/findings.test.tsx

# Hooks (mock restClient)
app/hooks/use-dashboard.test.ts
app/hooks/use-products.test.ts

# HTTP / utils
app/services/http/rest.test.ts
app/utils/format.test.ts
```

### Guidelines

- Prefer semantic queries (`getByRole`, `getByLabelText`, `getByText`)
- Assert user-visible behavior, not internals
- Mock `restClient` / Next navigation in hook and view tests — no live network
- Wrap hooks that need React Query with a `QueryClientProvider` test wrapper

### Mock strategy

- **HTTP:** mock `@/app/services/http/rest` so hooks return fixtures
- **Routing:** mock `next/navigation` (`useRouter`, `useSearchParams`, `usePathname`) and `next/link` when needed
- **Theme:** covered via `next-themes` usage in shell components; avoid flaky hydration paths in unit tests

**Benefits:** isolation, fast runs, stable CI without the Nest API.

Learn more: [Vitest](https://vitest.dev/guide/) | [Testing Library](https://testing-library.com/docs/)

---

## Related Documentation

- **[← Back to README](../README.md)** — setup, pages, and tech stack
- **[Architecture](architecture.md)** — coordinator pattern and folder layout
