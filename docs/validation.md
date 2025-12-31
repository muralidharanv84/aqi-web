# MVP Validation Checklist

## Phase 0 Scope Checks
- Confirm v1 pages are `/charts` and `/about` only (no auth, alerts, or edits).
- Confirm charting stays on Recharts for v1.
- Confirm metric keys/units align with API (`aqi_us`, `pm25_ugm3`, `co2_ppm`, `voc_index`, `voc_ppm`, `temp_c`, `rh_pct`).

## Manual Smoke Tests
- Load `/:deviceId/` and confirm the dashboard renders.
- Verify device picker lists devices and updates URL on selection.
- Confirm AQI hero shows value, category, and last updated time.
- Toggle sparkline metric; chart updates without errors.
- Verify stale indicator appears when latest timestamp is older than 5 minutes.
- Test offline behavior: disconnect network and confirm offline banner shows and cached data remains.

## Data Integrity Checks
- Ensure null metrics are hidden from cards.
- Confirm invalid series points are skipped and warning appears only when invalid points exist.
- Verify automatic resolution: <24h uses `raw`, >24h uses `1h`.

## Visual/Responsive Checks
- Mobile viewport: single-column layout, readable AQI hero, segmented control scrolls.
- Touch targets meet 44px minimum for inputs/buttons.

## Charts Page (v1)
- Navigate to `/:deviceId/charts` and confirm page renders.
- Metric selector supports multi-select and updates the chart.
- Time range selector updates query range (1h, 24h, 7d, 30d, custom).
- Time range selector includes 1y and All time.
- Custom range accepts valid datetime inputs and blocks invalid ranges.
- Resolution is chosen automatically from the range (no user control).
- Default chart is AQI with 7d range and automatic `1h` resolution.
- Empty state shows when no series data exists.
- Device timezone hint appears when device timezone is available.
- Error banner appears when series data fails to load.

## About Page (v1)
- Navigate to `/:deviceId/about` and confirm page renders.
- AQI category table matches `domain/aqi.ts` ranges/colors.
- External “What is AQI?” link opens and is accessible.
