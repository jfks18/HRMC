"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localToken = localStorage.getItem('authToken');
      if (localToken) return localToken;
      // Fallback to cookie
      const value = `; ${document.cookie}`;
      const parts = value.split(`; authToken=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Example: Fetch role info using JWT token
  async function fetchRoleInfo(roleId: string) {
    try {
      const { apiFetch } = await import('./apiFetch');
      const res = await apiFetch(`/api/proxy/roles/${roleId}`, { headers: { 'Content-Type': 'application/json' } });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to fetch role info');
      } else {
        setSuccess(`Role: ${data.name}`);
      }
    } catch (err) {
      setError('Network error while fetching role info.');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(null);
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        setSuccess(null);
      } else {
        // Store JWT in cookie
        if (typeof document !== 'undefined' && data.token) {
          document.cookie = `authToken=${data.token}; path=/;`;
        }
        // Also store token in localStorage for client-side components
        if (typeof window !== 'undefined' && data.token) {
          localStorage.setItem('authToken', data.token);
          // some components expect 'token' key
          localStorage.setItem('token', data.token);
        }
        // Check role_id with roles API
        if (data.user && data.user.role_id) {
          let roleRes, roleData;
          try {
            // use apiFetch which attaches Authorization from localStorage when available
            const { apiFetch } = await import('./apiFetch');
            roleRes = await apiFetch(`/api/proxy/roles/${data.user.role_id}`);
            const contentType = roleRes.headers.get('content-type');
            if (!roleRes.ok || !contentType?.includes('application/json')) {
              const text = await roleRes.text();
              setError(`Role fetch failed: ${roleRes.status} ${roleRes.statusText}. Response: ${text.slice(0, 100)}`);
              setSuccess(null);
              console.error('Role fetch failed:', text);
              return;
            }
            roleData = await roleRes.json();
            if (!roleRes.ok) {
              // Try to get error message from response
              const errorMsg = roleData?.message || `${roleRes.status} ${roleRes.statusText}`;
              setError(`Role fetch failed: ${errorMsg}`);
              setSuccess(null);
              console.error('Role fetch failed:', errorMsg);
              return;
            }
          } catch (roleErr) {
            console.error('Role fetch error:', roleErr);
            setError('Network error fetching role.');
            setSuccess(null);
            return;
          }
          if (roleData && roleData.id) {
            const roleName = roleData.name.toLowerCase();
            // Store name, role, and user ID in localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('userName', data.user.name || '');
              localStorage.setItem('userRole', roleName);
              localStorage.setItem('userId', data.user.id || data.user.user_id || '');
            }
            if (roleName === 'admin') {
              router.push('/admin/dashboard');
            } else if (roleName === 'staff') {
              router.push('/staff/dashboard');
            } else if (roleName === 'dean') {
              router.push('/dean/dashboard');
            } else if (roleName === 'faculty') {
              router.push('/faculty/dashboard');
            } else {
              setSuccess(`Login successful, but unknown role: ${roleName}`);
            }
          } else {
            setSuccess("Login successful, but could not determine user role.");
          }
        } else {
          setSuccess("Login successful, but could not determine user role.");
        }
        setEmail("");
        setPassword("");
        setError("");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  // For testing: use your static JWT token
  // const token = "69c79aedc19fe39368c06b600d4941225f2fad9554d7ea6c5879ee971bd1dffe";
  // Example usage:
  // fetchRoleInfo('2'); // or any roleId you want to test

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold text-black">Email</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3 text-start">
        <label className="form-label fw-semibold text-black">Password</label>
        <div className="input-group">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <span
            className="input-group-text bg-white"
            style={{ cursor: "pointer" }}
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={0}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
          </span>
        </div>
      </div>
      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success py-2" role="alert">
          {success}
        </div>
      )}
      <button
        type="submit"
        className="btn btn-dark w-100 fw-semibold mb-3"
        disabled={loading}
      >
        {loading ? "Signing In..." : "Sign In"}
      </button>
    </form>
  );
}

