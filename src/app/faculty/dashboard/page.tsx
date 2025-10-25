"use client";
import Image from 'next/image';
import SideNav from '../components/SideNav';
import TopBar from '../../components/TopBar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import InteractiveCard from '../../components/InteractiveCard';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../apiFetch';

const FacultyDashboard = () => {
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
            <h1 className="fw-bold mt-3" style={{ color: '#1a237e' }}>Faculty Dashboard</h1>
            <p className="text-muted mb-0">Welcome back, Faculty!</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
