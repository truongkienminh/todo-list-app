"use client";

import { useEffect, useRef, useState } from "react";

import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { TaskList } from "@/components/tasks/TaskList";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Pagination } from "@/components/ui/Pagination";
import { Toast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api-client";
import { changeStatus, deleteTask, getTasks } from "@/services/task/task-service";
import type { Page, Task, TaskStatus } from "@/types/task";

const sortOptions = [
  { value: "createdAt,desc", label: "Ngày tạo mới nhất" },
  { value: "createdAt,asc", label: "Ngày tạo cũ nhất" },
  { value: "dueDate,asc", label: "Hạn xử lý sớm nhất" },
  { value: "dueDate,desc", label: "Hạn xử lý muộn nhất" },
  { value: "priority,desc", label: "Ưu tiên cao đến thấp" },
  { value: "priority,asc", label: "Ưu tiên thấp đến cao" },
];

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; task: Task }
  | null;

type ToastState = {
  message: string;
  variant: "success" | "error";
} | null;

type ConfirmDeleteState = {
  id: number;
  title: string;
} | null;

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể tải danh sách công việc.";
}

function updateTaskInPage(
  currentPage: Page<Task> | null,
  taskId: number,
  updater: (task: Task) => Task,
): Page<Task> | null {
  if (!currentPage) {
    return currentPage;
  }

  return {
    ...currentPage,
    content: currentPage.content.map((task) => (task.id === taskId ? updater(task) : task)),
  };
}

function removeTaskFromPage(currentPage: Page<Task> | null, taskId: number): Page<Task> | null {
  if (!currentPage) {
    return currentPage;
  }

  const nextContent = currentPage.content.filter((task) => task.id !== taskId);
  const nextTotalElements = Math.max(0, currentPage.totalElements - 1);
  const nextTotalPages = nextTotalElements === 0 ? 0 : Math.ceil(nextTotalElements / currentPage.size);

  return {
    ...currentPage,
    content: nextContent,
    totalElements: nextTotalElements,
    totalPages: nextTotalPages,
    first: currentPage.number === 0,
    last: nextTotalPages === 0 ? true : currentPage.number >= nextTotalPages - 1,
  };
}

export default function HomePage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("createdAt,desc");
  const [taskPage, setTaskPage] = useState<Page<Task> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [toastState, setToastState] = useState<ToastState>(null);
  const [confirmDeleteState, setConfirmDeleteState] = useState<ConfirmDeleteState>(null);
  const [loadingTaskIds, setLoadingTaskIds] = useState<Set<number>>(() => new Set());
  const requestSequence = useRef(0);
  const loadingTaskIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const currentRequest = requestSequence.current + 1;
    requestSequence.current = currentRequest;

    setIsLoading(true);

    void getTasks({ page, size, sort })
      .then((response) => {
        if (requestSequence.current !== currentRequest) {
          return;
        }

        setTaskPage(response);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (requestSequence.current !== currentRequest) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (requestSequence.current !== currentRequest) {
          return;
        }

        setIsLoading(false);
      });
  }, [page, reloadKey, size, sort]);

  function addLoadingTaskId(taskId: number) {
    loadingTaskIdsRef.current = new Set(loadingTaskIdsRef.current).add(taskId);
    setLoadingTaskIds((current) => {
      const next = new Set(current);
      next.add(taskId);
      return next;
    });
  }

  function removeLoadingTaskId(taskId: number) {
    const nextLoadingTaskIds = new Set(loadingTaskIdsRef.current);
    nextLoadingTaskIds.delete(taskId);
    loadingTaskIdsRef.current = nextLoadingTaskIds;

    setLoadingTaskIds((current) => {
      const next = new Set(current);
      next.delete(taskId);
      return next;
    });
  }

  async function handleToggleComplete(task: Task) {
    if (loadingTaskIdsRef.current.has(task.id)) {
      return;
    }

    const nextStatus: TaskStatus = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    const previousTask = { ...task };

    addLoadingTaskId(task.id);
    setTaskPage((current) =>
      updateTaskInPage(current, task.id, (currentTask) => ({
        ...currentTask,
        status: nextStatus,
        completedAt: nextStatus === "COMPLETED" ? new Date().toISOString() : null,
      })),
    );

    try {
      const updatedTask = await changeStatus(task.id, nextStatus);
      setTaskPage((current) => updateTaskInPage(current, task.id, () => updatedTask));
    } catch (error: unknown) {
      setTaskPage((current) => updateTaskInPage(current, task.id, () => previousTask));
      setToastState({
        message: getErrorMessage(error),
        variant: "error",
      });
    } finally {
      removeLoadingTaskId(task.id);
    }
  }

  function handleDeleteRequest(task: Task) {
    if (loadingTaskIdsRef.current.has(task.id)) {
      return;
    }

    setConfirmDeleteState({
      id: task.id,
      title: task.title,
    });
  }

  async function handleConfirmDelete() {
    if (!confirmDeleteState || loadingTaskIdsRef.current.has(confirmDeleteState.id)) {
      return;
    }

    const taskId = confirmDeleteState.id;
    const shouldMoveToPreviousPage = page > 0 && (taskPage?.content.length ?? 0) === 1;

    setConfirmDeleteState(null);
    addLoadingTaskId(taskId);

    try {
      await deleteTask(taskId);
      setTaskPage((current) => removeTaskFromPage(current, taskId));

      if (shouldMoveToPreviousPage) {
        setPage((current) => Math.max(0, current - 1));
      }
    } catch (error: unknown) {
      setToastState({
        message: getErrorMessage(error),
        variant: "error",
      });
    } finally {
      removeLoadingTaskId(taskId);
    }
  }

  const showSkeleton = isLoading && taskPage === null;
  const showInlineError = errorMessage !== null && taskPage !== null;

  return (
    <>
      <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Todo List</h1>
              <p className="mt-2 text-sm text-slate-600">
                Danh sách công việc được tải từ backend Spring Boot.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                onClick={() => setModalState({ mode: "create" })}
                type="button"
              >
                Thêm công việc
              </button>

              <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                Tổng công việc: <span className="font-semibold">{taskPage?.totalElements ?? 0}</span>
              </div>

              <label className="flex flex-col gap-2 text-sm text-slate-600">
                <span>Sắp xếp</span>
                <select
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                  disabled={isLoading && taskPage === null}
                  onChange={(event) => {
                    setSort(event.target.value);
                    setPage(0);
                  }}
                  value={sort}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {showInlineError ? (
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
              <p>{errorMessage}</p>
              <button
                className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-700 transition hover:bg-red-100"
                onClick={() => setReloadKey((current) => current + 1)}
                type="button"
              >
                Thử lại
              </button>
            </div>
          ) : null}

          {errorMessage && taskPage === null && !showSkeleton ? (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
              <h2 className="text-lg font-semibold text-red-900">Không thể tải dữ liệu</h2>
              <p className="mt-2 text-sm">{errorMessage}</p>
              <button
                className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                onClick={() => setReloadKey((current) => current + 1)}
                type="button"
              >
                Thử lại
              </button>
            </div>
          ) : (
            <>
              <div className="mt-6">
                <TaskList
                  isLoading={isLoading && taskPage !== null}
                  loadingTaskIds={loadingTaskIds}
                  onDelete={handleDeleteRequest}
                  onEdit={(task) => setModalState({ mode: "edit", task })}
                  onToggleComplete={handleToggleComplete}
                  showSkeleton={showSkeleton}
                  tasks={taskPage?.content ?? []}
                />
              </div>

              <div className="mt-6">
                <Pagination
                  disabled={showSkeleton}
                  first={taskPage?.first ?? true}
                  last={taskPage?.last ?? true}
                  number={taskPage?.number ?? 0}
                  onPageChange={(nextPage) => setPage(nextPage)}
                  onSizeChange={(nextSize) => {
                    setSize(nextSize);
                    setPage(0);
                  }}
                  size={size}
                  totalPages={taskPage?.totalPages ?? 0}
                />
              </div>
            </>
          )}
        </div>
      </main>

      {modalState ? (
        <TaskFormModal
          mode={modalState.mode}
          onClose={() => setModalState(null)}
          onSuccess={(message, options) => {
            setModalState(null);
            setToastState({
              message,
              variant: "success",
            });

            if (options?.resetToFirstPage && page !== 0) {
              setPage(0);
              return;
            }

            setReloadKey((current) => current + 1);
          }}
          task={modalState.mode === "edit" ? modalState.task : undefined}
        />
      ) : null}

      {confirmDeleteState ? (
        <ConfirmDialog
          message={`Bạn có chắc muốn xóa công việc '${confirmDeleteState.title}'?`}
          onCancel={() => setConfirmDeleteState(null)}
          onConfirm={() => {
            void handleConfirmDelete();
          }}
        />
      ) : null}

      {toastState ? (
        <Toast
          message={toastState.message}
          onClose={() => setToastState(null)}
          variant={toastState.variant}
        />
      ) : null}
    </>
  );
}
