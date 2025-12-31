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
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
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

          <div className="space-y-6">
            <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Built by
              </div>
              <div className="flex items-center gap-4">
                <img
                  src="https://pbs.twimg.com/profile_images/1537056121386684419/Pg3DrjAO_400x400.jpg"
                  alt="Muralidharan Venkatasubramanian"
                  className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    Muralidharan Venkatasubramanian
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 px-4 text-sm text-slate-700 transition hover:bg-slate-100"
                  href="https://x.com/_muralidharan_"
                  target="_blank"
                  rel="noreferrer"
                >
                  <XIcon className="h-4 w-4" />
                  X / Twitter
                </a>
                <a
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 px-4 text-sm text-slate-700 transition hover:bg-slate-100"
                  href="https://www.linkedin.com/in/muralidharanv/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <LinkedInIcon className="h-4 w-4" />
                  LinkedIn
                </a>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Why this exists
              </div>
              <p className="text-sm text-slate-600">
                This was built due to frustration with Bangalore's air quality in
                winter 2025 and with the unreliability of most indoor air quality
                monitors available at reasonable prices. The goal was a reliable,
                high-quality indoor AQI monitor based on high quality sensors and powerful visualization of the data.
              </p>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Open-source
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <a
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50"
                  href="https://github.com/muralidharanv84/airqualitymonitor"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitHubIcon className="h-4 w-4 text-slate-600" />
                  Air quality monitor software + design
                </a>
                <a
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50"
                  href="https://github.com/muralidharanv84/aqi-backend"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitHubIcon className="h-4 w-4 text-slate-600" />
                  Backend service
                </a>
                <a
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50"
                  href="https://github.com/muralidharanv84/aqi-web"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitHubIcon className="h-4 w-4 text-slate-600" />
                  Website source
                </a>
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Credits
              </div>
              <p className="text-sm text-slate-600">
                Huge thanks to{" "}
                <a
                  className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4"
                  href="https://x.com/whysrikar"
                  target="_blank"
                  rel="noreferrer"
                >
                  Srikar Yekollu
                </a>
                . His skill and knowledge made this project possible.
              </p>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M18.9 3H21l-6.8 7.78L22 21h-6.2l-4.8-6.2L6.1 21H3.9l7.3-8.32L2 3h6.3l4.4 5.7L18.9 3Z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h3.96v12H3V9Zm7.02 0H14v1.64h.06c.55-1.05 1.9-2.16 3.9-2.16 4.17 0 4.94 2.74 4.94 6.3V21H19v-5.47c0-1.3-.02-2.97-1.8-2.97-1.81 0-2.08 1.42-2.08 2.88V21h-3.1V9Z" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.6 2 12.28c0 4.5 2.87 8.3 6.84 9.65.5.1.68-.22.68-.48 0-.24-.01-1.02-.01-1.86-2.5.55-3.15-.63-3.35-1.2-.11-.29-.6-1.2-1.02-1.44-.35-.2-.85-.7-.01-.71.79-.02 1.35.74 1.53 1.05.9 1.56 2.34 1.12 2.91.85.09-.67.35-1.12.64-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.04 1.03-2.76-.1-.26-.45-1.33.1-2.77 0 0 .84-.27 2.75 1.05.8-.23 1.65-.34 2.5-.34.85 0 1.7.11 2.5.34 1.9-1.33 2.75-1.05 2.75-1.05.55 1.44.2 2.51.1 2.77.64.72 1.03 1.64 1.03 2.76 0 3.93-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.38-.01 2.48-.01 2.83 0 .26.18.58.68.48A10.02 10.02 0 0 0 22 12.28C22 6.6 17.52 2 12 2Z" />
    </svg>
  );
}
