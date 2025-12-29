import type { Device } from "../api/types";

type DevicePickerProps = {
  devices: Device[];
  value: string;
  onChange: (deviceId: string) => void;
};

export default function DevicePicker({
  devices,
  value,
  onChange,
}: DevicePickerProps) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-500">Device</span>
      <select
        className="min-h-[44px] rounded-lg border border-slate-300 bg-white px-3 text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {devices.map((device) => (
          <option key={device.device_id} value={device.device_id}>
            {device.device_id}
          </option>
        ))}
      </select>
    </label>
  );
}
