// src/context/AuthContext.jsx
'use client'
import React, { createContext, useState, useEffect, useContext } from "react";

// Helpers
function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(payload)));
  } catch (e) {
    return null;
  }
}

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { username, user_id, role, token, expiry: Date }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // load from sessionStorage (preferred) then localStorage fallback
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    const username = sessionStorage.getItem("username") || localStorage.getItem("username");
    if (token) {
      const decoded = decodeJwt(token);
      if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now())) {
        // expired
        clearAuthStorage();
        setUser(null);
      } else {
        setUser({
          username: username || decoded.sub,
          user_id: decoded.user_id || sessionStorage.getItem("user_id"),
          role: decoded.role || sessionStorage.getItem("role") || "user",
          token,
          expiry: decoded.exp ? new Date(decoded.exp * 1000) : null,
        });
      }
    }
    setLoading(false);
  }, []);

  function clearAuthStorage() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
  }

  function login({ token, username, user_id, role, persist=false }) {
    // persist -> localStorage, otherwise sessionStorage
    const target = persist ? localStorage : sessionStorage;
    target.setItem("token", token);
    if (username) target.setItem("username", username);
    if (user_id) target.setItem("user_id", user_id);
    if (role) target.setItem("role", role);

    // set user state
    const decoded = decodeJwt(token);
    setUser({
      username: username || decoded?.sub,
      user_id: user_id || decoded?.user_id,
      role: role || decoded?.role || "user",
      token,
      expiry: decoded?.exp ? new Date(decoded.exp * 1000) : null,
    });
  }

  function logout() {
    clearAuthStorage();
    setUser(null);
    // client pages will redirect where appropriate
  }

  const value = { user, loading, login, logout, isAdmin: () => user?.role === "admin" };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
