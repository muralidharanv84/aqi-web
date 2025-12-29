# MVP Validation Checklist

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
- Verify resolution selection: <24h uses `raw`, >24h uses `1h`.

## Visual/Responsive Checks
- Mobile viewport: single-column layout, readable AQI hero, segmented control scrolls.
- Touch targets meet 44px minimum for inputs/buttons.
