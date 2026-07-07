import { fetchJson } from "@/lib/api-client";
import type { Page, Task, TaskRequest, TaskStatus, TaskStatusUpdateRequest } from "@/types/task";

interface GetTasksParams {
  status?: TaskStatus;
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

function appendQueryParam(searchParams: URLSearchParams, key: string, value?: string | number): void {
  if (value === undefined || value === null || value === "") {
    return;
  }

  searchParams.set(key, String(value));
}

function buildTaskQueryString(params: GetTasksParams): string {
  const searchParams = new URLSearchParams();

  appendQueryParam(searchParams, "status", params.status);
  appendQueryParam(searchParams, "keyword", params.keyword);
  appendQueryParam(searchParams, "page", params.page);
  appendQueryParam(searchParams, "size", params.size);
  appendQueryParam(searchParams, "sort", params.sort);

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export async function getTasks(params: GetTasksParams = {}): Promise<Page<Task>> {
  return fetchJson<Page<Task>>(`/tasks${buildTaskQueryString(params)}`);
}

export async function getTaskById(id: number): Promise<Task> {
  return fetchJson<Task>(`/tasks/${id}`);
}

export async function createTask(payload: TaskRequest): Promise<Task> {
  return fetchJson<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTask(id: number, payload: TaskRequest): Promise<Task> {
  return fetchJson<Task>(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function changeStatus(id: number, status: TaskStatus): Promise<Task> {
  const payload: TaskStatusUpdateRequest = { status };

  return fetchJson<Task>(`/tasks/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function deleteTask(id: number): Promise<void> {
  await fetchJson<void>(`/tasks/${id}`, {
    method: "DELETE",
  });
}
