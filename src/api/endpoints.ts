import { apiGet } from "./client";
import type { Device, LatestResponse, SeriesResponse } from "./types";

export function getDevices() {
  return apiGet<Device[]>("/api/v1/devices");
}

export function getLatest(deviceId: string) {
  return apiGet<LatestResponse>(`/api/v1/devices/${deviceId}/latest`);
}

type SeriesParams = {
  metric: string;
  from: number;
  to: number;
  resolution: "raw" | "1h" | "auto";
};

export function getSeries(deviceId: string, params: SeriesParams) {
  return apiGet<SeriesResponse>(`/api/v1/devices/${deviceId}/series`, params);
}
