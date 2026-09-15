import { useMemo, useState } from "react";

export const CHART_RANGES = [
  { label: "1h", value: "1h", seconds: 3600 },
  { label: "4h", value: "4h", seconds: 4 * 3600 },
  { label: "12h", value: "12h", seconds: 12 * 3600 },
  { label: "24h", value: "24h", seconds: 86400 },
  { label: "7d", value: "7d", seconds: 7 * 86400 },
  { label: "30d", value: "30d", seconds: 30 * 86400 },
  { label: "1y", value: "1y", seconds: 365 * 86400 },
  { label: "All time", value: "all", seconds: 0 },
  { label: "Custom", value: "custom", seconds: 0 },
];

function formatInput(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function useChartRange(searchParams: URLSearchParams, defaultRange = "7d") {
  const rangePreset = CHART_RANGES.some((range) => range.value === searchParams.get("range"))
    ? searchParams.get("range") as string : defaultRange;
  const [defaults] = useState(() => {
    const now = Date.now();
    return { from: formatInput(new Date(now - 7 * 86400_000)), to: formatInput(new Date(now)) };
  });
  const customFrom = searchParams.get("from") ?? defaults.from;
  const customTo = searchParams.get("to") ?? defaults.to;
  const bounds = useMemo(() => {
    const to = Math.floor(Date.now() / 1000);
    const range = CHART_RANGES.find((option) => option.value === rangePreset)!;
    if (rangePreset === "custom") {
      const fromMs = customFrom ? Date.parse(customFrom) : Number.NaN;
      const toMs = customTo ? Date.parse(customTo) : Number.NaN;
      const isCustomInvalid = !Number.isFinite(fromMs) || !Number.isFinite(toMs) || fromMs >= toMs;
      return {
        from: isCustomInvalid ? to - 7 * 86400 : Math.floor(fromMs / 1000),
        to: isCustomInvalid ? to : Math.floor(toMs / 1000),
        rangeLabel: range.label, isCustomInvalid,
      };
    }
    return { from: rangePreset === "all" ? 0 : to - range.seconds, to, rangeLabel: range.label, isCustomInvalid: false };
  }, [rangePreset, customFrom, customTo]);
  return { rangePreset, customFrom, customTo, ...bounds };
}
