import { PRIORITY_LABELS, STATUS_COLORS, STATUS_LABELS } from "@/constants/task.constants";
import type { TaskPriority, TaskStatus } from "@/types/task";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDisplayDate(value: string | null): string {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return dateFormatter.format(date);
}

export function formatDateTimeLocalValue(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getStatusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusClasses(status: TaskStatus): string {
  return STATUS_COLORS[status] ?? STATUS_COLORS.PENDING;
}

export function getPriorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority] ?? priority;
}

export function getPriorityClasses(priority: TaskPriority): string {
  switch (priority) {
    case "HIGH":
      return "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200";
    case "MEDIUM":
      return "bg-yellow-100 text-yellow-800 ring-1 ring-inset ring-yellow-200";
    case "LOW":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
}
