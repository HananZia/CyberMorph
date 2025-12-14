// src/lib/api.js
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

/**
 * Safe fetch wrapper
 */
async function safeFetch(path, options = {}) {
  const url = API_BASE + path;
  const headers = options.headers ? { ...options.headers } : {};

  // 🔐 Attach JWT token (OAuth2 compatible)
  if (typeof window !== "undefined") {
    const token =
      sessionStorage.getItem("access_token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("token");

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  // Default Content-Type for JSON (except FormData)
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
    const err = new Error("Network error");
    err.status = 0;
    err.data = null;
    throw err;
  }

  let data = null;
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {
      data = null;
    }
  } else if (contentType.includes("text/")) {
    try {
      data = await res.text();
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const errMessage =
      (data && (data.detail || data.message)) ||
      res.statusText ||
      "Request failed";

    const err = new Error(errMessage);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Serialize query params
 */
function serializeParams(params) {
  return params
    ? "?" +
        Object.entries(params)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
    : "";
}

/**
 * API interface
 */
export const api = {
  get: (path, params) =>
    safeFetch(path + serializeParams(params), { method: "GET" }),

  post: (path, body) =>
    safeFetch(path, { method: "POST", body: JSON.stringify(body) }),

  put: (path, body) =>
    safeFetch(path, { method: "PUT", body: JSON.stringify(body) }),

  del: (path) => safeFetch(path, { method: "DELETE" }),

  postForm: (path, formData) =>
    safeFetch(path, { method: "POST", body: formData }),
};
