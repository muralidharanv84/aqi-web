import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import AppShell from "../components/AppShell";
import DevicePicker from "../components/DevicePicker";
import MetricMultiSelect from "../components/MetricMultiSelect";
import TimeRangeSelector from "../components/TimeRangeSelector";
import {
  formatMetricValue,
  getMetricApiKey,
  getMetricDefinition,
  METRICS,
} from "../domain/metrics";
import type { MetricKey } from "../domain/metrics";
import { mergeSeriesPoints } from "../domain/series";
import type { NormalizedSeriesPoint } from "../domain/series";
import { formatDateTimeMs } from "../domain/time";
import { useDevices } from "../query/devices";
import { useMultiSeries } from "../query/series";

const METRIC_COLORS: Record<MetricKey, string> = {
  aqi: "#0f172a",
  pm25: "#f97316",
  co2: "#2563eb",
  voc_index: "#10b981",
  voc_ppm: "#14b8a6",
  temperature_c: "#ef4444",
  humidity: "#6366f1",
};

const DEFAULT_RANGE = "7d";

function formatDateTimeInput(value: Date) {
  const pad = (item: number) => item.toString().padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(
    value.getDate()
  )}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

export default function ChartsPage() {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const { data: devices = [] } = useDevices();
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(["aqi"]);
  const [rangePreset, setRangePreset] = useState(DEFAULT_RANGE);
  const [customFrom, setCustomFrom] = useState(() => {
    const now = new Date();
    const prior = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return formatDateTimeInput(prior);
  });
  const [customTo, setCustomTo] = useState(() => formatDateTimeInput(new Date()));

  const { from, to, rangeLabel, isCustomInvalid } = useMemo(() => {
    const end = Math.floor(Date.now() / 1000);
    if (rangePreset === "custom") {
      const fromMs = customFrom ? Date.parse(customFrom) : Number.NaN;
      const toMs = customTo ? Date.parse(customTo) : Number.NaN;
      const customInvalid =
        !Number.isFinite(fromMs) || !Number.isFinite(toMs) || fromMs >= toMs;
      return {
        from: customInvalid ? end - 7 * 24 * 60 * 60 : Math.floor(fromMs / 1000),
        to: customInvalid ? end : Math.floor(toMs / 1000),
        rangeLabel: "Custom",
        isCustomInvalid: customInvalid,
      };
    }

    let rangeSeconds = 7 * 24 * 60 * 60;
    let label = "7d";
    switch (rangePreset) {
      case "1h":
        rangeSeconds = 60 * 60;
        label = "1h";
        break;
      case "24h":
        rangeSeconds = 24 * 60 * 60;
        label = "24h";
        break;
      case "30d":
        rangeSeconds = 30 * 24 * 60 * 60;
        label = "30d";
        break;
      case "1y":
        rangeSeconds = 365 * 24 * 60 * 60;
        label = "1y";
        break;
      case "all":
        return { from: 0, to: end, rangeLabel: "All time", isCustomInvalid: false };
      case "7d":
      default:
        rangeSeconds = 7 * 24 * 60 * 60;
        label = "7d";
        break;
    }
    return { from: end - rangeSeconds, to: end, rangeLabel: label, isCustomInvalid: false };
  }, [customFrom, customTo, rangePreset]);

  const effectiveMetrics = isCustomInvalid ? [] : selectedMetrics;

  const metricOptions = METRICS.map((metric) => ({
    label: metric.label,
    value: metric.key,
  }));
  const metricApiKeys = effectiveMetrics.map((metricKey) =>
    getMetricApiKey(metricKey)
  );

  const { seriesByMetric, invalidCountByMetric, resolution } = useMultiSeries({
    deviceId,
    metrics: metricApiKeys,
    from,
    to,
  });

  const seriesByMetricKey = useMemo(() => {
    const map: Record<string, NormalizedSeriesPoint[]> = {};
    effectiveMetrics.forEach((metricKey) => {
      const apiKey = getMetricApiKey(metricKey);
      map[metricKey] = seriesByMetric.get(apiKey) ?? [];
    });
    return map;
  }, [effectiveMetrics, seriesByMetric]);

  const mergedSeries = useMemo(
    () => mergeSeriesPoints(seriesByMetricKey),
    [seriesByMetricKey]
  );

  const chartData = useMemo(
    () =>
      mergedSeries.map((point) => ({
        ...point,
        ts: point.ts * 1000,
      })),
    [mergedSeries]
  );

  const seriesPointLookup = useMemo(() => {
    const lookup: Record<MetricKey, Map<number, NormalizedSeriesPoint>> = {
      aqi: new Map(),
      pm25: new Map(),
      co2: new Map(),
      voc_index: new Map(),
      voc_ppm: new Map(),
      temperature_c: new Map(),
      humidity: new Map(),
    };
    selectedMetrics.forEach((metricKey) => {
      const points = seriesByMetricKey[metricKey] ?? [];
      points.forEach((point) => {
        lookup[metricKey].set(point.ts, point);
      });
    });
    return lookup;
  }, [selectedMetrics, seriesByMetricKey]);

  const invalidMetricSummary = Array.from(invalidCountByMetric.entries())
    .filter(([, count]) => count > 0)
    .map(([metric, count]) => {
      const metricKey = effectiveMetrics.find(
        (key) => getMetricApiKey(key) === metric
      );
      const label = metricKey
        ? getMetricDefinition(metricKey).label
        : metric;
      return `${label}: ${count}`;
    })
    .join(", ");

  const hasAqi = effectiveMetrics.includes("aqi");
  const leftAxisMetrics =
    effectiveMetrics.length === 0
      ? ([] as MetricKey[])
      : hasAqi
        ? (["aqi"] as MetricKey[])
        : ([effectiveMetrics[0]] as MetricKey[]);
  const rightAxisMetrics =
    effectiveMetrics.length === 0
      ? ([] as MetricKey[])
      : effectiveMetrics.filter((metric) => !leftAxisMetrics.includes(metric));

  return (
    <AppShell
      deviceId={deviceId}
      headerRight={
        devices.length > 0 && deviceId ? (
          <DevicePicker
            devices={devices}
            value={deviceId}
            onChange={(nextId) => navigate(`/${nextId}/charts`)}
          />
        ) : null
      }
    >
      <div className="space-y-6">
        {!deviceId ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No device selected. Choose a device to begin.
          </div>
        ) : null}
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Charts
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            Advanced trends
          </div>
          <div className="text-sm text-slate-600">
            Compare metrics and explore longer-term patterns.
          </div>
          <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Metrics
              </div>
              <MetricMultiSelect
                value={selectedMetrics}
                options={metricOptions}
                minSelected={1}
                onChange={(next) => setSelectedMetrics(next as MetricKey[])}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Range
              </div>
              <TimeRangeSelector
                value={rangePreset}
                options={[
                  { label: "1h", value: "1h" },
                  { label: "24h", value: "24h" },
                  { label: "7d", value: "7d" },
                  { label: "30d", value: "30d" },
                  { label: "1y", value: "1y" },
                  { label: "All time", value: "all" },
                  { label: "Custom", value: "custom" },
                ]}
                onChange={setRangePreset}
              />
            </div>
          </div>
          {rangePreset === "custom" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  From
                </span>
                <input
                  type="datetime-local"
                  value={customFrom}
                  onChange={(event) => setCustomFrom(event.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-600">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  To
                </span>
                <input
                  type="datetime-local"
                  value={customTo}
                  onChange={(event) => setCustomTo(event.target.value)}
                  className="w-full min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                />
              </label>
              {isCustomInvalid ? (
                <div className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Custom range needs a valid start and end time.
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
            <div>Trend view</div>
            <div>Range: {rangeLabel}</div>
          </div>
          {isCustomInvalid ? (
            <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
              Select a valid custom range to view data.
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500">
              No series data for this range.
            </div>
          ) : (
            <div className="h-72 w-full">
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                  <XAxis
                    dataKey="ts"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(value) => formatDateTimeMs(value as number)}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  {rightAxisMetrics.length ? (
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={40}
                    />
                  ) : null}
                  <Tooltip
                    content={
                      <ChartTooltip
                        selectedMetrics={effectiveMetrics}
                        seriesPointLookup={seriesPointLookup}
                        resolution={resolution}
                      />
                    }
                  />
                  <Legend />
                  {effectiveMetrics.map((metricKey) => (
                    <Line
                      key={metricKey}
                      type="monotone"
                      dataKey={metricKey}
                      yAxisId={
                        leftAxisMetrics.includes(metricKey) ? "left" : "right"
                      }
                      stroke={METRIC_COLORS[metricKey]}
                      strokeWidth={2}
                      dot={false}
                      isAnimationActive={false}
                      name={getMetricDefinition(metricKey).label}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {invalidMetricSummary ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Invalid points: {invalidMetricSummary}
            </div>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}

function ChartTooltip({
  active,
  payload,
  label,
  selectedMetrics,
  seriesPointLookup,
  resolution,
}: TooltipProps<number, string> & {
  selectedMetrics: MetricKey[];
  seriesPointLookup: Record<MetricKey, Map<number, NormalizedSeriesPoint>>;
  resolution: "raw" | "1h";
}) {
  if (!active || !payload || payload.length === 0 || typeof label !== "number") {
    return null;
  }
  const timestampSeconds = Math.floor(label / 1000);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">
        {formatDateTimeMs(label)}
      </div>
      <div className="mt-2 space-y-1">
        {selectedMetrics.map((metricKey) => {
          const point = seriesPointLookup[metricKey]?.get(timestampSeconds);
          const value =
            payload.find((entry) => entry.dataKey === metricKey)?.value ??
            point?.value;
          if (typeof value !== "number") {
            return null;
          }
          return (
            <div
              key={metricKey}
              className="flex items-center justify-between gap-4"
            >
              <span className="text-slate-500">
                {getMetricDefinition(metricKey).label}
              </span>
              <span className="font-semibold text-slate-900">
                {formatMetricValue(metricKey, value)}
              </span>
            </div>
          );
        })}
      </div>
      {resolution === "1h" ? (
        <div className="mt-2 space-y-1 text-[11px] text-slate-500">
          {selectedMetrics.map((metricKey) => {
            const point = seriesPointLookup[metricKey]?.get(timestampSeconds);
            if (!point || !Number.isFinite(point.min) || !Number.isFinite(point.max)) {
              return null;
            }
            return (
              <div key={`${metricKey}-minmax`}>
                {getMetricDefinition(metricKey).label}: min{" "}
                {formatMetricValue(metricKey, point.min as number)} / max{" "}
                {formatMetricValue(metricKey, point.max as number)}
                {Number.isFinite(point.n) ? ` · n=${point.n}` : ""}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
