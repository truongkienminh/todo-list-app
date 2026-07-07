"use client";

import { useEffect, useMemo, useState } from "react";

import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "@/constants/task.constants";
import { ApiError } from "@/lib/api-client";
import { formatDateTimeLocalValue } from "@/services/task/task-presenter";
import { createTask, updateTask } from "@/services/task/task-service";
import type {
  ApiFieldError,
  Task,
  TaskPriority,
  TaskRequest,
  TaskStatus,
} from "@/types/task";

type FormFieldName = "title" | "description" | "status" | "priority" | "dueDate";

interface FormValues {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

type FieldErrors = Partial<Record<FormFieldName, string>>;
type TouchedFields = Partial<Record<FormFieldName, boolean>>;

interface TaskFormProps {
  initialValue?: Task;
  onSuccess: () => void;
  onCancel: () => void;
  onSubmittingChange?: (isSubmitting: boolean) => void;
}

function getInitialFormValues(initialValue?: Task): FormValues {
  return {
    title: initialValue?.title ?? "",
    description: initialValue?.description ?? "",
    status: initialValue?.status ?? "PENDING",
    priority: initialValue?.priority ?? "MEDIUM",
    dueDate: formatDateTimeLocalValue(initialValue?.dueDate ?? null),
  };
}

function validateForm(values: FormValues, isEditMode: boolean): FieldErrors {
  const nextErrors: FieldErrors = {};

  if (!values.title.trim()) {
    nextErrors.title = "Vui lòng nhập tiêu đề công việc.";
  }

  if (!isEditMode && values.dueDate) {
    const dueDate = new Date(values.dueDate);

    if (!Number.isNaN(dueDate.getTime()) && dueDate.getTime() < Date.now()) {
      nextErrors.dueDate = "Hạn xử lý không được ở quá khứ.";
    }
  }

  return nextErrors;
}

function getFieldName(field: string): FormFieldName | null {
  if (
    field === "title" ||
    field === "description" ||
    field === "status" ||
    field === "priority" ||
    field === "dueDate"
  ) {
    return field;
  }

  return null;
}

function mapApiErrors(errors: ApiFieldError[] | undefined): {
  fieldErrors: FieldErrors;
  generalErrors: string[];
} {
  const fieldErrors: FieldErrors = {};
  const generalErrors: string[] = [];

  if (!errors) {
    return { fieldErrors, generalErrors };
  }

  errors.forEach((error) => {
    const fieldName = getFieldName(error.field);

    if (fieldName) {
      fieldErrors[fieldName] = error.message;
      return;
    }

    generalErrors.push(error.message);
  });

  return { fieldErrors, generalErrors };
}

function buildPayload(values: FormValues): TaskRequest {
  const payload: TaskRequest = {
    title: values.title.trim(),
    status: values.status,
    priority: values.priority,
  };

  const description = values.description.trim();

  if (description) {
    payload.description = description;
  }

  if (values.dueDate) {
    payload.dueDate = values.dueDate;
  }

  return payload;
}

function LoadingSpinner() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

export function TaskForm({
  initialValue,
  onCancel,
  onSubmittingChange,
  onSuccess,
}: TaskFormProps) {
  const isEditMode = Boolean(initialValue);
  const [values, setValues] = useState<FormValues>(() => getInitialFormValues(initialValue));
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({});
  const [serverFieldErrors, setServerFieldErrors] = useState<FieldErrors>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clientFieldErrors = useMemo(
    () => validateForm(values, isEditMode),
    [isEditMode, values],
  );

  const hasClientErrors = Object.keys(clientFieldErrors).length > 0;

  useEffect(() => {
    onSubmittingChange?.(isSubmitting);
  }, [isSubmitting, onSubmittingChange]);

  function updateField<K extends FormFieldName>(field: K, value: FormValues[K]) {
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setServerFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleBlur(field: FormFieldName) {
    setTouchedFields((currentFields) => ({
      ...currentFields,
      [field]: true,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setHasSubmitted(true);
    setTouchedFields({
      title: true,
      description: true,
      status: true,
      priority: true,
      dueDate: true,
    });
    setGeneralErrors([]);

    const nextClientErrors = validateForm(values, isEditMode);

    if (Object.keys(nextClientErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload(values);

      if (initialValue) {
        await updateTask(initialValue.id, payload);
      } else {
        await createTask(payload);
      }

      onSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        const { fieldErrors, generalErrors: mappedGeneralErrors } = mapApiErrors(error.errors);

        setServerFieldErrors(fieldErrors);
        setGeneralErrors(
          mappedGeneralErrors.length > 0
            ? mappedGeneralErrors
            : Object.keys(fieldErrors).length === 0
              ? [error.message]
              : [],
        );
      } else if (error instanceof Error) {
        setGeneralErrors([error.message]);
      } else {
        setGeneralErrors(["Không thể lưu công việc."]);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function getFieldError(field: FormFieldName): string | undefined {
    if (serverFieldErrors[field]) {
      return serverFieldErrors[field];
    }

    if (touchedFields[field] || hasSubmitted) {
      return clientFieldErrors[field];
    }

    return undefined;
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {generalErrors.length > 0 ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {generalErrors.map((message, index) => (
            <p key={`${message}-${index}`}>{message}</p>
          ))}
        </div>
      ) : null}

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-title">
          Tiêu đề
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          id="task-title"
          maxLength={255}
          onBlur={() => handleBlur("title")}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="Nhập tiêu đề công việc"
          required
          type="text"
          value={values.title}
        />
        {getFieldError("title") ? (
          <p className="mt-1 text-sm text-red-600">{getFieldError("title")}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-description">
          Mô tả
        </label>
        <textarea
          className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          id="task-description"
          onBlur={() => handleBlur("description")}
          onChange={(event) => updateField("description", event.target.value)}
          placeholder="Mô tả ngắn về công việc"
          value={values.description}
        />
        {getFieldError("description") ? (
          <p className="mt-1 text-sm text-red-600">{getFieldError("description")}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-status">
            Trạng thái
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            id="task-status"
            onBlur={() => handleBlur("status")}
            onChange={(event) => updateField("status", event.target.value as TaskStatus)}
            value={values.status}
          >
            {STATUS_OPTIONS.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
          {getFieldError("status") ? (
            <p className="mt-1 text-sm text-red-600">{getFieldError("status")}</p>
          ) : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-priority">
            Ưu tiên
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            id="task-priority"
            onBlur={() => handleBlur("priority")}
            onChange={(event) => updateField("priority", event.target.value as TaskPriority)}
            value={values.priority}
          >
            {PRIORITY_OPTIONS.map((priorityOption) => (
              <option key={priorityOption.value} value={priorityOption.value}>
                {priorityOption.label}
              </option>
            ))}
          </select>
          {getFieldError("priority") ? (
            <p className="mt-1 text-sm text-red-600">{getFieldError("priority")}</p>
          ) : null}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="task-due-date">
          Hạn xử lý
        </label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          id="task-due-date"
          onBlur={() => handleBlur("dueDate")}
          onChange={(event) => updateField("dueDate", event.target.value)}
          type="datetime-local"
          value={values.dueDate}
        />
        {getFieldError("dueDate") ? (
          <p className="mt-1 text-sm text-red-600">{getFieldError("dueDate")}</p>
        ) : null}
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          onClick={onCancel}
          type="button"
        >
          Hủy
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting || hasClientErrors}
          type="submit"
        >
          {isSubmitting ? <LoadingSpinner /> : null}
          {initialValue ? "Cập nhật" : "Tạo công việc"}
        </button>
      </div>
    </form>
  );
}
