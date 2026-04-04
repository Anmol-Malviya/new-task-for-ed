const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ed_admin_token');
}

async function adminFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
}

export async function adminLogin(email: string, password: string) {
  const data = await fetch(`${API_BASE}/admin/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const json = await data.json();
  if (!data.ok) throw new Error(json.message || 'Login failed');
  return json;
}

export async function fetchAdminStats() {
  return adminFetch('/admin/stats/');
}

export async function fetchAdminUsers() {
  return adminFetch('/admin/users/');
}

export async function fetchAdminVendors() {
  return adminFetch('/admin/vendors/');
}

export async function fetchAdminOrders() {
  return adminFetch('/admin/orders/');
}

export async function fetchAdminQueries() {
  return adminFetch('/admin/queries/');
}

export async function toggleUserBlacklist(userId: number) {
  return adminFetch(`/admin/users/${userId}/toggle-blacklist/`, { method: 'POST' });
}

export async function fetchAdminServices() {
  return adminFetch('/admin/services/');
}

export async function createAdminService(serviceData: any) {
  return adminFetch('/admin/services/', {
    method: 'POST',
    body: JSON.stringify(serviceData)
  });
}

export async function updateAdminService(serviceId: number, serviceData: any) {
  return adminFetch(`/admin/services/${serviceId}/`, {
    method: 'PUT',
    body: JSON.stringify(serviceData)
  });
}

export async function deleteAdminService(serviceId: number) {
  return adminFetch(`/admin/services/${serviceId}/`, {
    method: 'DELETE'
  });
}
