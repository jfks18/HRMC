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
  const [leaveCredits, setLeaveCredits] = useState<number>(0);
  const [totalLeaveCredits, setTotalLeaveCredits] = useState<number>(0);
  useEffect(() => {
    // Get user name
    try {
      const storedName =
        (typeof window !== 'undefined' && (localStorage.getItem('userName') || localStorage.getItem('username') || localStorage.getItem('name'))) || "";
      if (storedName) {
        setUserName(storedName);
      } else {
        const uid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
        if (uid) {
          (async () => {
            try {
              const res = await apiFetch(`/api/proxy/users/${uid}/name`);
              if (!res.ok) return;
              const data = await res.json();
              if (data?.name) setUserName(data.name);
            } catch {}
          })();
        }
      }
    } catch {}

    // Get leave credits
    const uid = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (uid) {
      // Leave credits calculation
      Promise.all([
        apiFetch('/api/proxy/leave_cred').then(res => res.json()),
        apiFetch(`/api/proxy/leave_request/user/${uid}`).then(res => res.json())
      ]).then(([leaveCreds, leaveRequests]) => {
        const totalCredits = Array.isArray(leaveCreds)
          ? leaveCreds.reduce((sum, cred) => sum + (cred.credits || 0), 0)
          : 0;
        let usedDays = 0;
        if (Array.isArray(leaveRequests)) {
          leaveRequests.forEach(req => {
            if (req.is_approve === 1) {
              const start = new Date(req.start_date);
              const end = new Date(req.end_date);
              const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
              usedDays += days > 0 ? days : 0;
            }
          });
        }
        setTotalLeaveCredits(totalCredits);
        setLeaveCredits(Math.max(0, totalCredits - usedDays));
      });
    }
  }, []);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <DashboardCard title="Leave Credits" value={leaveCredits} icon="bi-calendar-check" subtitle={`Total leave: ${totalLeaveCredits}`} />
            </div>
          </div>
          <div className="d-flex flex-column align-items-center justify-content-center text-center perspective-1000" style={{ minHeight: '50vh' }}>
            <div className="spin-3d-viewport">
              <div className="spin-3d-inner">
                <div className="spin-3d-face spin-3d-front">
                  <Image src="/gwclogo.png" alt="GWC Logo" fill priority style={{ objectFit: 'contain' }} />
                </div>
                <div className="spin-3d-face spin-3d-back">
                  <Image src="/gwclogo.png" alt="GWC Logo" fill priority style={{ objectFit: 'contain', transform: 'scaleX(-1)' }} />
                </div>
              </div>
            </div>
            <h1 className="fw-bold mt-3" style={{ color: '#1a237e' }}>Faculty Dashboard</h1>
            <p className="text-muted mb-0">Welcome back, {userName}!</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
