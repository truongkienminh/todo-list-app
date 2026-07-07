import { TaskCompletionToggle } from "@/components/tasks/TaskCompletionToggle";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { formatDisplayDate, getPriorityClasses, getPriorityLabel } from "@/services/task/task-presenter";
import type { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  isTaskLoading: boolean;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleComplete,
  isTaskLoading,
}: TaskCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <TaskCompletionToggle
            ariaLabel={`Đánh dấu hoàn thành cho công việc ${task.title}`}
            checked={task.status === "COMPLETED"}
            disabled={isTaskLoading}
            isLoading={isTaskLoading}
            onChange={() => onToggleComplete(task)}
          />
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-900">{task.title}</h2>
            <p className="mt-1 text-sm text-slate-500">Tạo lúc {formatDisplayDate(task.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {task.description ? (
        <p className="mt-4 text-sm leading-6 text-slate-600">{task.description}</p>
      ) : null}

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

      <div className="mt-4 flex justify-end gap-2">
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isTaskLoading}
          onClick={() => onEdit(task)}
          type="button"
        >
          Sửa
        </button>
        <button
          className="rounded-lg border border-rose-300 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isTaskLoading}
          onClick={() => onDelete(task)}
          type="button"
        >
          Xóa
        </button>
      </div>
    </article>
  );
}
