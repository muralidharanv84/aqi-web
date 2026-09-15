import { useQuery } from "@tanstack/react-query";
import { getLatest } from "../api/endpoints";
import type { LatestResponse } from "../api/types";

const DEFAULT_STALE_AFTER_MS = 5 * 60 * 1000;
// Outdoor readings are collected every 10 minutes and update roughly every 30.
const OUTDOOR_STALE_AFTER_MS = 60 * 60 * 1000;

export function useLatest(deviceId: string | undefined) {
  const staleAfterMs =
    deviceId === "bellezea-outdoor"
      ? OUTDOOR_STALE_AFTER_MS
      : DEFAULT_STALE_AFTER_MS;
  return useQuery({
    queryKey: ["latest", deviceId],
    queryFn: () => getLatest(deviceId ?? ""),
    enabled: Boolean(deviceId),
    refetchInterval: 30_000,
    select: (data: LatestResponse) => {
      const ageMs = Date.now() - data.ts * 1000;
      return { ...data, stale: ageMs > staleAfterMs };
    },
  });
}
