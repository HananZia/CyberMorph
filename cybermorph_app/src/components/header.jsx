'use client'
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="app-header">
      <div className="container app-header-content">
        <div className="flex-group">
          <Link href="/" className="logo-link">CyberShield Pro</Link>
          <nav className="main-nav">
            <Link href="/" className="nav-link">Home</Link>
            {user && <Link href="/dashboard" className="nav-link">Dashboard</Link>}
            {user && <Link href="/scan" className="nav-link">Scan File</Link>}
            {user && user.role === "admin" && <Link href="/admin" className="nav-link admin-link">Admin</Link>}
          </nav>
        </div>

        <div>
          {user ? (
            <div className="user-controls">
              <span className="user-greeting">Hi, <strong className="user-username-display">{user.username}</strong></span>
              <button onClick={handleLogout} className="btn-logout-header">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link href="/login" className="btn-login-header">Login</Link>
              <Link href="/signup" className="btn-signup-header">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}