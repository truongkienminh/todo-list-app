import { TaskCompletionToggle } from "@/components/tasks/TaskCompletionToggle";
import { StatusBadge } from "@/components/tasks/StatusBadge";
import { formatDisplayDate, getPriorityClasses, getPriorityLabel } from "@/services/task/task-presenter";
import type { Task } from "@/types/task";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggleComplete: (task: Task) => void;
  loadingTaskIds: ReadonlySet<number>;
}

export function TaskTable({
  tasks,
  onEdit,
  onDelete,
  onToggleComplete,
  loadingTaskIds,
}: TaskTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr className="text-left text-sm font-medium text-slate-500">
            <th className="px-4 py-3">Công việc</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ưu tiên</th>
            <th className="px-4 py-3">Hạn xử lý</th>
            <th className="px-4 py-3">Ngày tạo</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tasks.map((task) => {
            const isTaskLoading = loadingTaskIds.has(task.id);

            return (
              <tr key={task.id} className="text-sm text-slate-700">
                <td className="px-4 py-4 font-medium text-slate-900">
                  <div className="flex items-center gap-3">
                    <TaskCompletionToggle
                      ariaLabel={`Đánh dấu hoàn thành cho công việc ${task.title}`}
                      checked={task.status === "COMPLETED"}
                      disabled={isTaskLoading}
                      isLoading={isTaskLoading}
                      onChange={() => onToggleComplete(task)}
                    />
                    <span>{task.title}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClasses(task.priority)}`}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
                </td>
                <td className="px-4 py-4">{formatDisplayDate(task.dueDate)}</td>
                <td className="px-4 py-4">{formatDisplayDate(task.createdAt)}</td>
                <td className="px-4 py-4 text-right">
                  <div className="flex justify-end gap-2">
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
