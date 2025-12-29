# Home AQI — Frontend Design Document  
**Version:** 1.0  
**Stack:** React + TypeScript + Vite + Cloudflare Pages  
**Status:** Approved for implementation (code to follow)

---

## 1. Overview

**Home AQI** is a static, high-performance web frontend for indoor air quality monitoring.  
It is deployed to **Cloudflare Pages** and queries a public-read backend API.

The frontend prioritizes:
- Immediate understanding of **current US AQI**
- Clean, calm, high-signal UI
- A gentle on-ramp for casual users
- Deep, powerful charts for users who care
- Mobile-first usability across the entire product

No login. No editing. Read-only and fast.

---

## 2. Goals & Non-Goals

### Goals
- Make **current AQI** instantly understandable
- Follow **US AQI standards** for categorization and color
- Support **multiple devices**
- Be fully usable on mobile, tablet, and desktop from day one
- Render timestamps in **browser timezone**
- Provide **powerful historical charts** without overwhelming the MVP
- Remain **100% static** (no SSR, no server dependencies)

### Non-Goals (v1)
- Alerts or notifications
- User accounts or authentication
- Editing device metadata
- Mobile app (responsive web only)

---

## 3. Deployment & URLs

- Production URL:  
  https://aqi.orangeiqlabs.com

- Device-scoped routing:
  ```
  /                  → redirect to /murali-1/
  /:deviceId/        → dashboard
  /:deviceId/charts  → advanced charts
  /:deviceId/about   → AQI explanation
  ```

If no device is explicitly selected, the default device is:

```
murali-1
```

---

## 4. Backend Integration

### API Base
- Same origin (CORS already configured)

### Endpoints Used

#### Device List
```
GET /api/v1/devices
```

Used for:
- Device picker
- Determining device timezone (hourly aggregation semantics)

Ordering:
- Sort by device id in the UI (ascending).

---

#### Latest Values
```
GET /api/v1/devices/{device_id}/latest
```

Used for:
- AQI hero card
- Supporting sensor metrics
- “Last updated” timestamp

Notes:
- AQI value is provided by the API; frontend applies US AQI category/color/description.

---

#### Time Series
```
GET /api/v1/devices/{device_id}/series
```

Query params:
- metric
- from (epoch seconds)
- to (epoch seconds)
- resolution = raw | 1h

Notes:
- Metric name for AQI is `aqi_us`.
- `raw` supports a max duration of 14 days.
- Use `raw` for ranges under 24 hours; otherwise use `1h`.
- A future `24h` (daily) aggregation will be added.

Used for:
- Sparkline trends
- Advanced charts

---

#### Health Check (optional UI)
```
GET /api/v1/health
```

---

## 5. Core UX Concepts

### 5.1 Dashboard (/:deviceId/)
MVP scope:
- Only the dashboard and sparkline are in MVP (no charts or about pages).

#### AQI Hero (Primary Focus)
- Very large AQI number
- AQI category label
- Background / halo color mapped to US AQI category
- Short description of health meaning
- “What is AQI?” info link (authoritative source)
- Last updated timestamp (browser timezone)

This section dominates the page visually.

Mobile notes:
- Use a single-column layout with generous tap targets.
- Keep the AQI number visible without scrolling on common phone sizes.

---

#### Supporting Metrics (Secondary)
Displayed as compact cards/chips:
- PM2.5 (µg/m³)
- CO₂ (ppm)
- VOC index
- VOC ppm
- Temperature (°C)
- Relative humidity (%)

Rules:
- Smaller font than AQI
- Always visible
- No aggressive color coding (avoid noise)
- If a metric is null/missing, hide that card

Mobile notes:
- Wrap cards into 2-column grid on small screens.
- Ensure card hit areas are at least 44px tall.

---

#### Mini Trend (MVP)
- AQI sparkline
- Default range: **last 7 days**
- Tooltip with timestamp + value
- Ability to switch the sparkline metric (AQI / PM2.5 / CO₂ / VOC / Temp / RH)
  - Use a compact segmented control for a clean UI (default to AQI)

Mobile notes:
- Segmented control should be horizontally scrollable if it overflows.
- Tooltip content should be brief and not cover the entire chart.

Resolution notes:
- Use `raw` for ranges under 24 hours; otherwise use `1h`.

---

#### Device Picker
- Dropdown in header
- Populated from /devices
- Selecting device updates URL and refetches data
- No page reloads

---

### 5.2 Advanced Charts (/:deviceId/charts)

Designed for power users.

Mobile notes:
- Default to single-metric view on small screens.
- Place controls in a collapsible panel or stacked layout to avoid crowding.
- Enable horizontal panning/zooming on charts if supported by the library.

#### Defaults
- Time range: **7 days**
- Metric: AQI
- Resolution: **1h**
- Single device

---

#### Controls
- Metric selector (multi-select)
- Time range selector:
  - 1h
  - 24h
  - 7d (default)
  - 30d
  - Custom
- Resolution selector:
  - Raw
  - 1h

---

#### Multi-Metric Overlay
- Multiple metrics on the same chart
- Dual Y-axis support:
  - AQI on primary axis
  - PM2.5 / CO₂ / VOC on secondary axis
- Sensible default pairings:
  - AQI + PM2.5
  - CO₂ alone
  - VOC index alone

---

#### Hourly Aggregates
If resolution=1h, charts use:
- avg (line)
- min/max (band or tooltip)
- n (shown in tooltip)

No client-side reaggregation.

---

## 6. AQI Logic & Presentation

### AQI Categories (US Standard)

| AQI Range | Category                       |
|----------:|--------------------------------|
| 0–50      | Good                           |
| 51–100    | Moderate                       |
| 101–150   | Unhealthy for Sensitive Groups |
| 151–200   | Unhealthy                      |
| 201–300   | Very Unhealthy                 |
| 301+      | Hazardous                      |

Each category defines:
- Label
- Color
- Short health description

AQI interpretation logic lives entirely in the frontend domain layer.

Implementation detail:
- Map ranges to explicit hex colors in `domain/aqi.ts` for consistent UI.

---

## 7. Time & Timezones

- Backend provides epoch seconds.
- Frontend renders timestamps in **browser timezone**.
- Hourly aggregation boundaries are determined by **device timezone**, but:
  - The frontend does **not** recompute buckets.
  - It only visualizes what the backend returns.
- UI may optionally show:
  “Hourly aggregates aligned to device timezone: Asia/Kolkata”

---

## 8. Charting Strategy

### Library
- Initial: **Recharts**
- Upgrade path: uPlot or ECharts (charts page only)

---

### Resolution Selection
- Use `raw` for ranges under 24 hours.
- Use `1h` for ranges over 24 hours.
- `raw` supports a maximum window of 14 days.
- A future `24h` (daily) aggregation will be added for longer windows.

---

## 9. State Management & Data Fetching

### Library
- TanStack Query (React Query)

### Behavior
- /latest: polled every 60 seconds (pause when tab hidden)
- Series queries cached per:
  - device
  - metric(s)
  - time range
  - resolution

### Offline / Error Handling
- If API fails:
  - Show a subtle offline banner
  - Keep last cached values visible
  - Mark readings as “stale”

Staleness:
- Flag stale when `now - latest.timestamp` exceeds a threshold (e.g., 5 minutes).

---

## 10. Visual Design System

### Principles
- Calm, minimal, high contrast
- Large typography for AQI
- Plenty of whitespace
- No dashboard clutter

### Styling
- Tailwind CSS
- Soft cards
- Rounded corners
- Subtle shadows
- Light mode default
- Dark mode optional (later)

Responsive layout:
- Mobile-first breakpoints; single-column on phones.
- Target 44px minimum touch sizes for all controls.
- Avoid hover-only interactions; all actions must be tappable.

---

## 11. Accessibility
- Color is never the sole signal (labels always present)
- Adequate contrast ratios
- Keyboard-accessible controls
- Screen-reader friendly headings
- Touch targets meet mobile accessibility sizing guidance

---

## 12. Tech Stack

- React
- TypeScript
- Vite
- React Router
- Tailwind CSS
- TanStack Query
- Recharts
- date-fns + date-fns-tz

---

## 13. Project Structure (Planned)

```
src/
  app/
    App.tsx
    routes.tsx
  api/
    client.ts
    endpoints.ts
    types.ts
  components/
    AqiHero.tsx
    MetricCards.tsx
    DevicePicker.tsx
    Sparkline.tsx
    ChartPanel.tsx
    TimeRangePicker.tsx
  pages/
    DashboardPage.tsx
    ChartsPage.tsx
    AboutPage.tsx
  domain/
    aqi.ts
    metrics.ts
  styles/
    globals.css
```

---

## 14. Deployment (Cloudflare Pages)

- Static build output
- SPA routing via _redirects
- Optional build-time env var:
  ```
  VITE_API_BASE_URL
  ```
- No secrets required

---

## 15. Future Enhancements (Not v1)
- Daily aggregates
- CSV export
- Device comparison charts
- Alerts / thresholds
- Event annotations (e.g. “air purifier on”)
- PWA offline mode

---

## 16. Summary

This frontend:
- Makes AQI obvious at a glance
- Scales gracefully from casual to obsessive
- Aligns perfectly with the backend’s data model
- Stays cheap, fast, and boring to operate

Next step:  
→ translate this document into a component-level spec and implementation.
