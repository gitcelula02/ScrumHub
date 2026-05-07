/**
 * Centralized API client service for ScrumHub.
 * Handles fetch requests with base URL and default headers.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

export interface ApiClient {
  <T>(endpoint: string, options?: RequestOptions): Promise<T>;
  get: <T>(endpoint: string, options?: RequestOptions) => Promise<T>;
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<T>;
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<T>;
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<T>;
  delete: <T>(endpoint: string, options?: RequestOptions) => Promise<T>;
}

export const apiClient = (async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { params, ...init } = options;

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }

  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Get token from localStorage (simplified for now, will be moved to AuthContext later)
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url.toString(), {
    ...init,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}) as ApiClient;

// Attach HTTP shorthand methods to apiClient
apiClient.get = <T>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'GET' });

apiClient.post = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });

apiClient.put = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) });

apiClient.patch = <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) });

apiClient.delete = <T>(endpoint: string, options?: RequestOptions) =>
  apiClient<T>(endpoint, { ...options, method: 'DELETE' });
