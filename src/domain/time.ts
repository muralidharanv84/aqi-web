import type { SeriesResolution } from "./series";

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatDateTime(timestampSeconds: number) {
  return dateTimeFormatter.format(new Date(timestampSeconds * 1000));
}

export function formatDateTimeMs(timestampMs: number) {
  return dateTimeFormatter.format(new Date(timestampMs));
}

export function isCalendarResolution(resolution: SeriesResolution) {
  return resolution === "1d" || resolution === "1w" || resolution === "1mo";
}

export function formatChartTick(timestampMs: number, resolution: SeriesResolution) {
  const options: Intl.DateTimeFormatOptions =
    resolution === "raw" || resolution === "5m"
      ? { hour: "2-digit", minute: "2-digit", hour12: false }
      : resolution === "1mo"
        ? { month: "short", year: "numeric", timeZone: "UTC" }
        : { day: "2-digit", month: "short", ...(isCalendarResolution(resolution) ? { timeZone: "UTC" } : {}) };
  return new Intl.DateTimeFormat("en-GB", options).format(new Date(timestampMs));
}

export function formatChartPeriod(timestampMs: number, resolution: SeriesResolution) {
  if (!isCalendarResolution(resolution)) return formatDateTimeMs(timestampMs);
  const label = new Intl.DateTimeFormat("en-GB", {
    ...(resolution === "1mo" ? {} : { day: "2-digit" as const }),
    month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(timestampMs));
  return `${resolution === "1w" ? "Week of " : ""}${label} (UTC)`;
}
