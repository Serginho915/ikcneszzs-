import type { AdminSettings, MediaAsset, Post } from "./domain";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const ASSET_URL = (import.meta.env.VITE_ASSET_URL ?? API_URL.replace(/\/api\/?$/, "")).replace(/\/$/, "");

export function assetUrl(url: string) {
  if (!url || url.startsWith("http") || url.startsWith("data:")) return url;
  let path = url.startsWith("/") ? url : "/" + url;
  path = path.replace(/^\/api\/uploads\//, "/uploads/");
  if (path.startsWith("/uploads/")) return ASSET_URL + path;
  return path;
}

let accessToken = localStorage.getItem("ikc_access_token") ?? "";
let csrfToken = localStorage.getItem("ikc_csrf_token") ?? "";

function saveSession(nextAccessToken: string, nextCsrfToken: string) {
  accessToken = nextAccessToken;
  csrfToken = nextCsrfToken;
  localStorage.setItem("ikc_access_token", nextAccessToken);
  localStorage.setItem("ikc_csrf_token", nextCsrfToken);
}

function clearSession() {
  accessToken = "";
  csrfToken = "";
  localStorage.removeItem("ikc_access_token");
  localStorage.removeItem("ikc_csrf_token");
}

async function request<T>(path: string, options: RequestInit = {}, admin = false): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (admin && accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (admin && csrfToken && options.method && options.method !== "GET") headers.set("x-csrf-token", csrfToken);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include"
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  isAuthenticated: () => Boolean(accessToken),
  listPosts: () => request<Post[]>("/posts"),
  getPost: (slug: string) => request<Post>(`/posts/${slug}`),
  subscribe: (email: string) => request<{ ok: boolean }>("/subscribers", { method: "POST", body: JSON.stringify({ email }) }),
  login: async (email: string, password: string) => {
    const session = await request<{ accessToken: string; csrfToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    saveSession(session.accessToken, session.csrfToken);
    return session;
  },
  refresh: async () => {
    if (!csrfToken) return false;
    try {
      const session = await request<{ accessToken: string; csrfToken: string }>("/auth/refresh", {
        method: "POST",
        headers: { "x-csrf-token": csrfToken }
      });
      saveSession(session.accessToken, session.csrfToken);
      return true;
    } catch {
      clearSession();
      return false;
    }
  },
  logout: async () => {
    await request("/auth/logout", { method: "POST", headers: csrfToken ? { "x-csrf-token": csrfToken } : undefined }).catch(() => null);
    clearSession();
  },
  adminPosts: () => request<Post[]>("/admin/posts", {}, true),
  createPost: (post: Omit<Post, "id" | "publishedAt" | "updatedAt">) =>
    request<Post>("/admin/posts", { method: "POST", body: JSON.stringify(post) }, true),
  updatePost: (id: string, post: Omit<Post, "id" | "publishedAt" | "updatedAt">) =>
    request<Post>(`/admin/posts/${id}`, { method: "PUT", body: JSON.stringify(post) }, true),
  deletePost: (id: string) => request<{ ok: boolean }>(`/admin/posts/${id}`, { method: "DELETE" }, true),
  getSettings: () => request<AdminSettings>("/admin/settings", {}, true),
  updateSettings: (settings: AdminSettings) =>
    request<AdminSettings>("/admin/settings", { method: "PUT", body: JSON.stringify(settings) }, true),
  generateNow: () => request<Post>("/ai/generate-now", { method: "POST" }, true),
  listCoverImages: () => request<MediaAsset[]>("/admin/media/covers", {}, true),
  uploadCoverImage: (fileName: string, dataUrl: string) =>
    request<MediaAsset>("/admin/media/covers", { method: "POST", body: JSON.stringify({ fileName, dataUrl }) }, true),
  deleteCoverImage: (name: string) => request<{ ok: boolean }>("/admin/media/covers/" + encodeURIComponent(name), { method: "DELETE" }, true)
};
