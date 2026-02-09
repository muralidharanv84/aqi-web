# Home AQI Web (`aqi-web`)

Frontend for the Home AQI system: a fast, mobile-first dashboard and charts UI for indoor air quality data.

This app is built with React + TypeScript + Vite, deployed as a static site, and reads data from the `aqi-backend` API.

## What This App Does

- Shows a device-specific AQI dashboard at a glance
- Displays supporting metrics (PM2.5, CO2, VOC, temperature, humidity)
- Provides a sparkline trend on the dashboard (7-day window)
- Provides advanced multi-metric charts with time-range controls
- Includes an About page explaining AQI categories and context

## Related Repositories

This repo is one part of a 3-repo system:

1. **Frontend (this repo)**: [`aqi-web`](https://github.com/muralidharanv84/aqi-web)
   - Public UI, routing, charts, formatting, and client-side query/state
2. **Backend API**: [`aqi-backend`](https://github.com/muralidharanv84/aqi-backend)
   - Cloudflare Worker + D1, ingest, latest values, series endpoints, hourly rollups
3. **Device/Firmware + hardware**: [`airqualitymonitor`](https://github.com/muralidharanv84/airqualitymonitor)
   - ESP32/CircuitPython monitor, sensor telemetry posting, enclosure/design assets

## High-Level Architecture

```text
Sensors/device firmware (airqualitymonitor)
  -> POST /api/v1/ingest (aqi-backend)
  -> D1 storage + hourly aggregation
  -> GET /api/v1/devices, /latest, /series
  -> aqi-web (this repo) renders dashboard/charts/about
```

## App Routes

- `/` -> redirects to `/murali-1/`
- `/:deviceId/` -> Dashboard
- `/:deviceId/charts` -> Advanced charts
- `/:deviceId/about` -> AQI explainer/about
- `*` -> redirects to `/`

Cloudflare Pages SPA routing is handled via `public/_redirects`.

## Backend API Contract Used By This Frontend

From implemented client/query code, this app uses:

- `GET /api/v1/devices`
- `GET /api/v1/devices/{deviceId}/latest`
- `GET /api/v1/devices/{deviceId}/series?metric=&from=&to=&resolution=`

Supported metric API keys expected by the frontend:

- `aqi_us`
- `pm25_ugm3`
- `co2_ppm`
- `voc_index`
- `voc_ppm`
- `temp_c`
- `rh_pct`

Series resolution strategy in the frontend:

- `raw` when range is `<= 24h`
- `1h` when range is `> 24h`

Note: backend enforces a max `raw` range of 14 days.

## UI/Data Behavior (Current Implementation)

- Device list is sorted by `device_id` ascending
- Latest data is polled every **30 seconds**
- Latest data is marked stale if timestamp age exceeds **5 minutes**
- Series points are normalized from multiple backend point shapes (`value`, `v`, `avg`, etc.)
- Invalid series points are dropped; UI surfaces a warning with invalid-point counts
- Time display uses browser locale formatting via `Intl.DateTimeFormat` (configured `en-GB`, 24h)

## Tech Stack

- React 18
- TypeScript 5
- Vite 5
- React Router 6
- TanStack Query 5
- Recharts 2
- Tailwind CSS 3 + PostCSS
- Vitest 2 (unit tests for domain helpers)

## Project Structure

```text
src/
  api/          # API client, endpoint wrappers, shared API types
  app/          # App and route definitions
  components/   # Shell, cards, selectors, charts/sparklines
  domain/       # AQI categories, metric defs/formatting, series normalization
  pages/        # Dashboard, Charts, About
  query/        # React Query hooks (devices/latest/series)
  styles/       # Global styles
```

## Local Development

### Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm

### Install

```bash
npm install
```

### Run frontend

```bash
npm run dev
```

Vite runs on `http://localhost:5173` by default.

### API base URL configuration

The API base defaults to:

- `https://aqi-backend.orangeiqlabs.com`

Override with an env var in `.env.local`:

```bash
VITE_API_BASE_URL=http://localhost:8787
```

(Use your local backend URL/port if different.)

## Running With Local `aqi-backend`

From the sibling backend repo (`../aqi-backend`):

```bash
npm install
npm run dev
```

Then in this frontend repo set:

```bash
VITE_API_BASE_URL=http://localhost:8787
```

If using Localflare + local D1 data synced from remote in backend:

```bash
npm run db:sync:remote-to-local
npm run localflare
```

or:

```bash
npm run localflare:with-remote-d1
```

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Type-check + production build
- `npm run preview` - Preview production build locally
- `npm run test` - Run Vitest in watch mode
- `npm run test:run` - Run Vitest once

## Tests

Current unit tests cover domain logic in:

- `src/domain/metrics.test.ts`
- `src/domain/series.test.ts`

Run once:

```bash
npm run test:run
```

## Deployment Notes

- Static output is generated to `dist/`
- Designed for Cloudflare Pages
- SPA fallback is configured with `public/_redirects`
- No frontend secrets are required

## Useful Docs In This Repo

- `docs/design.md` - Product and architecture design
- `docs/mvp-plan.md` - MVP implementation plan
- `docs/v1-plan.md` - v1 roadmap plan
- `docs/validation.md` - QA/manual validation checklist

## License

MIT-style Apache 2.0 license text is in [`LICENSE`](./LICENSE).
