/**
 * Base API client with auth + automatic token refresh on 401.
 */

import { useAuthStore } from '@/store/authStore';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken;
}

/** Headers for multipart uploads (do not set Content-Type). */
export function getAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function tryRefreshToken(): Promise<boolean> {
  return useAuthStore.getState().refreshSession();
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const errBody = await response.json();
    return errBody.error || errBody.message || response.statusText;
  } catch {
    return response.statusText;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;
  const token = getAccessToken();

  const doFetch = (authToken: string | null) =>
    fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });

  let response = await doFetch(token);

  if (response.status === 401 && token) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      response = await doFetch(getAccessToken());
    }
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    if (response.status === 401) {
      useAuthStore.getState().logout();
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

/** Authenticated fetch for FormData / file uploads. */
export async function authFetch(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = getAccessToken();

  const doFetch = (authToken: string | null) =>
    fetch(url, {
      ...options,
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...options.headers,
      },
    });

  let response = await doFetch(token);

  if (response.status === 401 && token) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      response = await doFetch(getAccessToken());
    }
  }

  if (response.status === 401) {
    useAuthStore.getState().logout();
  }

  return response;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export { ApiError };
