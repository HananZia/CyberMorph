'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import './forgot.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Unable to send verification code.");
      }

      // Save token from backend
      if (data.token) {
        localStorage.setItem("pwResetToken", data.token);
      }

      alert("A 6-digit verification code has been sent to your email.");
      router.push("/auth/verify-code");

    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-3 text-center">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Enter your email and we'll send you a 6-digit verification code.
        </p>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white rounded py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Sending…" : "Send Reset Code"}
          </button>
        </form>
      </div>
    </div>
  );
}
