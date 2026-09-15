import { useQuery } from "@tanstack/react-query";
import { getDevices } from "../api/endpoints";
import type { DevicesResponse } from "../api/types";
import { DEFAULT_DEVICE_ID } from "../domain/devices";

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: getDevices,
    select: (response: DevicesResponse) =>
      [...(response.devices ?? [])].sort((a, b) => {
        const defaultOrder =
          Number(b.device_id === DEFAULT_DEVICE_ID) -
          Number(a.device_id === DEFAULT_DEVICE_ID);
        return defaultOrder || a.device_id.localeCompare(b.device_id);
      }),
  });
}
