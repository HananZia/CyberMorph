'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import './header.css';
import { Shield, LayoutDashboard, Search, UserPlus, LogIn, LogOut, KeyRound } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname(); // replaces Wouter's location
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const isActive = (path) => pathname === path;

  return (
    <header className="app-header">
      <div className="header-container">

        {/* Logo & Brand */}
        <div className="header-brand-section">
          <Link href="/" className="logo-link">
            <Shield size={24} className="logo-icon" />
            <span className="logo-text">CyberShield Pro</span>
          </Link>

          {/* Main Navigation */}
          <nav className="nav-links-wrapper">
            <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            {user && (
              <>
                <Link href="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  <LayoutDashboard size={16} className="nav-icon"/> Dashboard
                </Link>
                <Link href="/scan" className={`nav-link ${isActive('/scan') ? 'active' : ''}`}>
                  <Search size={16} className="nav-icon"/> Scan File
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`}>
                    <KeyRound size={16} className="nav-icon"/> Admin
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
              <span className="user-greeting">Hi, <strong className="user-username">{user.username}</strong></span>
              <button onClick={handleLogout} className="btn-logout-header">
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons-wrapper">
              <Link href="/login" className="btn-auth-link">
                <LogIn size={18} /> Login
              </Link>
              <Link href="/signup" className="btn-primary-header">
                <UserPlus size={18} /> Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
