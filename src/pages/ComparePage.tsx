import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import ComparisonChart, { COMPARISON_COLORS } from "../components/ComparisonChart";
import MetricSegmentedControl from "../components/MetricSegmentedControl";
import TimeRangeSelector from "../components/TimeRangeSelector";
import { chooseComparisonDevices, getSharedMetrics } from "../domain/comparison";
import { formatMetricValue, selectAvailableMetrics } from "../domain/metrics";
import { chooseSeriesResolution, RESOLUTION_LABELS } from "../domain/series";
import { formatDateTime, isCalendarResolution } from "../domain/time";
import { CHART_RANGES, useChartRange } from "../query/chartRange";
import { useComparisonSeries } from "../query/comparison";
import { useDevices } from "../query/devices";
import { useLatest } from "../query/latest";
import type { Device } from "../api/types";

export default function ComparePage() {
  const navigate = useNavigate();
  const {deviceId} = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const devicesQuery = useDevices();
  const devices = devicesQuery.data ?? [];
  const {first, second} = chooseComparisonDevices(devices, deviceId, searchParams.get("with"));
  const firstLatest = useLatest(first?.device_id);
  const secondLatest = useLatest(second?.device_id);
  const sharedMetrics = useMemo(() => getSharedMetrics(firstLatest.data, secondLatest.data), [firstLatest.data, secondLatest.data]);
  const selectedMetric = selectAvailableMetrics([searchParams.get("metric") ?? "aqi"], sharedMetrics)[0];
  const metric = sharedMetrics.find((definition) => definition.key === selectedMetric);
  const {rangePreset, customFrom, customTo, from, to, rangeLabel, isCustomInvalid} = useChartRange(searchParams, "24h");
  const comparison = useComparisonSeries({
    firstDeviceId: first?.device_id ?? "", secondDeviceId: second?.device_id ?? "",
    metric: metric?.apiKey ?? "", from, to,
  }, Boolean(first && second && metric && !isCustomInvalid));
  const resolution = comparison.data?.resolution ?? (from === 0 ? "1h" : chooseSeriesResolution(from, to));
  const firstPoints = comparison.data?.first.points ?? [];
  const secondPoints = comparison.data?.second.points ?? [];
  const loadingMetrics = devicesQuery.isLoading || firstLatest.isLoading || secondLatest.isLoading;
  const metricError = devicesQuery.isError || firstLatest.isError || secondLatest.isError;
  const invalidCount = (comparison.data?.first.invalidCount ?? 0) + (comparison.data?.second.invalidCount ?? 0);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    setSearchParams(next, {replace: true});
  };

  useEffect(() => {
    if (!first || !second) return;
    const next = new URLSearchParams(searchParams);
    next.set("with", second.device_id);
    next.set("range", rangePreset);
    if (firstLatest.data && secondLatest.data) {
      if (selectedMetric) next.set("metric", selectedMetric);
      else next.delete("metric");
    }
    if (rangePreset === "custom") {
      next.set("from", customFrom);
      next.set("to", customTo);
    } else {
      next.delete("from");
      next.delete("to");
    }
    if (deviceId !== first.device_id) navigate(`/${first.device_id}/compare?${next}`, {replace: true});
    else if (next.toString() !== searchParams.toString()) setSearchParams(next, {replace: true});
  }, [first, second, deviceId, searchParams, rangePreset, selectedMetric, customFrom, customTo, firstLatest.data, secondLatest.data, navigate, setSearchParams]);

  const changeFirst = (nextId: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextId === second?.device_id && first) next.set("with", first.device_id);
    navigate(`/${nextId}/compare?${next}`);
  };

  return (
    <AppShell deviceId={first?.device_id ?? deviceId}>
      <div className="space-y-6">
        <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Compare monitors</h1>
            <p className="mt-2 text-sm text-slate-600">Compare the same metric over the same time range on one scale.</p>
          </div>
          {devicesQuery.isLoading ? <p className="text-sm text-slate-500">Loading monitors…</p> : first && second ? (
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <MonitorSelect label="First monitor" value={first.device_id} devices={devices} onChange={changeFirst} />
              <button type="button" onClick={() => changeFirst(second.device_id)} className="min-h-[44px] rounded-lg border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50">Swap</button>
              <MonitorSelect label="Second monitor" value={second.device_id} devices={devices.filter((device) => device.device_id !== first.device_id)} onChange={(value) => updateParam("with", value)} />
            </div>
          ) : !devicesQuery.isError ? <p className="text-sm text-slate-600">At least two monitors are needed to compare readings.</p> : null}
          {metricError ? (
            <div role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              Unable to load monitor readings. <button type="button" className="underline" onClick={() => { void devicesQuery.refetch(); if (first) void firstLatest.refetch(); if (second) void secondLatest.refetch(); }}>Retry</button>
            </div>
          ) : null}
          {first && second ? (
            <>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Metric</div>
                {loadingMetrics ? <p className="text-sm text-slate-500">Loading shared metrics…</p> : metric ? (
                  <MetricSegmentedControl value={metric.key} options={sharedMetrics.map((item) => ({label: item.label, value: item.key}))} onChange={(value) => updateParam("metric", value)} />
                ) : !metricError ? <p className="text-sm text-slate-600">These monitors don’t share a metric. Choose another monitor.</p> : null}
              </div>
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Range</div>
                <TimeRangeSelector value={rangePreset} options={CHART_RANGES} onChange={(value) => updateParam("range", value)} />
              </div>
              {rangePreset === "custom" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(["From", "To"] as const).map((label) => (
                    <label key={label} className="space-y-2 text-sm text-slate-600">
                      <span>{label}</span>
                      <input type="datetime-local" value={label === "From" ? customFrom : customTo}
                        onChange={(event) => updateParam(label.toLowerCase(), event.target.value)}
                        className="min-h-[44px] w-full rounded-lg border border-slate-300 px-3" />
                    </label>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </section>
        {first && second && metric ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {[{device: first, latest: firstLatest.data}, {device: second, latest: secondLatest.data}].map(({device, latest}, index) => (
                <section key={device.device_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{backgroundColor: COMPARISON_COLORS[index]}} />
                    <span className="break-all">{device.device_id}</span>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">Latest {metric.label}</div>
                  <div className="mt-1 text-3xl font-semibold">{formatMetricValue(metric.key, latest!.metrics[metric.apiKey] as number)}</div>
                  <div className="mt-2 text-xs text-slate-500">{formatDateTime(latest!.ts)}</div>
                  {latest?.stale ? <div className="mt-2 text-xs font-medium text-amber-700">Stale data · Last known reading</div> : null}
                </section>
              ))}
            </div>
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{metric.label}{metric.unit ? ` (${metric.unit})` : ""}</h2>
                <div className="text-sm text-slate-500">{rangeLabel} · {RESOLUTION_LABELS[resolution]}{isCalendarResolution(resolution) ? " · UTC" : ""}</div>
              </div>
              {comparison.isError ? <div role="alert" className="text-sm text-amber-800">Unable to load comparison. <button type="button" onClick={() => void comparison.refetch()} className="underline">Retry</button></div> : null}
              {isCustomInvalid ? <p className="text-sm text-amber-800">Choose a valid start and end time.</p> : comparison.isLoading ? (
                <div className="h-80 animate-pulse rounded-xl bg-slate-50" aria-label="Loading comparison" />
              ) : firstPoints.length || secondPoints.length ? (
                <>
                  <ComparisonChart firstName={first.device_id} secondName={second.device_id} first={firstPoints} second={secondPoints} metric={metric} resolution={resolution} />
                  {[{device: first, points: firstPoints}, {device: second, points: secondPoints}].filter(({points}) => points.length === 0).map(({device}) => (
                    <p key={device.device_id} className="text-sm text-slate-500">No readings for {device.device_id} in this range.</p>
                  ))}
                  <p className="text-xs text-slate-500">Each monitor is plotted at its recorded times. Lines connect available readings.</p>
                </>
              ) : !comparison.isError ? <p className="py-12 text-center text-sm text-slate-500">No readings for either monitor in this range.</p> : null}
              {invalidCount > 0 ? <p className="text-sm text-amber-800">Some invalid readings were omitted.</p> : null}
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function MonitorSelect({label, value, devices, onChange}: {label: string; value: string; devices: Device[]; onChange: (value: string) => void}) {
  return (
    <label className="min-w-0 space-y-2 text-sm text-slate-600">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-3 text-slate-900">
        {devices.map((device) => <option key={device.device_id} value={device.device_id}>{device.device_id}</option>)}
      </select>
    </label>
  );
}
