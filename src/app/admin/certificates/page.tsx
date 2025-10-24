"use client";
import React from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../../components/SideNav';
import CertificatesStatsCards, { CertificateStats } from './components/CertificatesStatsCards';
import CertificatesSearchFilter from './components/CertificatesSearchFilter';
import CertificatesTable from './components/CertificatesTable';

export default function CertificatesPage() {
  const [stats, setStats] = React.useState<CertificateStats>({ total: 0, approved: 0, pending: 0, thisMonth: 0 });
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <div className="d-flex align-items-center mb-1">
            <h1 className="fw-bold mb-0 me-auto" style={{ color: '#1a237e' }}>Certificates Management</h1>
          </div>
          <div className="text-muted mb-4">Request and manage employment certificates</div>
          <CertificatesStatsCards stats={stats} />
          <CertificatesTable onStatsChange={setStats} />
        </main>
      </div>
    </div>
  );
}