export type Device = {
  device_id: string;
  timezone?: string;
};

export type DevicesResponse = {
  devices: Device[];
};

export type LatestResponse = {
  device_id: string;
  ts: number;
  metrics: Record<string, number | null | undefined>;
  [key: string]: unknown;
};

export type SeriesPoint = {
  ts?: number;
  t?: number;
  time?: number;
  timestamp?: number;
  value?: number;
  v?: number;
  avg?: number;
  min?: number;
  max?: number;
  n?: number;
  metrics?: Record<string, number | null | undefined>;
};

export type SeriesResponse = {
  metric?: string;
  resolution?: "raw" | "1h" | string;
  points?: SeriesPoint[];
  data?: SeriesPoint[];
  series?: SeriesPoint[];
  [key: string]: unknown;
};
