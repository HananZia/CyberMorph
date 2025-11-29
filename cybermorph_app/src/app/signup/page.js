'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api_helper";
import './signup.css'; // Import custom CSS

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      await api.post("/auth/register", { username, email, password });
      setMsg("Account created successfully. Redirecting to login...");
      setTimeout(()=>router.push("/login"), 1500);
    } catch (err) {
      console.error(err);
      const detail = err?.data?.detail || err.message || "Signup failed";
      setMsg(`Error: ${detail}`);
    } finally {
      setLoading(false);
    }
  }

  const isSuccess = msg.startsWith("Account created");
  const isError = msg.startsWith("Error:");

  return (
    <div className="signup-container">
      <div className="signup-card card">
        <h2 className="signup-title">Register New Account</h2>
        <p className="signup-subtitle">Join the platform to access file scanning services.</p>

        {msg && (
          <div className={`message-box ${isSuccess ? 'success' : isError ? 'error' : 'info'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="username-input" className="form-label">Username</label>
            <input 
              id="username-input"
              value={username} 
              onChange={e=>setUsername(e.target.value)} 
              required 
              className="input-field"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email-input" className="form-label">Email</label>
            <input 
              id="email-input"
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
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
              onChange={e=>setPassword(e.target.value)} 
              required 
              className="input-field"
            />
          </div>
          
          <button disabled={loading} type="submit" className="btn-signup">
            {loading ? "Creating Account…" : "Create Account"}
          </button>
        </form>
        
        <div className="login-link-wrapper">
             Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); router.push('/login'); }} className="login-link">Sign in here</a>
        </div>
      </div>
    </div>
  );
}