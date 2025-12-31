type TimeRangeOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type TimeRangeSelectorProps = {
  value: string;
  options: TimeRangeOption[];
  onChange: (value: string) => void;
};

export default function TimeRangeSelector({
  value,
  options,
  onChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            className={`min-h-[44px] rounded-full px-4 text-sm transition ${
              option.disabled
                ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                : active
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => onChange(option.value)}
            disabled={option.disabled}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
