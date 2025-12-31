type MetricMultiSelectOption = {
  label: string;
  value: string;
};

type MetricMultiSelectProps = {
  value: string[];
  options: MetricMultiSelectOption[];
  onChange: (value: string[]) => void;
  minSelected?: number;
};

export default function MetricMultiSelect({
  value,
  options,
  onChange,
  minSelected = 1,
}: MetricMultiSelectProps) {
  const handleToggle = (optionValue: string) => {
    const isActive = value.includes(optionValue);
    if (isActive) {
      if (value.length <= minSelected) {
        return;
      }
      onChange(value.filter((item) => item !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="flex w-full flex-wrap gap-2">
      {options.map((option) => {
        const active = value.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            className={`min-h-[44px] rounded-full px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
              active
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
            }`}
            onClick={() => handleToggle(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
