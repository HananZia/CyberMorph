'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "../../../lib/api_helper";
import './forgot.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.post("/auth/forgot-password", { email });

      // Save token if returned
      if (data.token) localStorage.setItem("pwResetToken", data.token);

      setSuccessMsg("Success! Check your inbox. A 6-digit verification code has been sent.");
      
      // Small delay to show success message before redirect
      setTimeout(() => {
        router.push("auth/verify-code");
      }, 1500);

    } catch (err) {
      setErrorMsg(err.message || "Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reset-page-wrapper">
      <div className="auth-card">
        <h2 className="card-title">Password Reset</h2>
        <p className="card-description">
          Enter your email below. We'll send a 6-digit verification code to reset your password.
        </p>

        {errorMsg && <div className="error-message">{errorMsg}</div>}
        {successMsg && <div className="success-message">{successMsg}</div>}

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="email-input" className="form-label">Email Address</label>
            <input
              id="email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="e.g., you@cyberproject.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? "Sending Code..." : "Send Reset Code"}
          </button>
        </form>

        <div className="back-link">
          <Link href="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
