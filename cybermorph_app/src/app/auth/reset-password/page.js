'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api_helper";
import './reset.css';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirm) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    // Retrieve temporary credentials from local storage
    const token = localStorage.getItem("pwResetToken");
    const code = localStorage.getItem("pwResetCode");
    if (!token || !code) {
      setErrorMsg("Reset session expired or incomplete. Please restart the password reset flow.");
      // Redirect to the start of the flow if tokens are missing
      router.push("/auth/forgot-password"); 
      return;
    }

    setLoading(true);

    try {
      const data = await api.post("/auth/reset-password", { token, code, new_password: password });

      // Cleanup local storage upon success
      localStorage.removeItem("pwResetToken");
      localStorage.removeItem("pwResetCode");

      alert("Success! Your password has been updated. Please sign in with your new password.");
      router.push("/login");

    } catch (err) {
      setErrorMsg(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-page-wrapper">
      <div className="auth-card">
        <h2 className="card-title">Set New Password</h2>
        <p className="card-description">
            Your verification code was accepted. Enter and confirm your new, strong password.
        </p>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="new-password" className="form-label">New Password</label>
            <input
              id="new-password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="form-input"
              placeholder="Minimum 8 characters"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
            <input
              id="confirm-password"
              type="password"
              required
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="form-input"
              placeholder="Re-enter new password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Updating Password..." : "Set New Password"}
          </button>
        </form>
        
        <div className="back-link">
            <Link href="/login">Return to Sign In</Link>
        </div>
      </div>
    </div>
  );
}