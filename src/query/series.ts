import { useQuery, useQueries } from "@tanstack/react-query";
import { getSeries } from "../api/endpoints";
import type { SeriesResponse } from "../api/types";
import {
  chooseSeriesResolution,
  normalizeSeriesPoints,
  type NormalizedSeriesPoint,
} from "../domain/series";

export type SeriesQuery = {
  deviceId: string | undefined;
  metric: string;
  from: number;
  to: number;
  resolution?: "raw" | "1h";
};

export function useSeries(params: SeriesQuery) {
  const { deviceId, metric, from, to, resolution } = params;
  const resolvedResolution = resolution ?? chooseSeriesResolution(from, to);
  return useQuery({
    queryKey: ["series", deviceId, metric, from, to, resolvedResolution],
    queryFn: () =>
      getSeries(deviceId ?? "", {
        metric,
        from,
        to,
        resolution: resolvedResolution,
      }),
    enabled: Boolean(deviceId && metric),
    select: (data: SeriesResponse) => normalizeSeriesPoints(data, metric),
  });
}

type MultiSeriesQuery = {
  deviceId: string | undefined;
  metrics: string[];
  from: number;
  to: number;
  resolution?: "raw" | "1h";
};

export function useMultiSeries(params: MultiSeriesQuery) {
  const { deviceId, metrics, from, to, resolution } = params;
  const resolvedResolution = resolution ?? chooseSeriesResolution(from, to);
  const queries = useQueries({
    queries: metrics.map((metric) => ({
      queryKey: ["series", deviceId, metric, from, to, resolvedResolution],
      queryFn: () =>
        getSeries(deviceId ?? "", {
          metric,
          from,
          to,
          resolution: resolvedResolution,
        }),
      enabled: Boolean(deviceId && metric),
      select: (data: SeriesResponse) => normalizeSeriesPoints(data, metric),
    })),
  });

  const seriesByMetric = new Map<string, NormalizedSeriesPoint[]>();
  const invalidCountByMetric = new Map<string, number>();

  queries.forEach((query, index) => {
    const metric = metrics[index];
    const normalized = query.data;
    seriesByMetric.set(metric, normalized?.points ?? []);
    invalidCountByMetric.set(metric, normalized?.invalidCount ?? 0);
  });

  return {
    queries,
    seriesByMetric,
    invalidCountByMetric,
    resolution: resolvedResolution,
  };
}
