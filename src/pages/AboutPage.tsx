import { useNavigate, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import DevicePicker from "../components/DevicePicker";
import { AQI_CATEGORIES } from "../domain/aqi";
import { useDevices } from "../query/devices";

export default function AboutPage() {
  const navigate = useNavigate();
  const { deviceId } = useParams();
  const {
    data: devices = [],
    isError: devicesError,
  } = useDevices();

  return (
    <AppShell
      deviceId={deviceId}
      headerRight={
        devices.length > 0 && deviceId ? (
          <DevicePicker
            devices={devices}
            value={deviceId}
            onChange={(nextId) => navigate(`/${nextId}/about`)}
          />
        ) : null
      }
    >
      <div className="space-y-6">
        {devicesError ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Some data failed to load (devices). Showing the most recent cached values.
          </div>
        ) : null}
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
            About AQI
          </div>
          <div className="text-2xl font-semibold text-slate-900">
            Understanding air quality
          </div>
          <div className="text-sm text-slate-600">
            The Air Quality Index (AQI) summarizes multiple pollutants into a
            single, easy-to-read number. Higher values mean worse air quality.
          </div>
          <a
            className="inline-flex min-h-[44px] items-center rounded-full border border-slate-200 px-4 text-sm text-slate-700 transition hover:bg-slate-100"
            href="https://www.airnow.gov/aqi/aqi-basics/"
            target="_blank"
            rel="noreferrer"
          >
            What is AQI? (AirNow)
          </a>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
            AQI categories
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {AQI_CATEGORIES.map((category) => (
              <div
                key={category.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                style={{ borderLeft: `6px solid ${category.color}` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-base font-semibold text-slate-900">
                    {category.label}
                  </div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {category.min}–{Number.isFinite(category.max) ? category.max : "∞"}
                  </div>
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  {category.description}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
