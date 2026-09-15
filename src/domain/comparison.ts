import type { Device, LatestResponse } from "../api/types";
import { DEFAULT_DEVICE_ID } from "./devices";
import { getAvailableMetrics } from "./metrics";
import type { NormalizedSeriesPoint, SeriesResolution } from "./series";

export function chooseComparisonDevices(devices: Device[], requestedFirst?: string, requestedSecond?: string | null) {
  const first = devices.find((device) => device.device_id === requestedFirst)
    ?? devices.find((device) => device.device_id === DEFAULT_DEVICE_ID) ?? devices[0];
  const others = devices.filter((device) => device.device_id !== first?.device_id);
  const second = others.find((device) => device.device_id === requestedSecond)
    ?? others.find((device) => device.device_id === "bellezea-outdoor") ?? others[0];
  return { first, second };
}

export function getSharedMetrics(first?: LatestResponse, second?: LatestResponse) {
  const secondKeys = new Set(getAvailableMetrics(second?.metrics, second?.device_id).map((metric) => metric.key));
  return getAvailableMetrics(first?.metrics, first?.device_id).filter((metric) => secondKeys.has(metric.key));
}

export function coarsestResolution(resolutions: SeriesResolution[]): SeriesResolution {
  const ordered: SeriesResolution[] = ["raw", "5m", "1h", "1d", "1w", "1mo"];
  return ordered[Math.max(...resolutions.map((resolution) => ordered.indexOf(resolution)))];
}

// Normalized series are sorted by timestamp. Prefer the earlier reading on a tie.
export function findClosestReading(points: NormalizedSeriesPoint[], timestampSeconds: number) {
  let low = 0;
  let high = points.length;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (points[middle].ts < timestampSeconds) low = middle + 1;
    else high = middle;
  }
  const before = points[low - 1];
  const after = points[low];
  if (!before) return after;
  if (!after) return before;
  return timestampSeconds - before.ts <= after.ts - timestampSeconds ? before : after;
}

export function mergeComparisonSeries(first: NormalizedSeriesPoint[], second: NormalizedSeriesPoint[]) {
  const rows = new Map<number, { ts: number; first?: number; second?: number }>();
  for (const [key, points] of [["first", first], ["second", second]] as const) {
    for (const point of points) {
      const row = rows.get(point.ts) ?? { ts: point.ts * 1000 };
      row[key] = point.value;
      rows.set(point.ts, row);
    }
  }
  return [...rows.values()].sort((a, b) => a.ts - b.ts);
}
