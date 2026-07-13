# Proposal: TariffCorp Frontend

## What

Build the TariffCorp trade compliance web application using Next.js (App Router), React, TypeScript, and Tailwind CSS. The frontend consumes the existing REST API (`http://localhost:3001/api/v1`) and delivers four pages: Dashboard, Transactions, Products, and Findings. It is built on top of an established Next.js template that provides the HTTP service layer, TanStack Query provider, component conventions, and Vitest testing setup.

## Why

The backend delivers correct data. The problem is legibility and action. Without a purposeful UI, compliance managers see four disconnected tables — they can observe that money is being lost but cannot identify which mistake to fix first, nor navigate from a dollar figure to the record that caused it.

> "I can see the numbers, but I can't tell what to do about them."

The platform's value is the **graph** between the four data sources. The UI must surface that graph: every number on the Dashboard must link to the records that produced it, every finding must route to the product that caused it, and editing a product must visibly propagate its effect across all linked transactions.

## Goals

- **Dashboard** — ten-second scan for a CFO: total exposure, duty declared vs. owed, open findings count, unmatched transaction count, top-5 offenders by broker/port/product. Comparison between duty declared and duty computed surfaces the financial gap at a glance. Every number is a link to its underlying records.
- **Transactions** — paginated grid with status/broker/port filters and sortable columns, all persisted in the URL. Default sort is by dollar exposure when a finding exists, then chronological. Unmatched transactions (no linked product) are visually prominent and invite action — never hidden. Detail view shows declared data, linked product, winning rule, and duty gap.
- **Products** — paginated catalog with classification state at a glance and an `openFindingsCount` badge per product. Default sort: highest `openFindingsCount` first. Detail view includes edit form — `PATCH /products/:id` triggers immediate checker re-evaluation on the backend. Correction is the primary action.
- **Findings (Checks)** — complete checker ledger ordered by `exposure DESC` always. Each finding shows the winning rule, the declared vs. computed duty, and the gap. Primary CTA per row is "Fix Product →" routing to the product detail.
- **Golden path** — a user starting on the Dashboard must reach a specific product and open its edit form within 3–4 clicks.
- **Typographic hierarchy** — Dashboard KPIs scannable in seconds; finding and transaction detail readable for minutes. Both modes served by the same visual system without degradation.
- **Theme switching** — the app respects the OS preference (light/dark) by default via `prefers-color-scheme`, and exposes a sun/moon toggle in the navigation bar so users can override manually per session.

## Non-Goals

- Authentication and authorization (out of scope).
- Multi-tenancy.
- Real-time updates / WebSockets.
- Custom design system — Tailwind semantic tokens used directly.
- Rule editor UI — the backend rule set is hardcoded (R1/R2/R3); adding or editing rules is out of scope for this challenge iteration.
- "vs last month" temporal comparisons — the backend API does not expose historical aggregates; the comparison between `totalDutyDeclared` and `totalDutyComputed` serves as the primary financial delta signal on the Dashboard.

## Risks

| Risk | Mitigation |
|------|-----------|
| URL filter state causing stale renders | Filters read from `useSearchParams`; all filter changes reset page to 1 |
| PATCH re-evaluation delay visible to user | Optimistic update on product fields immediately; findings list refetched after mutation settles |
| Unmatched transactions confusing users | Distinct amber styling and explicit copy inviting action — never hidden, never shown as an error |
| Third-party icon library bloating bundle | Direct sub-path imports or `optimizePackageImports` in `next.config.js` — no barrel imports from icon packages |
| Hydration mismatch on theme toggle | `ThemeToggle` defers render until after mount (`useState` + `useEffect`) to avoid server/client mismatch |
