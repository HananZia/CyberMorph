'use client'
import './home.css'; // Import custom CSS
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="homepage-container">
      <div className="homepage-content card">
        <h1 className="main-heading">CyberShield Pro</h1>
        <p className="sub-heading">AI-powered threat detection, designed for speed and administrative control.</p>

        <div className="action-buttons-wrapper">
          <button 
            onClick={() => router.push('/login')} 
            className="btn-primary-action"
          >
            Login
          </button>
          <button 
            onClick={() => router.push('/signup')} 
            className="btn-secondary-action"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}