import { useQuery } from "@tanstack/react-query";
import { getDevices } from "../api/endpoints";
import type { Device, DevicesResponse } from "../api/types";

export function useDevices() {
  return useQuery({
    queryKey: ["devices"],
    queryFn: getDevices,
    select: (response: DevicesResponse) =>
      [...(response.devices ?? [])].sort((a, b) =>
        a.device_id.localeCompare(b.device_id)
      ),
  });
}
