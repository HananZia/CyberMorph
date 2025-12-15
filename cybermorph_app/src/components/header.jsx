'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
// Assuming the professional CSS is in a module named 'header.module.css'
// Note: If you insist on 'header.css' being imported as 'styles',
// the import must match your file system setup.
import './header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  // Helper for conditional styling
  const isActive = (path) => pathname === path;

  return (
    <header className="app-header">
      <div className="header-container">

        {/* Logo & Brand - Cleaned up to match the professional CSS */}
        <div className="header-brand-section">
          <Link href="/" className="logo-link">
            {/* The previous version had a non-existent logoIcon class; removed for professionalism */}
            <span className="logo-text">CyberShield Pro</span>
          </Link>

          {/* Main Navigation */}
          <nav className="nav-links-wrapper">
            <Link 
              href="/" 
              // Use the dynamic class helper function
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            {user && (
              <>
                <Link 
                  href="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/scan" 
                  className={`nav-link ${isActive('/scan') ? 'active' : ''}`}
                >
                  Scan File
                </Link>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    // Use the specific admin-link class for visual distinction
                    className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* User/Auth Actions */}
        <div className="header-actions">
          {user ? (
            <div className="user-profile-actions">
              <span className="user-greeting">Welcome, 
                <strong className="user-username"> {user.username}</strong>
              </span>
              <button onClick={handleLogout} className="btn-logout-header">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons-wrapper">
              {/* Used specific class names from the refined CSS for Login/Signup */}
              <Link href="/login" className="btn-auth-link">
                Login
              </Link>
              <Link href="/signup" className="btn-primary-header">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}