'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api_helper";
import { useAuth } from "../../context/AuthContext";
import './login.css'; 
import { LogIn, Lock, Mail } from 'lucide-react'; // Icons for professional touch

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
      // Use a friendlier message for general login failure
      setError(err?.data?.detail || "Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    router.push("/auth/forgot-password");
  }

  return (
    <div className="auth-page-wrapper"> {/* Consistent wrapper */}
      <div className="login-card auth-card"> {/* Consistent card styling */}
        
        <h2 className="card-title">Sign In</h2>
        <p className="card-description">
            Access your Cyber Project Dashboard and security tools.
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="username-input" className="form-label">Username or Email</label>
            <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                    id="username-input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Enter username or email"
                />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password-input" className="form-label">Password</label>
            <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="form-input"
                    placeholder="Enter your password"
                />
            </div>
          </div>

          <div className="forgot-password-wrapper">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="forgot-password-link btn-link"
            >
              Forgot Password?
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-login">
            {loading ? (
                <>
                    <LogIn size={20} />
                    Authenticating…
                </>
            ) : (
                <>
                    <LogIn size={20} />
                    Sign In
                </>
            )}
          </button>
        </form>
        
        <div className="auth-footer-link">
            {/* Placeholder for Signup/Registration link */}
            Don't have an account? <a href="/signup">Register here</a>
        </div>
      </div>
    </div>
  );
}