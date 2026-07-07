import { getPriorityClasses, getPriorityLabel, formatDisplayDate } from "@/lib/task-presenter";
import type { Task } from "@/types/task";

import { StatusBadge } from "@/components/StatusBadge";

interface TaskTableProps {
  tasks: Task[];
}

export function TaskTable({ tasks }: TaskTableProps) {
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
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tasks.map((task) => (
            <tr key={task.id} className="text-sm text-slate-700">
              <td className="px-4 py-4 font-medium text-slate-900">{task.title}</td>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
