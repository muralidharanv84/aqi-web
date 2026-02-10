import type { FanControlState } from "../api/types";
import { formatDateTime } from "../domain/time";

type PurifierControlPanelProps = {
  fanControl?: FanControlState | null;
};

const DASH = "\u2014";

export default function PurifierControlPanel({
  fanControl,
}: PurifierControlPanelProps) {
  const latestEvent = fanControl?.latest_event ?? null;
  const latestError = fanControl?.latest_error ?? null;

  const lastRun =
    latestEvent?.run_ts !== undefined ? formatDateTime(latestEvent.run_ts) : DASH;
  const speed = latestEvent?.speed ?? DASH;
  const purifierIds =
    latestEvent && latestEvent.purifier_device_ids.length > 0
      ? latestEvent.purifier_device_ids.join(", ")
      : DASH;

  const hasEvent = Boolean(latestEvent);
  const errorBadgeClass =
    latestError?.status === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
  const errorPanelClass =
    latestError?.status === "error"
      ? "border-red-200 bg-red-50"
      : "border-amber-200 bg-amber-50";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Purifier Control
        </h2>
      </div>

      {latestError ? (
        <div className={`mt-3 rounded-xl border p-3 ${errorPanelClass}`}>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${errorBadgeClass}`}
            >
              {latestError.status}
            </span>
            <span className="text-xs text-slate-600">
              {formatDateTime(latestError.run_ts)}
            </span>
          </div>
          <div className="mt-2 text-sm font-medium text-red-800">
            {latestError.message}
          </div>
          <div className="mt-1 text-xs text-red-700">
            Error streak: {latestError.error_streak}
          </div>
        </div>
      ) : null}

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Last control run</dt>
          <dd className="mt-1 font-medium text-slate-900">{lastRun}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Last set speed</dt>
          <dd className="mt-1 font-medium text-slate-900">{speed}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">Target purifier IDs</dt>
          <dd className="mt-1 break-all font-medium text-slate-900">{purifierIds}</dd>
        </div>
      </dl>

      {!hasEvent ? (
        <div className="mt-3 text-xs text-slate-500">
          No control run has been recorded yet.
        </div>
      ) : null}
    </section>
  );
}
