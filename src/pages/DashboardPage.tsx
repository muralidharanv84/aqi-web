import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import AqiHero from "../components/AqiHero";
import DevicePicker from "../components/DevicePicker";
import MetricCards from "../components/MetricCards";
import MetricSegmentedControl from "../components/MetricSegmentedControl";
import Sparkline from "../components/Sparkline";
import { getAqiCategoryForValue } from "../domain/aqi";
import {
  formatMetricValue,
  getMetricApiKey,
  getMetricDefinition,
  getMetricStatus,
} from "../domain/metrics";
import type { MetricKey } from "../domain/metrics";
import { formatDateTime } from "../domain/time";
import { useDevices } from "../query/devices";
import { useLatest } from "../query/latest";
import { useSeries } from "../query/series";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const [sparkMetric, setSparkMetric] = useState<MetricKey>("aqi");

  const {
    data: devices = [],
    isLoading: devicesLoading,
    isError: devicesError,
    error: devicesErrorDetail,
  } = useDevices();
  const {
    data: latest,
    isLoading: latestLoading,
    isError: latestError,
    error: latestErrorDetail,
  } = useLatest(deviceId);

  const { from, to } = useMemo(() => {
    const end = Math.floor(Date.now() / 1000);
    return { from: end - 7 * 24 * 60 * 60, to: end };
  }, [deviceId, sparkMetric]);

  const {
    data: seriesData,
    isLoading: seriesLoading,
    isError: seriesError,
    error: seriesErrorDetail,
  } = useSeries({
    deviceId,
    metric: getMetricApiKey(sparkMetric),
    from,
    to,
  });
  const seriesPoints = seriesData?.points ?? [];
  const invalidSeriesCount = seriesData?.invalidCount ?? 0;
  const seriesSignature = useMemo(() => {
    if (seriesPoints.length === 0) {
      return "empty";
    }
    const first = seriesPoints[0];
    const last = seriesPoints[seriesPoints.length - 1];
    return `${seriesPoints.length}:${first.ts}:${first.value}:${last.ts}:${last.value}`;
  }, [seriesPoints]);

  const cards = useMemo(() => {
    if (!latest) {
      return [];
    }
    const entries: { key: MetricKey; value: number | null | undefined }[] = [
      { key: "pm25", value: latest.metrics?.pm25_ugm3 },
      { key: "co2", value: latest.metrics?.co2_ppm },
      { key: "voc_index", value: latest.metrics?.voc_index },
      { key: "voc_ppm", value: latest.metrics?.voc_ppm },
      { key: "temperature_c", value: latest.metrics?.temp_c },
      { key: "humidity", value: latest.metrics?.rh_pct },
    ];

    return entries
      .filter((entry) => entry.value !== null && entry.value !== undefined)
      .map((entry) => {
        const definition = getMetricDefinition(entry.key);
        const status = getMetricStatus(entry.key, entry.value as number);
        return {
          key: entry.key,
          label: definition.label,
          value: formatMetricValue(entry.key, entry.value as number),
          status,
        };
      });
  }, [latest]);

  const aqiValue = latest?.metrics?.aqi_us;
  const category =
    aqiValue !== null && aqiValue !== undefined
      ? getAqiCategoryForValue(aqiValue)
      : undefined;

  const lastUpdated = latest?.ts ? formatDateTime(latest.ts) : undefined;

  const sparkMetricLabel = getMetricDefinition(sparkMetric).label;

  const hasError = devicesError || latestError || seriesError;
  const isLoading = devicesLoading || latestLoading || seriesLoading;
  const hasInvalidSeries = invalidSeriesCount > 0;

  useEffect(() => {
    if (devicesErrorDetail) {
      console.error("Devices query failed", devicesErrorDetail);
    }
  }, [devicesErrorDetail]);

  useEffect(() => {
    if (latestErrorDetail) {
      console.error("Latest query failed", latestErrorDetail);
    }
  }, [latestErrorDetail]);

  useEffect(() => {
    if (seriesErrorDetail) {
      console.error("Series query failed", seriesErrorDetail);
    }
  }, [seriesErrorDetail]);

  const errorSources = [
    devicesError ? "devices" : null,
    latestError ? "latest" : null,
    seriesError ? "series" : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <AppShell
      deviceId={deviceId}
      headerRight={
        devices.length > 1 && deviceId ? (
          <DevicePicker
            devices={devices}
            value={deviceId}
            onChange={(nextId) => navigate(`/${nextId}/`)}
          />
        ) : null
      }
    >
      <div className="space-y-6">
        {hasError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Some data failed to load ({errorSources}). Showing the most recent cached values.
          </div>
        ) : null}
        {hasInvalidSeries ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Some chart points are invalid ({invalidSeriesCount}). The sparkline may be incomplete.
          </div>
        ) : null}
        {!deviceId && !devicesLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
            No device selected. Choose a device to begin.
          </div>
        ) : null}
        <AqiHero
          aqi={(aqiValue ?? null) as number | null}
          category={category}
          description={category?.description}
          lastUpdated={lastUpdated}
          stale={latest?.stale}
        />
        {isLoading && cards.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`metric-skeleton-${index}`}
                className="min-h-[88px] animate-pulse rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="h-3 w-16 rounded bg-slate-200" />
                <div className="mt-3 h-5 w-20 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : (
          <MetricCards metrics={cards} />
        )}
        <MetricSegmentedControl
          value={sparkMetric}
          options={[
            { label: "AQI", value: "aqi" },
            { label: "PM2.5", value: "pm25" },
            { label: "CO2", value: "co2" },
            { label: "VOC Index", value: "voc_index" },
            { label: "VOC", value: "voc_ppm" },
            { label: "Temp", value: "temperature_c" },
            { label: "RH", value: "humidity" },
          ]}
          onChange={(value) => setSparkMetric(value as MetricKey)}
        />
        {seriesLoading && seriesPoints.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-28 animate-pulse rounded bg-slate-100" />
          </div>
        ) : (
          <Sparkline
            points={seriesPoints}
            metricLabel={sparkMetricLabel}
            rangeLabel="Last 7 days"
            metricKey={sparkMetric}
            seriesSignature={seriesSignature}
          />
        )}
      </div>
    </AppShell>
  );
}
