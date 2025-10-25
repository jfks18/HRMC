"use client";
import React, { useEffect, useState } from 'react';
import SideNav from '../../components/SideNav';
import Image from 'next/image';
import TopBar from '../../components/TopBar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import AdminAuthGuard from '../../components/AdminAuthGuard';
import InteractiveCard from '../../components/InteractiveCard';
import { apiFetch } from '../../apiFetch';

const cardStyle = {
  transition: 'box-shadow 0.2s, transform 0.2s',
  background: '#f8fafd',
  cursor: 'pointer',
};

// Client component for interactive dashboard card wrapper

const AdminDashboard = () => {
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Client-side only: attempt to read from localStorage first
    try {
      const storedName =
        (typeof window !== 'undefined' && (localStorage.getItem('userName') || localStorage.getItem('username') || localStorage.getItem('name'))) || "";
      if (storedName) {
        setUserName(storedName);
        return;
      }
      const uid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
      if (!uid) return;
      // Fallback: fetch name by userId from backend
      (async () => {
        try {
          const res = await apiFetch(`/api/proxy/users/${uid}/name`);
          if (!res.ok) return;
          const data = await res.json();
          if (data?.name) setUserName(data.name);
        } catch {
          // ignore
        }
      })();
    } catch {
      // ignore read errors
    }
  }, []);

  return (
    <AdminAuthGuard>
      <div className="d-flex min-vh-100 bg-light">
        <SideNav />
        <div className="flex-grow-1">
          <TopBar />
          <main className="container-fluid py-4">
                             <div className="d-flex flex-column align-items-center justify-content-center text-center perspective-1000" style={{ minHeight: '70vh' }}>
                               <div className="spin-3d-viewport">
                                 <div className="spin-3d-inner">
                                   <div className="spin-3d-face spin-3d-front">
                                     <Image src="/gwclogo.png" alt="GWC Logo" fill priority style={{ objectFit: 'contain' }} />
                                   </div>
                                   <div className="spin-3d-face spin-3d-back">
                                     {/* Flip horizontally so the logo reads correctly when the back faces forward */}
                                     <Image src="/gwclogo.png" alt="GWC Logo" fill priority style={{ objectFit: 'contain', transform: 'scaleX(-1)' }} />
                                   </div>
                                 </div>
                               </div>
                                <h1 className="fw-bold mb-2" style={{ color: '#1a237e' }}>Admin Dashboard</h1>
                  <p className="text-muted mb-4">Welcome back, {userName || 'Admin'}</p>
                             </div>
                           </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminDashboard;
 