import type { ApiErrorResponse } from "@/types/task";

export class ApiError extends Error {
  status: number;
  errors?: ApiErrorResponse["errors"];
  payload?: ApiErrorResponse;

  constructor(payload: ApiErrorResponse) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.errors = payload.errors;
    this.payload = payload;
  }
}

function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured.");
  }

  return apiBaseUrl.replace(/\/+$/, "");
}

function buildUrl(path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${getApiBaseUrl()}/${normalizedPath}`;
}

function isJsonResponse(contentType: string | null): boolean {
  return contentType?.includes("application/json") ?? false;
}

async function parseErrorResponse(response: Response): Promise<ApiErrorResponse> {
  const contentType = response.headers.get("content-type");

  if (isJsonResponse(contentType)) {
    const data = (await response.json()) as Partial<ApiErrorResponse>;

    return {
      timestamp: data.timestamp ?? new Date().toISOString(),
      status: data.status ?? response.status,
      error: data.error ?? response.statusText,
      message: data.message ?? "Request failed.",
      errors: data.errors,
    };
  }

  const fallbackMessage = (await response.text()) || response.statusText || "Request failed.";

  return {
    timestamp: new Date().toISOString(),
    status: response.status,
    error: response.statusText,
    message: fallbackMessage,
  };
}

export async function fetchJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorResponse(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type");

  if (!isJsonResponse(contentType)) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
