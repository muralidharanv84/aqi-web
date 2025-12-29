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

export function getMetricDefinition(key: MetricKey): MetricDefinition {
  const definition = METRIC_BY_KEY.get(key);
  if (!definition) {
    throw new Error(`Unknown metric: ${key}`);
  }
  return definition;
}

export function formatMetricValue(key: MetricKey, value: number): string {
  const definition = getMetricDefinition(key);
  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return definition.unit ? `${rounded} ${definition.unit}` : rounded;
}

export function getMetricApiKey(key: MetricKey): string {
  return getMetricDefinition(key).apiKey;
}
