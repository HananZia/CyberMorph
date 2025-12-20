// API Configuration for CyberMorph Backend
// This file contains all API endpoints and helper functions

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types

// User-related types
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
}

// Auth-related types
export interface LoginRequest {
  username: string;
  password: string;
}

// Registration-related types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Token response type
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: number;
  role: string;
}

// Scan-related types
export interface ScanResult {
  id: number;
  filename: string;
  verdict: 'malicious' | 'benign' | 'suspicious';
  score: number;
  details?: string;
  malware_probability?: number;
  status?: string;
  created_at: string;
}

// Stats-related types
export interface Stats {
  total_scans: number;
  threats: number;
  total_users?: number;
  users?: number;
}

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Auth API
export const authApi = {
  async login(credentials: LoginRequest): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    return response.json();
  },

  // Registration API
  async register(data: RegisterRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  // Password Reset APIs
  async forgotPassword(email: string): Promise<{ token: string; message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to send reset email');
    }
    return response.json();
  },

  // Verify Code API
  async verifyCode(code: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, token }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Invalid code');
    }
    return response.json();
  },

  // Reset Password API
  async resetPassword(code: string, token: string, newPassword: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, token, new_password: newPassword }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to reset password');
    }
    return response.json();
  },
};

// User API
export const userApi = {
  async getMe(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/me`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async getMyStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE_URL}/user/my-stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};

// Scan API
export const scanApi = {
  async uploadAndScan(file: File): Promise<ScanResult> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/scan/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Scan failed');
    }
    return response.json();
  },

  // New method to scan from features
  async scanFromFeatures(features: number[], filename?: string): Promise<ScanResult> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/scan/features`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ values: features, filename }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Scan failed');
    }
    return response.json();
  },
};

// Admin API
export const adminApi = {
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  // Delete User API
  async deleteUser(userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete user');
  },

  // Scan Management APIs
  async getScans(): Promise<ScanResult[]> {
    const response = await fetch(`${API_BASE_URL}/admin/scans`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch scans');
    return response.json();
  },

  // Delete Scan API
  async deleteScan(scanId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/admin/scans/${scanId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete scan');
  },

  // Stats API
  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // New method to get alerts
  async getAlerts(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/admin/alerts`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },
};
