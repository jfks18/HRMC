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
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalEvaluations: 0,
    evaluatedTeachers: 0,
    participatingStudents: 0,
    averageRating: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch user count
      const usersResponse = await apiFetch('/api/proxy/users');
      const usersData = await usersResponse.json();
      const totalUsers = Array.isArray(usersData) ? usersData.length : 0;

      // Fetch evaluation stats
      const evalResponse = await apiFetch('/api/proxy/evaluation/stats');
      const evalData = await evalResponse.json();
      
      setDashboardStats({
        totalUsers,
        totalEvaluations: evalData.stats?.total_evaluations || 0,
        evaluatedTeachers: evalData.stats?.evaluated_teachers || 0,
        participatingStudents: evalData.stats?.participating_students || 0,
        averageRating: evalData.stats?.overall_average_rating || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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
            {/* Header Section */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <h1 className="fw-bold mb-2" style={{ color: '#1a237e' }}>Admin Dashboard</h1>
                    <p className="text-muted mb-0">Welcome back, {userName || 'Admin'}! Here's your system overview.</p>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="spin-3d-viewport" style={{ width: '60px', height: '60px' }}>
                      <div className="spin-3d-inner">
                        <div className="spin-3d-face spin-3d-front">
                          <Image src="/gwclogo.png" alt="GWC Logo" fill priority style={{ objectFit: 'contain' }} />
                        </div>
                        <div className="spin-3d-face spin-3d-back">
                          <Image src="/gwclogo.png" alt="GWC Logo" fill priority style={{ objectFit: 'contain', transform: 'scaleX(-1)' }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-xl-3 col-md-6">
                {loading ? (
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: '120px' }}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <DashboardCard
                    title="Total Users"
                    value={dashboardStats.totalUsers}
                    icon="bi-people"
                    subtitle={`Active system users`}
                  />
                )}
              </div>

              <div className="col-xl-3 col-md-6">
                {loading ? (
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body d-flex align-items-center justify-content-center" style={{ minHeight: '120px' }}>
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <DashboardCard
                    title="Total Evaluations"
                    value={dashboardStats.totalEvaluations}
                    icon="bi-clipboard-check"
                    subtitle={`Completed evaluations`}
                  />
                )}
              </div>

             

          

              
            </div>
          </main>
        </div>
      </div>
    </AdminAuthGuard>
  );
};

export default AdminDashboard;
 