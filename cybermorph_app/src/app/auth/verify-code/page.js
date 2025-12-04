'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import './code.css';

export default function VerifyCodePage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");

    if (code.length !== 6) {
      setErrorMsg("Please enter the 6-digit code.");
      return;
    }

    const token = localStorage.getItem("pwResetToken");
    if (!token) {
      setErrorMsg("No reset token found. Please request a new code.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, code })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || "Invalid or expired code.");
      }

      // Save code for reset step
      localStorage.setItem("pwResetCode", code);

      alert("Code verified successfully!");
      router.push("/auth/reset-password");

    } catch (err) {
      setErrorMsg(err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleResend() {
    alert("To receive a new code, go back and request a new one.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-3 text-center">Verify Code</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">Enter the 6-digit code sent to your email.</p>

        {errorMsg && <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">6-digit Code</label>
            <input
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0,6))}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 transition text-white rounded py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Verify Code"}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 text-center">
          <button onClick={handleResend} className="underline hover:text-blue-600">
            Didn’t get the code?
          </button>
        </div>
      </div>
    </div>
  );
}
