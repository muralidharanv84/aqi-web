import { useMemo } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipProps } from "recharts";
import { mergeComparisonSeries } from "../domain/comparison";
import { formatMetricValue } from "../domain/metrics";
import type { MetricDefinition } from "../domain/metrics";
import type { NormalizedSeriesPoint, SeriesResolution } from "../domain/series";
import { formatChartPeriod, formatChartTick } from "../domain/time";

export const COMPARISON_COLORS = ["#2563eb", "#c2410c"] as const;

type Props = {
  firstName: string;
  secondName: string;
  first: NormalizedSeriesPoint[];
  second: NormalizedSeriesPoint[];
  metric: MetricDefinition;
  resolution: SeriesResolution;
};

export default function ComparisonChart(props: Props) {
  const {firstName, secondName, first, second, metric, resolution} = props;
  const data = useMemo(() => mergeComparisonSeries(first, second), [first, second]);
  const lookups = useMemo(() => [first, second].map((points) =>
    new Map(points.map((point) => [point.ts, point]))
  ), [first, second]);
  return (
    <div className="h-80 w-full" role="region" aria-label={`${metric.label} comparison chart`}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{top: 8, right: 16, left: 0, bottom: 8}}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
          <XAxis dataKey="ts" type="number" scale="time" domain={["dataMin", "dataMax"]}
            tickFormatter={(value) => formatChartTick(value as number, resolution)}
            tick={{fill: "#64748b", fontSize: 11}} axisLine={false} tickLine={false} minTickGap={40} tickCount={6} />
          <YAxis tick={{fill: "#64748b", fontSize: 11}} axisLine={false} tickLine={false} width={48} />
          <Tooltip content={<ComparisonTooltip names={[firstName, secondName]} lookups={lookups} metric={metric} resolution={resolution} />} />
          <Legend wrapperStyle={{fontSize: 12, overflowWrap: "anywhere"}} />
          {(["first", "second"] as const).map((key, index) => (
            <Line key={key} dataKey={key} name={index === 0 ? firstName : secondName}
              type="monotone" stroke={COMPARISON_COLORS[index]} strokeWidth={2.5}
              dot={(index === 0 ? first : second).length === 1}
              connectNulls isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ComparisonTooltip({active, label, names, lookups, metric, resolution}: TooltipProps<number, string> & {
  names: string[];
  lookups: Map<number, NormalizedSeriesPoint>[];
  metric: MetricDefinition;
  resolution: SeriesResolution;
}) {
  if (!active || typeof label !== "number") return null;
  return (
    <div className="max-w-xs space-y-3 rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-lg">
      <div className="text-slate-500">{formatChartPeriod(label, resolution)}</div>
      {names.map((name, index) => {
        const point = lookups[index].get(label / 1000);
        return (
          <div key={name}>
            <div className="break-all font-medium" style={{color: COMPARISON_COLORS[index]}}>{name}</div>
            <div className="mt-1 font-semibold text-slate-900">
              {point ? formatMetricValue(metric.key, point.value) : "No reading at this time"}
            </div>
            {point && resolution !== "raw" && Number.isFinite(point.min) && Number.isFinite(point.max) ? (
              <div className="mt-1 text-slate-500">
                Min {formatMetricValue(metric.key, point.min!)} · Max {formatMetricValue(metric.key, point.max!)}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
