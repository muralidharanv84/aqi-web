export type MetricKey =
  | "aqi"
  | "pm25"
  | "co2"
  | "voc_index"
  | "voc_ppm"
  | "temperature_c"
  | "humidity";

export type MetricDefinition = {
  key: MetricKey;
  label: string;
  unit: string;
  apiKey: string;
};

export const METRICS: MetricDefinition[] = [
  { key: "aqi", label: "AQI", unit: "", apiKey: "aqi_us" },
  { key: "pm25", label: "PM2.5", unit: "ug/m3", apiKey: "pm25_ugm3" },
  { key: "co2", label: "CO2", unit: "ppm", apiKey: "co2_ppm" },
  { key: "voc_index", label: "VOC Index", unit: "", apiKey: "voc_index" },
  { key: "voc_ppm", label: "VOC", unit: "ppm", apiKey: "voc_ppm" },
  { key: "temperature_c", label: "Temperature", unit: "C", apiKey: "temp_c" },
  { key: "humidity", label: "Humidity", unit: "%", apiKey: "rh_pct" },
];

const METRIC_BY_KEY = new Map(METRICS.map((metric) => [metric.key, metric]));

export type MetricStatus = {
  label: string;
  color: string;
};

type MetricScale = {
  max: number;
  label: string;
  color: string;
};

const PM25_SCALE: MetricScale[] = [
  { max: 12, label: "Good", color: "#22c55e" },
  { max: 35.4, label: "Moderate", color: "#facc15" },
  { max: 55.4, label: "Sensitive", color: "#f97316" },
  { max: 150.4, label: "Unhealthy", color: "#ef4444" },
  { max: 250.4, label: "Very Unhealthy", color: "#dc2626" },
  { max: Number.POSITIVE_INFINITY, label: "Hazardous", color: "#7f1d1d" },
];

const CO2_SCALE: MetricScale[] = [
  { max: 800, label: "Fresh", color: "#22c55e" },
  { max: 1000, label: "Fair", color: "#facc15" },
  { max: 1500, label: "Poor", color: "#f97316" },
  { max: 2000, label: "Very Poor", color: "#ef4444" },
  { max: Number.POSITIVE_INFINITY, label: "Severe", color: "#7f1d1d" },
];

const VOC_INDEX_SCALE: MetricScale[] = [
  { max: 100, label: "Good", color: "#22c55e" },
  { max: 200, label: "Moderate", color: "#facc15" },
  { max: 300, label: "Poor", color: "#f97316" },
  { max: Number.POSITIVE_INFINITY, label: "Very Poor", color: "#ef4444" },
];

const VOC_PPM_SCALE: MetricScale[] = [
  { max: 0.3, label: "Good", color: "#22c55e" },
  { max: 0.5, label: "Moderate", color: "#facc15" },
  { max: 1.0, label: "Poor", color: "#f97316" },
  { max: Number.POSITIVE_INFINITY, label: "Very Poor", color: "#ef4444" },
];

export function getMetricDefinition(key: MetricKey): MetricDefinition {
  const definition = METRIC_BY_KEY.get(key);
  if (!definition) {
    throw new Error(`Unknown metric: ${key}`);
  }
  return definition;
}

export function getMetricStatus(
  key: MetricKey,
  value: number
): MetricStatus | null {
  const scale =
    key === "pm25"
      ? PM25_SCALE
      : key === "co2"
        ? CO2_SCALE
        : key === "voc_index"
          ? VOC_INDEX_SCALE
          : key === "voc_ppm"
            ? VOC_PPM_SCALE
            : null;

  if (!scale) {
    return null;
  }

  const match = scale.find((entry) => value <= entry.max) ?? scale[scale.length - 1];
  return { label: match.label, color: match.color };
}

export function formatMetricValue(key: MetricKey, value: number): string {
  const definition = getMetricDefinition(key);
  const rounded =
    key === "voc_ppm"
      ? value.toFixed(3)
      : Number.isInteger(value)
        ? value.toString()
        : value.toFixed(1);
  return definition.unit ? `${rounded} ${definition.unit}` : rounded;
}

export function getMetricApiKey(key: MetricKey): string {
  return getMetricDefinition(key).apiKey;
}
