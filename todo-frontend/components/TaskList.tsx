import type { Task } from "@/types/task";

import { TaskCard } from "@/components/TaskCard";
import { TaskTable } from "@/components/TaskTable";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  showSkeleton: boolean;
}

function TaskListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="grid grid-cols-5 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-4 animate-pulse rounded bg-slate-200" />
          ))}
        </div>
        <div className="divide-y divide-slate-200">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="grid grid-cols-5 gap-4 px-4 py-4">
              {Array.from({ length: 5 }).map((__, cellIndex) => (
                <div
                  key={cellIndex}
                  className="h-4 animate-pulse rounded bg-slate-200"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="h-4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <svg
          aria-hidden="true"
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            d="M9 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 12l2 2 6-6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-4 text-base font-medium text-slate-900">Chưa có công việc nào</p>
      <p className="mt-2 text-sm text-slate-500">
        Hãy tạo công việc mới hoặc đổi bộ lọc để xem dữ liệu.
      </p>
    </div>
  );
}

export function TaskList({ tasks, isLoading, showSkeleton }: TaskListProps) {
  if (showSkeleton) {
    return <TaskListSkeleton rows={4} />;
  }

  return (
    <div className="relative">
      <div className={isLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="hidden md:block">
              <TaskTable tasks={tasks} />
            </div>
            <div className="space-y-3 md:hidden">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-xl bg-white/40 backdrop-blur-[1px]"
        />
      ) : null}
    </div>
  );
}
