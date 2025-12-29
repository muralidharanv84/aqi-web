import { useQuery } from "@tanstack/react-query";
import { getLatest } from "../api/endpoints";
import type { LatestResponse } from "../api/types";

const STALE_AFTER_MS = 5 * 60 * 1000;

export function useLatest(deviceId: string | undefined) {
  return useQuery({
    queryKey: ["latest", deviceId],
    queryFn: () => getLatest(deviceId ?? ""),
    enabled: Boolean(deviceId),
    refetchInterval: 30_000,
    select: (data: LatestResponse) => {
      const ageMs = Date.now() - data.ts * 1000;
      return { ...data, stale: ageMs > STALE_AFTER_MS };
    },
  });
}
