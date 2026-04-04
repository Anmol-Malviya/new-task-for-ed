import { API_BASE_URL, AUTH_STORAGE_KEY } from './constants';

// ─── Core request function ────────────────────────────────────────────
async function request<T>(
  endpoint: string,      
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem(AUTH_STORAGE_KEY)
      : null;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  // Handle non-2xx responses
  if (!response.ok) {
    
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { message?: string }).message ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  // Handle 204 No Content (DELETE responses often return nothing)
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(url: string): Promise<T> =>
    request<T>(url),

  post: <T>(url: string, body: unknown): Promise<T> =>
    request<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(url: string, body: unknown): Promise<T> =>
    request<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(url: string): Promise<T> =>
    request<T>(url, { method: 'DELETE' }),
};