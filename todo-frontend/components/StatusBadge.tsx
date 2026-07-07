import type { TaskStatus } from "@/types/task";

interface StatusBadgeProps {
  status: TaskStatus;
}

const statusMap: Record<
  TaskStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: "Chưa làm",
    className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  },
  IN_PROGRESS: {
    label: "Đang làm",
    className: "bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusMap[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
