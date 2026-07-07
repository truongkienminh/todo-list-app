import { StatusBadge } from "@/components/tasks/StatusBadge";
import { formatDisplayDate, getPriorityClasses, getPriorityLabel } from "@/services/task/task-presenter";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
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

      <div className="mt-4 flex justify-end">
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
          onClick={() => onEdit(task)}
          type="button"
        >
          Sửa
        </button>
      </div>
    </article>
  );
}
