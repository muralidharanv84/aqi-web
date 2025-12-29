import { useQuery } from "@tanstack/react-query";
import { getSeries } from "../api/endpoints";
import type { SeriesResponse } from "../api/types";
import { chooseSeriesResolution, normalizeSeriesPoints } from "../domain/series";

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
