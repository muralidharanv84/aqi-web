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
  const hasAttemptError =
    latestEvent?.status === "error" || latestEvent?.status === "skipped_stale";
  const matchingLatestError =
    latestEvent && latestError && latestError.run_ts === latestEvent.run_ts
      ? latestError
      : null;

  const lastRun =
    latestEvent?.run_ts !== undefined ? formatDateTime(latestEvent.run_ts) : DASH;
  const speed = latestEvent?.speed ?? DASH;
  const purifierIds =
    latestEvent && latestEvent.purifier_device_ids.length > 0
      ? latestEvent.purifier_device_ids.join(", ")
      : DASH;

  const hasEvent = Boolean(latestEvent);
  const errorStatus = hasAttemptError ? latestEvent.status : null;
  const errorMessage =
    matchingLatestError?.message ?? latestEvent?.error_message ?? "Control run failed";
  const errorStreak = matchingLatestError?.error_streak;
  const errorBadgeClass =
    errorStatus === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
  const errorPanelClass =
    errorStatus === "error"
      ? "border-red-200 bg-red-50"
      : "border-amber-200 bg-amber-50";
  const errorTextClass = errorStatus === "error" ? "text-red-800" : "text-amber-800";
  const errorSubTextClass = errorStatus === "error" ? "text-red-700" : "text-amber-700";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Purifier Control
        </h2>
      </div>

      {hasAttemptError ? (
        <div className={`mt-3 rounded-xl border p-3 ${errorPanelClass}`}>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${errorBadgeClass}`}
            >
              {errorStatus}
            </span>
            <span className="text-xs text-slate-600">
              {lastRun}
            </span>
          </div>
          <div className={`mt-2 text-sm font-medium ${errorTextClass}`}>
            {errorMessage}
          </div>
          <div className={`mt-1 text-xs ${errorSubTextClass}`}>
            Error streak: {errorStreak ?? DASH}
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
