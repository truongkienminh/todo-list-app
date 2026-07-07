"use client";

interface TaskCompletionToggleProps {
  checked: boolean;
  disabled: boolean;
  isLoading: boolean;
  onChange: () => void;
  ariaLabel: string;
}

export function TaskCompletionToggle({
  checked,
  disabled,
  isLoading,
  onChange,
  ariaLabel,
}: TaskCompletionToggleProps) {
  return (
    <label className="inline-flex items-center gap-2">
      <input
        aria-label={ariaLabel}
        checked={checked}
        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        onChange={onChange}
        type="checkbox"
      />
      {isLoading ? (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600"
        />
      ) : null}
    </label>
  );
}
