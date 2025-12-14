'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/api_helper";
import './code.css';
import { MailCheck } from 'lucide-react'; // Icon for visual appeal

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (code.length !== 6) {
      setErrorMsg("Please enter the 6-digit code exactly as received.");
      return;
    }

    const token = localStorage.getItem("pwResetToken");
    if (!token) {
      setErrorMsg("Session expired. Please start the password reset flow again.");
      router.push("/auth/forgot-password");
      return;
    }

    setLoading(true);

    try {
      const data = await api.post("/auth/verify-code", { token, code });

      // Save code for the next reset step
      localStorage.setItem("pwResetCode", code);

      // Using a better message than standard alert
      alert("Verification successful! Redirecting to password reset.");
      router.push("/auth/reset-password");

    } catch (err) {
      setErrorMsg(err.message || "Verification failed. Check the code and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    // Redirect user back to the 'Forgot Password' page to re-initiate the token/code generation
    alert("To receive a new code, you must go back to the previous step and re-submit your email.");
    router.push("/auth/forgot-password");
  }

  return (
    <div className="verify-page-wrapper"> {/* Consistent wrapper class */}
      <div className="auth-card">
        <MailCheck size={48} className="card-icon" /> {/* Visual element */}
        <h2 className="card-title">Verification Required</h2>
        <p className="card-description">
          Please check your inbox (including spam) for the **6-digit security code** we just sent.
        </p>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="code-input" className="form-label">6-digit Code</label>
            <input
              id="code-input"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0,6))}
              className="form-input code-input" // Added specific class for centering
              placeholder="000000"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary" // Using primary blue for consistency
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="resend-link">
          <span className="text-subtle">Didn’t receive the code?</span>
          <button type="button" onClick={handleResend} className="btn-link">
            Re-request Code
          </button>
        </div>
      </div>
    </div>
  );
}