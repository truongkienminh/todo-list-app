import type { TaskPriority, TaskStatus } from "@/types/task";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Chưa làm",
  IN_PROGRESS: "Đang làm",
  COMPLETED: "Hoàn thành",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Thấp",
  MEDIUM: "Trung bình",
  HIGH: "Cao",
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

export const STATUS_OPTIONS: Array<{ value: TaskStatus; label: string }> = [
  { value: "PENDING", label: STATUS_LABELS.PENDING },
  { value: "IN_PROGRESS", label: STATUS_LABELS.IN_PROGRESS },
  { value: "COMPLETED", label: STATUS_LABELS.COMPLETED },
];

export const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: "LOW", label: PRIORITY_LABELS.LOW },
  { value: "MEDIUM", label: PRIORITY_LABELS.MEDIUM },
  { value: "HIGH", label: PRIORITY_LABELS.HIGH },
];
