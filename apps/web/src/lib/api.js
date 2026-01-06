export const API_BASE = import.meta.env.VITE_API_URL || '';

export async function apiFetch(path, options = {}) {
  const { signal, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    method: rest.method || 'GET',
    credentials: 'include', 
    signal,                
    cache: 'no-store',     
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...headers,
    },
    ...rest,
  });

  if (res.status === 204) return null;

  const ct = res.headers.get('content-type') || '';
  const isJSON = ct.includes('application/json');
  const data = isJSON ? await res.json().catch(() => null) : await res.text();

  if (!res.ok) {
    const message =
      (isJSON && data && data.error && data.error.message) ||
      (typeof data === 'string' && data) ||
      `Request failed with ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return data; 
}
