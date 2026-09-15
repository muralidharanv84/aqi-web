# MVP Validation Checklist

## Phase 0 Scope Checks
- Confirm dashboard, charts, compare, and about pages are available (no auth, alerts, or edits).
- Confirm charting stays on Recharts for v1.
- Confirm metric keys/units align with API (`aqi_us`, `pm25_ugm3`, `co2_ppm`, `voc_index`, `voc_ppm`, `temp_c`, `rh_pct`).

## Manual Smoke Tests
- Load `/:deviceId/` and confirm the dashboard renders.
- Load `/` and confirm it opens `/murali-living-room/`, with that monitor listed first in the device picker.
- Verify device picker lists devices and updates URL on selection.
- On both pages, verify only reported metrics appear in the selector; `murali-1` hides both VOC metrics and `bellezea-outdoor` includes Noise but no Temperature, Humidity, or CO2.
- Verify outdoor Noise displays in dB and can be selected for the dashboard sparkline and charts.
- Switch monitors with an unsupported metric selected, or load a saved chart link with that metric; verify selection falls back to an available metric and preserves the time range.
- Confirm AQI hero shows value, category, and last updated time.
- Toggle sparkline metric; chart updates without errors.
- Verify stale indicator appears when latest timestamp is older than 5 minutes for indoor monitors.
- For `bellezea-outdoor`, verify data up to and including 1 hour old is fresh, and data older than 1 hour is stale.
- Test offline behavior: disconnect network and confirm offline banner shows and cached data remains.

## Data Integrity Checks
- Ensure null metrics are hidden from cards.
- Confirm invalid series points are skipped and warning appears only when invalid points exist.
- Verify automatic resolution: up to 4h uses raw readings, up to 24h uses 5-minute averages, up to 14d uses hourly, up to 90d uses daily, up to 2y uses weekly, and longer uses monthly averages.
- Verify All time chooses its averaging interval from the monitor's actual history and uses the same interval for all selected metrics.
- Verify long-range ticks omit clock times, the averaging interval is visible, and tooltips retain min/max values and identify UTC calendar periods.

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

## Compare Page
- Open `/compare`; default to living room versus outdoor AQI over 24h. Navigation from a monitor keeps that monitor as the first selection.
- Verify two monitor selectors, Swap, and only metrics reported by both monitors.
- Compare AQI and PM2.5 using one scale, distinct lines, and monitor names in the legend/tooltips.
- Switch to monitors with no shared metrics and verify the explanation and ability to choose another pair.
- Verify every preset and custom range; All time must use the same averaging interval for both monitors even when their histories differ.
- Reload a saved comparison URL and verify monitors, metric, and range are restored.
- Verify missing historical readings do not become zero values, and stale latest readings retain their timestamps and stale labels.
