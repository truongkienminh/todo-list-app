"use client";

import { useEffect, useState } from "react";

import { TaskForm } from "@/components/tasks/TaskForm";
import type { Task } from "@/types/task";

interface TaskFormModalProps {
  mode: "create" | "edit";
  task?: Task;
  onClose: () => void;
  onSuccess: (message: string, options?: { resetToFirstPage?: boolean }) => void;
}

export function TaskFormModal({ mode, onClose, onSuccess, task }: TaskFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleClose() {
    if (isSubmitting) {
      return;
    }

    onClose();
  }

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSubmitting, onClose]);

  const isEditMode = mode === "edit";

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 py-8 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
      role="dialog"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              {isEditMode ? "Cập nhật công việc" : "Thêm công việc"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {isEditMode
                ? "Chỉnh sửa thông tin công việc hiện có."
                : "Điền thông tin để tạo một công việc mới."}
            </p>
          </div>
          <button
            aria-label="Đóng"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            disabled={isSubmitting}
            onClick={handleClose}
            type="button"
          >
            ×
          </button>
        </div>

        <TaskForm
          initialValue={task}
          onCancel={handleClose}
          onSubmittingChange={setIsSubmitting}
          onSuccess={() =>
            onSuccess(isEditMode ? "Cập nhật thành công" : "Tạo công việc thành công", {
              resetToFirstPage: !isEditMode,
            })
          }
        />
      </div>
    </div>
  );
}
