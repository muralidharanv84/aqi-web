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
