import { getPriorityClasses, getPriorityLabel, formatDisplayDate } from "@/lib/task-presenter";
import type { Task } from "@/types/task";

import { StatusBadge } from "@/components/StatusBadge";

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{task.title}</h2>
          <p className="mt-1 text-sm text-slate-500">Tạo lúc {formatDisplayDate(task.createdAt)}</p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-slate-500">Mức ưu tiên</dt>
          <dd className="mt-1">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(task.priority)}`}
            >
              {getPriorityLabel(task.priority)}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-slate-500">Hạn xử lý</dt>
          <dd className="mt-1 font-medium text-slate-700">{formatDisplayDate(task.dueDate)}</dd>
        </div>
      </dl>
    </article>
  );
}
