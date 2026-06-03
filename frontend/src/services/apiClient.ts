/**
 * Centralized API client service for ScrumHub.
 * Handles fetch requests with base URL and default headers.
 */

const _RAW_BASE =
  import.meta.env.VITE_API_URL_DOCKER ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "/api" : "http://localhost:3000/api");

// new URL() requires an absolute base. If the env var is a relative path
// (e.g. '/api' inside Docker), resolve it against the current origin.
const API_BASE_URL = _RAW_BASE.startsWith("http")
  ? _RAW_BASE
  : `${typeof window !== "undefined" ? window.location.origin : ""}${_RAW_BASE}`;

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export interface ApiClient {
  <T>(endpoint: string, options?: RequestOptions): Promise<T>;
  get: <T>(endpoint: string, options?: RequestOptions) => Promise<T>;
  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) => Promise<T>;
  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) => Promise<T>;
  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: RequestOptions,
  ) => Promise<T>;
  delete: <T>(endpoint: string, options?: RequestOptions) => Promise<T>;
}

let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorizedCallback = (fn: (() => void) | null) => {
  onUnauthorizedCallback = fn;
};

export const apiClient = (async <T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> => {
  const { params, ...init } = options;

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) =>
      url.searchParams.append(key, value),
    );
  }

  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      onUnauthorizedCallback?.();
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message ||
      `API error: ${response.status} ${response.statusText}`,
    );
  }

  return response.json() as Promise<T>;
}) as ApiClient;

// Attach HTTP shorthand methods to apiClient
apiClient.get = <T>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: "GET" });

apiClient.post = <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });

apiClient.put = <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });

apiClient.patch = <T>(
  endpoint: string,
  body?: unknown,
  options?: RequestOptions,
) =>
  apiClient<T>(endpoint, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(body),
  });

apiClient.delete = <T>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: "DELETE" });
