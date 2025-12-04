// src/lib/api.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api";

/**
 * Safe fetch wrapper
 * @param {string} path - API endpoint path (e.g., "/auth/login")
 * @param {object} options - fetch options
 */
async function safeFetch(path, options = {}) {
  const url = API_BASE + path;
  const headers = options.headers || {};

  // Attach token if present
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // Default Content-Type for JSON if not sending FormData
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (fetchError) {
    const err = new Error("Network error or failed to fetch");
    err.status = 0;
    err.data = null;
    throw err;
  }

  let data = null;
  const contentType = res.headers.get("content-type") || "";

  // Parse JSON or text responses
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  } else if (contentType.includes("text/")) {
    try {
      data = await res.text();
    } catch (e) {
      data = null;
    }
  }

  // Throw error for non-2xx responses
  if (!res.ok) {
    const errMessage = (data && (data.detail || data.message)) || res.statusText || "Request failed";
    const err = new Error(errMessage);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

/**
 * Helper to serialize query params
 */
function serializeParams(params) {
  return params
    ? "?" +
        Object.entries(params)
          .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
          .join("&")
    : "";
}

/**
 * API methods
 */
export const api = {
  get: (path, params) => safeFetch(path + serializeParams(params), { method: "GET" }),
  post: (path, body) => safeFetch(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => safeFetch(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path) => safeFetch(path, { method: "DELETE" }),
  postForm: (path, formData) => safeFetch(path, { method: "POST", body: formData }),
};
