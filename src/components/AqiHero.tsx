import type { AqiCategory } from "../domain/aqi";

type AqiHeroProps = {
  aqi: number | null;
  category?: AqiCategory;
  description?: string;
  lastUpdated?: string;
  stale?: boolean;
};

export default function AqiHero({
  aqi,
  category,
  description,
  lastUpdated,
  stale,
}: AqiHeroProps) {
  const background = category?.color ?? "#e2e8f0";
  const tint = `${background}33`;

  return (
    <section
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      style={{
        boxShadow: `0 0 0 2px ${background}55`,
        borderColor: `${background}80`,
      }}
    >
      <div
        className="absolute inset-0 opacity-10"
        style={{ background: tint }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
          Current AQI
        </div>
        <div className="mt-2 text-5xl font-semibold leading-none text-slate-900 sm:text-6xl">
          {aqi ?? "--"}
        </div>
        <div className="mt-2 text-lg font-semibold text-slate-800">
          {category?.label ?? "Unknown"}
        </div>
        <div className="mt-1 text-sm text-slate-600">
          {description ?? category?.description ?? ""}
        </div>
        <div className="mt-4 text-xs text-slate-500">
          Last updated: {lastUpdated ?? "--"}
          {stale ? " (stale)" : ""}
        </div>
      </div>
    </section>
  );
}
