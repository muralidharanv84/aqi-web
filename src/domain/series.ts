import type { SeriesPoint, SeriesResponse } from "../api/types";

export type SeriesResolution = "raw" | "5m" | "1h" | "1d" | "1w" | "1mo";
export type SeriesResolutionRequest = SeriesResolution | "auto";

export const RESOLUTION_LABELS: Record<SeriesResolution, string> = {
  raw: "Individual readings",
  "5m": "5-minute averages",
  "1h": "Hourly averages",
  "1d": "Daily averages",
  "1w": "Weekly averages",
  "1mo": "Monthly averages",
};

export function isSeriesResolution(value: unknown): value is SeriesResolution {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(RESOLUTION_LABELS, value);
}

export type NormalizedSeriesPoint = {
  ts: number;
  value: number;
  min?: number;
  max?: number;
  n?: number;
};

export type MergedSeriesPoint = {
  ts: number;
} & Record<string, number | undefined>;

const ONE_DAY_SECONDS = 24 * 60 * 60;

export function chooseSeriesResolution(
  from: number,
  to: number
): SeriesResolution {
  const range = to - from;
  if (range <= 4 * 60 * 60) return "raw";
  if (range <= ONE_DAY_SECONDS) return "5m";
  if (range <= 14 * ONE_DAY_SECONDS) return "1h";
  if (range <= 90 * ONE_DAY_SECONDS) return "1d";
  if (range <= 730 * ONE_DAY_SECONDS) return "1w";
  return "1mo";
}

function resolvePointValue(point: SeriesPoint, metricKey: string) {
  if (typeof point.value === "number") {
    return point.value;
  }
  if (typeof point.v === "number") {
    return point.v;
  }
  if (typeof point.avg === "number") {
    return point.avg;
  }
  const metricValue = point.metrics?.[metricKey];
  if (typeof metricValue === "number") {
    return metricValue;
  }
  return undefined;
}

function resolvePointTimestamp(point: SeriesPoint) {
  if (typeof point.ts === "number") {
    return point.ts;
  }
  if (typeof point.t === "number") {
    return point.t;
  }
  if (typeof point.time === "number") {
    return point.time;
  }
  if (typeof point.timestamp === "number") {
    return point.timestamp;
  }
  return undefined;
}

export function normalizeSeriesPoints(
  response: SeriesResponse | SeriesPoint[] | unknown,
  metricKey: string
) {
  let rawPoints: SeriesPoint[] = [];
  let resolution: SeriesResolution | undefined;
  if (Array.isArray(response)) {
    rawPoints = response;
  } else if (response && typeof response === "object") {
    const typed = response as SeriesResponse;
    resolution = isSeriesResolution(typed.resolution) ? typed.resolution : undefined;
    rawPoints =
      typed.points ?? typed.data ?? typed.series ?? ([] as SeriesPoint[]);
  }

  let invalidCount = 0;
  const points: NormalizedSeriesPoint[] = [];

  for (const point of rawPoints) {
    const ts = resolvePointTimestamp(point);
    const value = resolvePointValue(point, metricKey);
    if (!Number.isFinite(ts) || !Number.isFinite(value)) {
      invalidCount += 1;
      continue;
    }
    points.push({
      ts: ts as number,
      value: value as number,
      min: typeof point.min === "number" ? point.min : undefined,
      max: typeof point.max === "number" ? point.max : undefined,
      n: typeof point.n === "number" ? point.n : undefined,
    });
  }

  points.sort((a, b) => a.ts - b.ts);

  return { points, invalidCount, resolution };
}

export function mergeSeriesPoints(
  seriesByMetric: Record<string, NormalizedSeriesPoint[]>
): MergedSeriesPoint[] {
  const merged = new Map<number, MergedSeriesPoint>();

  Object.entries(seriesByMetric).forEach(([metricKey, points]) => {
    points.forEach((point) => {
      const entry = merged.get(point.ts) ?? { ts: point.ts };
      entry[metricKey] = point.value;
      merged.set(point.ts, entry);
    });
  });

  return Array.from(merged.values()).sort((a, b) => a.ts - b.ts);
}
