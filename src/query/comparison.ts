import { useQuery } from "@tanstack/react-query";
import { getSeries } from "../api/endpoints";
import { coarsestResolution } from "../domain/comparison";
import { chooseSeriesResolution, isSeriesResolution, normalizeSeriesPoints } from "../domain/series";

type ComparisonParams = {
  firstDeviceId: string;
  secondDeviceId: string;
  metric: string;
  from: number;
  to: number;
};

export async function loadComparisonSeries({firstDeviceId, secondDeviceId, metric, from, to}: ComparisonParams) {
  const requested = from === 0 ? "auto" : chooseSeriesResolution(from, to);
  const devices = [firstDeviceId, secondDeviceId];
  const initial = await Promise.all(devices.map((device) => getSeries(device, {metric, from, to, resolution: requested})));
  const resolution = requested === "auto"
    ? coarsestResolution(initial.map((response) => isSeriesResolution(response.resolution) ? response.resolution : "1h"))
    : requested;
  // Different histories may choose different All time intervals. Re-query the
  // finer series so both monitors use identical averaging periods and units.
  const responses = await Promise.all(initial.map((response, index) =>
    requested === "auto" && response.resolution !== resolution
      ? getSeries(devices[index], {metric, from, to, resolution})
      : response
  ));
  return {
    resolution,
    first: normalizeSeriesPoints(responses[0], metric),
    second: normalizeSeriesPoints(responses[1], metric),
  };
}

export function useComparisonSeries(params: ComparisonParams, enabled: boolean) {
  return useQuery({
    queryKey: ["comparison", params.firstDeviceId, params.secondDeviceId, params.metric, params.from, params.to],
    queryFn: () => loadComparisonSeries(params),
    enabled,
  });
}
