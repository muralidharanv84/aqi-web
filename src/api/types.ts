export type Device = {
  id: string;
  name?: string;
  timezone?: string;
};

export type LatestResponse = {
  timestamp: number;
  aqi: number | null;
  pm25: number | null;
  co2: number | null;
  voc_index: number | null;
  voc_ppm: number | null;
  temperature_c: number | null;
  humidity: number | null;
  [key: string]: unknown;
};

export type SeriesPoint = {
  ts: number;
  value: number;
  min?: number;
  max?: number;
  n?: number;
};

export type SeriesResponse = {
  metric: string;
  resolution: "raw" | "1h" | string;
  points: SeriesPoint[];
};
