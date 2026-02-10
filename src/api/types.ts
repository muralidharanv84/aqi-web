export type Device = {
  device_id: string;
  timezone?: string;
};

export type DevicesResponse = {
  devices: Device[];
};

export type FanControlEventStatus = "success" | "skipped_stale" | "error";
export type FanControlErrorStatus = "skipped_stale" | "error";

export type FanControlLatestEvent = {
  run_ts: number;
  status: FanControlEventStatus;
  purifier_device_ids: string[];
  speed: string | null;
  error_message: string | null;
};

export type FanControlLatestError = {
  run_ts: number;
  status: FanControlErrorStatus;
  message: string;
  error_streak: number;
};

export type FanControlState = {
  latest_event: FanControlLatestEvent | null;
  latest_error: FanControlLatestError | null;
};

export type LatestResponse = {
  device_id: string;
  ts: number;
  metrics: Record<string, number | null | undefined>;
  fan_control?: FanControlState | null;
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
