type SegmentOption = {
  label: string;
  value: string;
};

type MetricSegmentedControlProps = {
  value: string;
  options: SegmentOption[];
  onChange: (value: string) => void;
};

export default function MetricSegmentedControl({
  value,
  options,
  onChange,
}: MetricSegmentedControlProps) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto rounded-full border border-slate-200 bg-white p-2 shadow-sm">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`min-h-[44px] whitespace-nowrap rounded-full px-4 text-sm transition ${
              active
                ? "bg-slate-900 text-white"
                : "bg-transparent text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
