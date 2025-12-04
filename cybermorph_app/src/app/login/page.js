'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api_helper";
import { useAuth } from "../../context/AuthContext";
import './login.css'; // Import custom CSS

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { username, password });
      // res: { access_token, token_type, expires_in, user_id, role }
      login({
        token: res.access_token,
        username,
        user_id: res.user_id,
        role: res.role,
      });

      // Role-based redirect
      if (res.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }

    } catch (err) {
      console.error(err);
      setError(err?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    router.push("/auth/forgot-password");
  }

  return (
    <div className="login-container">
      <div className="login-card card">
        <h2 className="login-title">Sign in to the System</h2>
        <p className="login-subtitle">Enter your credentials to access the security dashboard.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username-input" className="form-label">Username or Email</label>
            <input
              id="username-input"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="input-field"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password-input" className="form-label">Password</label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="input-field"
            />
          </div>

          <div className="forgot-password-wrapper">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password-link"
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? "Authenticating…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
