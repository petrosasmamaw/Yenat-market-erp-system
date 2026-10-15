const apiBase = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? '';

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${normalized}`;
}

export function getAuthHeaders(extra = {}) {
  const headers = { ...extra };
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('yenat_erp_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function apiFetch(path, options = {}) {
  const headers = getAuthHeaders({
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  });
  const res = await fetch(apiUrl(path), { ...options, headers });
  return res;
}
