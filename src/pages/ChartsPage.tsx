import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import DevicePicker from "../components/DevicePicker";
import { useDevices } from "../query/devices";

export default function ChartsPage() {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const { data: devices = [] } = useDevices();

  return (
    <AppShell
      deviceId={deviceId}
      headerRight={
        devices.length > 0 && deviceId ? (
          <DevicePicker
            devices={devices}
            value={deviceId}
            onChange={(nextId) => navigate(`/${nextId}/charts`)}
          />
        ) : null
      }
    >
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Charts
        </div>
        <div className="text-2xl font-semibold text-slate-900">
          Advanced trends
        </div>
        <div className="text-sm text-slate-600">
          This page will include multi-metric charts, time range controls, and
          deeper trend analysis.
        </div>
      </section>
    </AppShell>
  );
}
