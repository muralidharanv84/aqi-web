import { useMemo, useState } from "react";
import type React from "react";

type SparkPoint = {
  ts: number;
  value: number;
};

type SparklineProps = {
  points: SparkPoint[];
  metricLabel: string;
  rangeLabel: string;
};

type TooltipState = {
  x: number;
  y: number;
  point: SparkPoint;
} | null;

export default function Sparkline({
  points,
  metricLabel,
  rangeLabel,
}: SparklineProps) {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const safePoints = useMemo(
    () =>
      points.filter(
        (point) => Number.isFinite(point.value) && Number.isFinite(point.ts)
      ),
    [points]
  );

  const { path, min, max } = useMemo(() => {
    if (safePoints.length === 0) {
      return { path: "", min: 0, max: 0 };
    }
    const values = safePoints.map((point) => point.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = maxValue - minValue || 1;

    const coords = safePoints.map((point, index) => {
      const x = (index / (safePoints.length - 1 || 1)) * 100;
      const y = 100 - ((point.value - minValue) / range) * 100;
      return `${x},${y}`;
    });

    return {
      path: coords.join(" "),
      min: minValue,
      max: maxValue,
    };
  }, [safePoints]);

  function handlePointer(event: React.MouseEvent<SVGSVGElement>) {
    if (safePoints.length === 0) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - bounds.left) / bounds.width;
    const index = Math.min(
      safePoints.length - 1,
      Math.max(0, Math.round(ratio * (safePoints.length - 1)))
    );
    const point = safePoints[index];
    setTooltip({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      point,
    });
  }

  function handleLeave() {
    setTooltip(null);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div>{metricLabel}</div>
        <div>{rangeLabel}</div>
      </div>
      <div className="relative mt-4">
        <svg
          viewBox="0 0 100 100"
          className="h-28 w-full"
          onMouseMove={handlePointer}
          onMouseLeave={handleLeave}
        >
          {path ? (
            <polyline
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
              points={path}
            />
          ) : null}
          <line
            x1="0"
            y1="100"
            x2="100"
            y2="100"
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        </svg>
        {tooltip ? (
          <div
            className="pointer-events-none absolute max-w-[240px] rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow"
            style={{
              left: Math.min(tooltip.x + 8, 220),
              top: Math.max(tooltip.y - 32, 0),
            }}
          >
            <div className="font-semibold">{tooltip.point.value}</div>
            <div className="text-slate-500">
              {new Date(tooltip.point.ts * 1000).toLocaleString()}
            </div>
          </div>
        ) : null}
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {path ? `Range: ${min.toFixed(0)}-${max.toFixed(0)}` : "No data"}
      </div>
    </section>
  );
}
