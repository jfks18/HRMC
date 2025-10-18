"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import * as jwt_decode from "jwt-decode";

interface FacultyAuthGuardProps {
  children: React.ReactNode;
}

export default function FacultyAuthGuard({ children }: FacultyAuthGuardProps) {
  const router = useRouter();

  function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const last = parts.pop();
      if (last) return last.split(';').shift() ?? null;
    }
    return null;
  }

  function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      const t = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (t) return t;
    }
    return getCookie('authToken');
  }

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkRole = (): string | null => {
      try {
        const stored = (typeof window !== 'undefined') ? localStorage.getItem('userRole') : null;
        if (stored) return stored.toLowerCase();
      } catch (e) { /* ignore */ }
      const token = getAuthToken();
      if (token) {
        try {
          const decoded: any = (jwt_decode as any)(token);
          if (decoded && decoded.role_id) return String(decoded.role_id);
        } catch (e) { /* ignore */ }
      }
      return null;
    };

    let attempts = 0;
    const maxAttempts = 8;
    const tryCheck = () => {
      const role = checkRole();
      let ok = false;
      if (role) {
        if (role === '2' || role === 'faculty') ok = true;
      }
      if (ok) {
        setAuthorized(true);
        setChecking(false);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          setAuthorized(false);
          setChecking(false);
          router.replace('/');
        } else {
          setTimeout(tryCheck, 250);
        }
      }
    };
    tryCheck();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'userRole' || e.key === 'authToken' || e.key === 'token') tryCheck();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  if (checking) return null;
  if (!authorized) return null;
  return <>{children}</>;
}
