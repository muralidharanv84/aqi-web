# Home AQI MVP Plan

## Component-Level Spec (MVP Dashboard + Sparkline)

### Mobile-First Constraints
- Single-column layout on small screens with generous spacing.
- Minimum 44px touch targets for all interactive controls.
- No hover-only affordances; all actions are tappable.
- Segmented control should scroll horizontally if it overflows.

### Pages & Routing
- `DashboardPage`
  - Route: `/:deviceId/` with default redirect `/` → `/murali-1/`
  - Responsibilities: fetch device list, latest readings, sparkline series; manage selected device and selected sparkline metric; compose layout.

### Data/Domain
- `domain/aqi.ts`
  - `getAqiCategory(aqi: number): { label, color, description }`
  - Defines AQI range table and explicit hex colors.
- `domain/metrics.ts`
  - `METRICS`: list of supported metrics with keys, labels, units, and display rules.
  - `getMetricLabel(key)`, `formatMetricValue(key, value)`.

### API Layer
- `api/client.ts`
  - `apiGet<T>(path, params?)` using `fetch`, base URL from `VITE_API_BASE_URL` or same origin.
- `api/endpoints.ts`
  - `getDevices()`
  - `getLatest(deviceId)`
  - `getSeries(deviceId, metric, from, to, resolution)`
- `api/types.ts`
  - `Device`, `LatestResponse`, `SeriesPoint`, `SeriesResponse`

### State/Data Fetching
- `query/devices.ts`
  - `useDevices()`; sorts by id ascending.
- `query/latest.ts`
  - `useLatest(deviceId)`; polls every 60s; `stale` if `now - latest.timestamp > 5m`.
- `query/series.ts`
  - `useSeries(deviceId, metric, from, to, resolution)`; MVP uses `metric` + 7d range + `resolution=auto`.

### UI Components
- `DevicePicker`
  - Props: `devices`, `value`, `onChange`
  - Sorts by id; updates route on change.
- `AqiHero`
  - Props: `aqi`, `category`, `description`, `lastUpdated`, `stale`
  - Large AQI number, label, background/halo color.
- `MetricCards`
  - Props: `latest` (all metrics)
  - Renders only metrics with non-null values.
- `MetricSegmentedControl`
  - Props: `value`, `onChange`, `options` (AQI/PM2.5/CO₂/VOC/Temp/RH)
  - Compact segmented control; default AQI.
- `Sparkline`
  - Props: `points`, `metric`, `rangeLabel`
  - Minimal chart with tooltip; 7d window.

### Layout
- `AppShell`
  - Header: app title + `DevicePicker`
  - Main: `AqiHero`, `MetricCards`, `Sparkline` + `MetricSegmentedControl`

---

## Step-by-Step Implementation Plan

1. **Scaffold app structure**
   - Add `src/` tree per design doc; set up routing, Tailwind, and base layout.
2. **API + types**
   - Implement `api/client.ts`, `api/endpoints.ts`, `api/types.ts`.
3. **Domain logic**
   - Implement `domain/aqi.ts` with ranges + colors + descriptions.
   - Implement `domain/metrics.ts` with labels/units and null handling.
4. **Query hooks**
   - Add React Query provider.
   - Implement `useDevices`, `useLatest` (polling + stale), and `useSeries`.
5. **Core UI components**
   - Build `DevicePicker`, `AqiHero`, `MetricCards`, `MetricSegmentedControl`, `Sparkline`.
6. **Dashboard page assembly**
   - Implement data wiring, device routing, sparkline metric switching, and 7d range.
7. **Mobile responsiveness pass**
   - Ensure single-column layout, min touch sizes, and overflow-safe controls.
8. **Polish + edge cases**
   - Empty states, loading skeletons, offline banner, and null-metric hiding.
9. **Validation**
   - Smoke-test: device switch, polling refresh, sparkline switch, stale behavior.
