'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/api_helper";
import './signup.css'; 
import { User, Mail, Lock, UserPlus } from 'lucide-react'; // Modern Icons

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
      setTimeout(()=>router.push("/login"), 2000); // Increased delay for readability
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
    <div className="auth-page-wrapper"> {/* Consistent wrapper */}
      <div className="signup-card auth-card"> {/* Consistent card styling */}
        
        <h2 className="card-title">Register Account</h2>
        <p className="card-description">
            Create your free account to access the secure file scanning services.
        </p>

        {msg && (
          <div className={`message-box ${isSuccess ? 'success' : isError ? 'error' : 'info'}`}>
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-content">
          
          <div className="form-group">
            <label htmlFor="username-input" className="form-label">Username</label>
            <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input 
                    id="username-input"
                    value={username} 
                    onChange={e=>setUsername(e.target.value)} 
                    required 
                    className="form-input"
                    placeholder="Choose a username"
                />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email-input" className="form-label">Email</label>
            <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                    id="email-input"
                    type="email" 
                    value={email} 
                    onChange={e=>setEmail(e.target.value)} 
                    required 
                    className="form-input"
                    placeholder="Enter a valid email address"
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
                    onChange={e=>setPassword(e.target.value)} 
                    required 
                    className="form-input"
                    placeholder="Choose a secure password"
                />
            </div>
          </div>
          
          <button 
            disabled={loading} 
            type="submit" 
            className="btn-primary btn-signup"
          >
            {loading ? (
                <>
                    <UserPlus size={20} />
                    Creating Account…
                </>
            ) : (
                <>
                    <UserPlus size={20} />
                    Create Account
                </>
            )}
          </button>
        </form>
        
        <div className="auth-footer-link">
            Already have an account? <a href="/login" onClick={(e) => { e.preventDefault(); router.push('/login'); }} className="login-link">Sign in here</a>
        </div>
      </div>
    </div>
  );
}