import type { TaskPriority } from "@/types/task";

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

export function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case "HIGH":
      return "Cao";
    case "MEDIUM":
      return "Trung bình";
    case "LOW":
      return "Thấp";
    default:
      return priority;
  }
}

export function getPriorityClasses(priority: TaskPriority): string {
  switch (priority) {
    case "HIGH":
      return "bg-rose-100 text-rose-700 ring-1 ring-inset ring-rose-200";
    case "MEDIUM":
      return "bg-amber-100 text-amber-700 ring-1 ring-inset ring-amber-200";
    case "LOW":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
    default:
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  }
}
