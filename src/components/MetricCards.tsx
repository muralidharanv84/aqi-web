type MetricCard = {
  key: string;
  label: string;
  value: string | number;
  status?: {
    label: string;
    color: string;
  } | null;
};

type MetricCardsProps = {
  metrics: MetricCard[];
};

export default function MetricCards({ metrics }: MetricCardsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.key}
          className="min-h-[88px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          style={
            metric.status?.color
              ? { borderLeft: `4px solid ${metric.status.color}` }
              : undefined
          }
        >
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {metric.label}
            </div>
            {metric.status ? (
              <span
                className="rounded-full px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                style={{ backgroundColor: `${metric.status.color}22` }}
              >
                {metric.status.label}
              </span>
            ) : null}
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-900">
            {metric.value}
          </div>
        </div>
      ))}
    </section>
  );
}
