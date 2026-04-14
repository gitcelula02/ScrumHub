/**
 * @module apiClient
 * @description Thin wrapper around fetch for all ScrumHub API calls.
 * All service files import from here — never use fetch() directly.
 *
 * RESPONSIBILITIES:
 * - Base URL configuration via environment variable
 * - Auth token injection from localStorage
 * - Consistent error shape: throws Error with { message, status, data }
 * - JSON parsing
 *
 * TO SWAP TO AXIOS: replace the internal _request implementation only.
 * All service files are unaffected.
 *
 * @example
 * import { apiClient } from '@/services/apiClient';
 * const user = await apiClient.get('/auth/me');
 * const epic = await apiClient.post('/epics', { name: 'MVP', color: '#4668f0' });
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

async function _request(method, path, body) {
  const token = localStorage.getItem('scrumhub_token');

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message ?? `Request failed: ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.data   = data;
    throw err;
  }

  return data;
}

export const apiClient = {
  get:    (path)         => _request('GET',    path),
  post:   (path, body)   => _request('POST',   path, body),
  patch:  (path, body)   => _request('PATCH',  path, body),
  put:    (path, body)   => _request('PUT',    path, body),
  delete: (path)         => _request('DELETE', path),
};
