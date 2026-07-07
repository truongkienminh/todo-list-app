import { STATUS_LABELS } from "@/constants/task.constants";
import type { TaskStatus } from "@/types/task";

interface StatusFilterProps {
  value?: TaskStatus;
  onChange: (status?: TaskStatus) => void;
  disabled?: boolean;
}

const STATUS_FILTER_OPTIONS: Array<{ label: string; value?: TaskStatus }> = [
  { label: "Tất cả" },
  { label: STATUS_LABELS.PENDING, value: "PENDING" },
  { label: STATUS_LABELS.IN_PROGRESS, value: "IN_PROGRESS" },
  { label: STATUS_LABELS.COMPLETED, value: "COMPLETED" },
];

export function StatusFilter({
  value,
  onChange,
  disabled = false,
}: StatusFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_FILTER_OPTIONS.map((option) => {
        const isActive = option.value === value || (!option.value && value === undefined);

        return (
          <button
            key={option.value ?? "ALL"}
            aria-pressed={isActive}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-slate-900 text-white shadow-sm"
                : "border border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
