const TOKEN_KEY = 'upland-orchestrator-session';

export function token() { return window.localStorage.getItem(TOKEN_KEY) || ''; }
export function logout() { window.localStorage.removeItem(TOKEN_KEY); }

export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token()) headers.Authorization = `Bearer ${token()}`;
  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.error || `Request failed (${response.status})`);
  return payload;
}

export async function login(username, password) {
  const payload = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
  window.localStorage.setItem(TOKEN_KEY, payload.access_token);
  return payload;
}
