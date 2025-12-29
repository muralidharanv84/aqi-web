import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { MetricKey } from "../domain/metrics";
import { getMetricStatus } from "../domain/metrics";
import { getAqiCategory } from "../domain/aqi";
import { formatDateTimeMs } from "../domain/time";

type SparkPoint = {
  ts: number;
  value: number;
  min?: number;
  max?: number;
  n?: number;
};

type SparklineProps = {
  points: SparkPoint[];
  metricLabel: string;
  rangeLabel: string;
  metricKey: MetricKey;
};

export default function Sparkline({
  points,
  metricLabel,
  rangeLabel,
  metricKey,
}: SparklineProps) {
  const safePoints = useMemo(() => {
    return points.filter(
      (point) => Number.isFinite(point.value) && Number.isFinite(point.ts)
    );
  }, [points]);

  const chartData = useMemo(
    () =>
      safePoints.map((point) => ({
        ts: point.ts * 1000,
        value: point.value,
        min: point.min,
        max: point.max,
        n: point.n,
        status:
          metricKey === "aqi"
            ? getAqiCategory(point.value)
            : getMetricStatus(metricKey, point.value),
      })),
    [safePoints, metricKey]
  );

  const { maxValue, minValue } = useMemo(() => {
    if (safePoints.length === 0) {
      return { minValue: 0, maxValue: 0 };
    }
    const values = safePoints.map((point) => point.value);
    return { minValue: Math.min(...values), maxValue: Math.max(...values) };
  }, [safePoints]);

  const yMax = Math.max(0, maxValue);
  const yDomainMax = Math.max(1, Math.ceil(yMax * 1.1 * 10) / 10);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div>{metricLabel}</div>
        <div>{rangeLabel}</div>
      </div>
      <div className="relative mt-4">
        {safePoints.length === 0 ? (
          <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500">
            No data for this range.
          </div>
        ) : (
          <div className="h-40 w-full">
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
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
                  domain={[0, yDomainMax]}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(value) => (value as number).toFixed(1)}
                />
                <ReferenceLine y={0} stroke="#e2e8f0" />
                <Tooltip
                  content={<SparklineTooltip metricLabel={metricLabel} />}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0f172a"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={<ActiveDot />}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {safePoints.length
          ? `Range: ${minValue.toFixed(1)}-${maxValue.toFixed(1)}`
          : "No data"}
      </div>
    </section>
  );
}

function SparklineTooltip({
  active,
  payload,
  metricLabel,
}: TooltipProps<number, string> & { metricLabel: string }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }
  const data = payload[0]?.payload as {
    ts: number;
    value: number;
    min?: number;
    max?: number;
    n?: number;
    status?: { label: string; color: string } | null;
  };
  if (!data) {
    return null;
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-lg">
      <div className="text-[11px] uppercase tracking-wide text-slate-400">
        {metricLabel}
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="text-lg font-semibold text-slate-900">
          {data.value.toFixed(1)}
        </div>
        {data.status ? (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-slate-700"
            style={{ backgroundColor: `${data.status.color}22` }}
          >
            {data.status.label}
          </span>
        ) : null}
      </div>
      <div className="text-slate-500">
        {formatDateTimeMs(data.ts)}
      </div>
      {Number.isFinite(data.min) && Number.isFinite(data.max) ? (
        <div className="mt-1 text-slate-500">
          Min/Max: {data.min?.toFixed(1)} / {data.max?.toFixed(1)}
        </div>
      ) : null}
      {Number.isFinite(data.n) ? (
        <div className="text-slate-400">n={data.n}</div>
      ) : null}
    </div>
  );
}

function ActiveDot(props: {
  cx?: number;
  cy?: number;
  payload?: { status?: { color: string } | null };
}) {
  const { cx, cy, payload } = props;
  if (!Number.isFinite(cx) || !Number.isFinite(cy)) {
    return null;
  }
  const color = payload?.status?.color ?? "#0f172a";
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      stroke={color}
      strokeWidth={2}
      fill="#ffffff"
    />
  );
}
