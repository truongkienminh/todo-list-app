"use client";

import { useEffect, useRef, useState } from "react";

import { Pagination } from "@/components/Pagination";
import { TaskList } from "@/components/TaskList";
import { ApiError } from "@/lib/api-client";
import { getTasks } from "@/lib/task-service";
import type { Page, Task } from "@/types/task";

const sortOptions = [
  { value: "createdAt,desc", label: "Ngày tạo mới nhất" },
  { value: "createdAt,asc", label: "Ngày tạo cũ nhất" },
  { value: "dueDate,asc", label: "Hạn xử lý sớm nhất" },
  { value: "dueDate,desc", label: "Hạn xử lý muộn nhất" },
  { value: "priority,desc", label: "Ưu tiên cao đến thấp" },
  { value: "priority,asc", label: "Ưu tiên thấp đến cao" },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Không thể tải danh sách công việc.";
}

export default function HomePage() {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState("createdAt,desc");
  const [taskPage, setTaskPage] = useState<Page<Task> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const requestSequence = useRef(0);

  useEffect(() => {
    const currentRequest = requestSequence.current + 1;
    requestSequence.current = currentRequest;

    setIsLoading(true);

    void getTasks({ page, size, sort })
      .then((response) => {
        if (requestSequence.current !== currentRequest) {
          return;
        }

        console.log("Fetched tasks from backend:", response);
        setTaskPage(response);
        setErrorMessage(null);
      })
      .catch((error: unknown) => {
        if (requestSequence.current !== currentRequest) {
          return;
        }

        console.error("Failed to fetch tasks:", error);
        setErrorMessage(getErrorMessage(error));
      })
      .finally(() => {
        if (requestSequence.current !== currentRequest) {
          return;
        }

        setIsLoading(false);
      });
  }, [page, reloadKey, size, sort]);

  const showSkeleton = isLoading && taskPage === null;
  const showInlineError = errorMessage !== null && taskPage !== null;

  return (
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
  );
}
