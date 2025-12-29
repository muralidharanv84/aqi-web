type MetricCard = {
  key: string;
  label: string;
  value: string | number;
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
        >
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {metric.label}
          </div>
          <div className="mt-1 text-lg font-semibold text-slate-900">
            {metric.value}
          </div>
        </div>
      ))}
    </section>
  );
}
