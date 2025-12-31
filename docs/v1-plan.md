# Home AQI v1 Roadmap Plan

## Purpose
Translate the approved design doc into a concrete, step-by-step execution plan
for the next phase beyond the MVP dashboard.

---

## Phase 0 — Scope Lock and Baseline
1. Confirm v1 scope: `/charts` and `/about` pages, no auth, no alerts.
2. Align on data contracts for series and latest (metric keys, fields, ranges).
3. Freeze UI baseline for Dashboard (no regressions while adding features).
4. Decide initial chart library constraints (keep Recharts for v1).

Deliverable: Updated checklist in `docs/validation.md` for new pages.

---

## Phase 1 — Routing, Navigation, and Shell
1. Add routes for:
   - `/:deviceId/charts`
   - `/:deviceId/about`
2. Add nav links in `AppShell`:
   - Dashboard
   - Charts
   - About
3. Ensure device picker stays in header across pages.
4. Preserve redirect from `/` → `/murali-1/`.
5. Add a 404/fallback route to redirect to dashboard.

Deliverables:
- `src/app/routes.tsx` updated
- `src/components/AppShell.tsx` updated
- `src/pages/ChartsPage.tsx` scaffolded
- `src/pages/AboutPage.tsx` scaffolded

---

## Phase 2 — Charts Page Foundations
1. Define chart page layout:
   - Header area (title + device context)
   - Control panel (metric, range)
   - Chart canvas
2. Create control components:
   - Metric selector (multi-select)
   - Time range selector (1h, 24h, 7d, 30d, custom)
   - Resolution handled automatically (raw under 24h, otherwise 1h)
3. Define chart-ready data shape:
   - Normalize series points per metric
   - Combine into a shared time axis
4. Wire query hooks for multi-metric series:
   - Parallel queries or a single combined query per metric

Deliverables:
- `src/pages/ChartsPage.tsx` with controls and layout
- `src/query/series.ts` extended for multi-metric fetch
- `src/domain/series.ts` helpers for alignment/merging

---

## Phase 3 — Charts Rendering + UX
1. Render single-metric chart as default.
2. Implement multi-metric overlay:
   - AQI on left axis
   - Other metrics on right axis
3. Add tooltips with:
   - Timestamp (local time)
   - Metric label + value + unit
   - Min/Max/N for 1h aggregates
4. Add sensible default metric pairings:
   - AQI + PM2.5
   - CO2 alone
   - VOC index alone
5. Handle empty states and error states gracefully.

Deliverables:
- Chart view in `src/pages/ChartsPage.tsx`
- Reusable chart utilities (if needed)

---

## Phase 4 — About Page (AQI Explainer)
1. Summarize AQI categories and health descriptions.
2. Reuse `domain/aqi.ts` data for the table.
3. Include “What is AQI?” external link.
4. Keep layout mobile-first and calm.

Deliverables:
- `src/pages/AboutPage.tsx` content complete

---

## Phase 5 — Reliability + UX Polish
1. Offline banner:
   - Show when any query fails
   - Keep cached values visible
2. Align polling interval with design doc (60s).
3. Add device timezone hint (optional text in charts).
4. Improve skeletons/loading states for charts controls.
5. Add small accessibility pass:
   - Focus states
   - Touch targets
   - Labels on controls

Deliverables:
- Updates to `src/query/latest.ts`
- Small UI copy or layout adjustments where relevant

---

## Phase 6 — Validation + QA
1. Extend `docs/validation.md`:
   - Charts control interactions
   - Resolution logic for each range
   - Multi-metric overlay behavior
2. Manual smoke test new routes.
3. Verify responsive layout on phone/tablet/desktop.

Deliverable:
- Validation checklist updated

---

## Phase 7 — Hardening (Optional)
1. Add unit tests for:
   - `domain/series.ts` normalization + merge logic
   - `domain/metrics.ts` formatting
2. Add lightweight error logging hooks (if desired).

Deliverable:
- Test coverage for core data helpers

---

## Recommended Execution Order
1. Phase 1 → Phase 2 → Phase 3
2. Phase 4 → Phase 5
3. Phase 6 → Phase 7

If you want, I can now start Phase 1 (routing + nav + page scaffolds).
