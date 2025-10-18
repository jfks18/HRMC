"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import * as jwt_decode from "jwt-decode";

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();

  // Helper to get cookie value by name
  function getCookie(name: string) {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const last = parts.pop();
      if (last) {
        const val = last.split(';').shift();
        return val ?? null;
      }
    }
    return null;
  }

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getCookie('authToken');
    // prefer client-side stored role information as fallback
    const storedRole = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
    const storedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    let isAdmin = false;
    if (storedRole === 'admin' && storedUserId) {
      isAdmin = true;
    } else if (token) {
      try {
        const decoded: any = (jwt_decode as any)(token);
        isAdmin = decoded.role_id === 1;
      } catch (e) {
        isAdmin = false;
      }
    }

    if (!isAdmin) {
      setAuthorized(false);
      setChecking(false);
      router.replace('/');
    } else {
      setAuthorized(true);
      setChecking(false);
    }
  }, [router]);

  if (checking) return null;
  if (!authorized) return null;
  return <>{children}</>;
}
