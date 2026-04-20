// frontend/js/api.js
// Thin fetch wrapper used by every page. API_BASE is relative so the same
// code works locally (rewrite via firebase serve) and in production
// (rewrite via firebase.json hosting rewrites).
const API_BASE = "/api";
const TOKEN_KEY = "qra_token";
const USER_KEY = "qra_user";

export const auth = {
  get token() {
    return localStorage.getItem(TOKEN_KEY);
  },
  get user() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  save(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

export async function apiFetch(path, { method = "GET", body, authed = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (authed && auth.token) headers.Authorization = `Bearer ${auth.token}`;

  const res = await fetch(API_BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export function requireAuth(requiredRole) {
  if (!auth.token || !auth.user) {
    window.location.href =
      "/index.html?next=" + encodeURIComponent(window.location.pathname + window.location.search);
    return null;
  }
  if (requiredRole && auth.user.role !== requiredRole) {
    alert(`This page requires role: ${requiredRole}`);
    window.location.href = "/dashboard.html";
    return null;
  }
  return auth.user;
}

export function logout() {
  auth.clear();
  window.location.href = "/index.html";
}
