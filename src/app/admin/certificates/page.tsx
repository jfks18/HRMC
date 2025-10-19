"use client";
import React from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../../components/SideNav';
import CertificatesStatsCards from './components/CertificatesStatsCards';
import CertificatesSearchFilter from './components/CertificatesSearchFilter';
import CertificatesTable from './components/CertificatesTable';

export default function CertificatesPage() {
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
          <CertificatesStatsCards />
          <CertificatesTable />
        </main>
      </div>
    </div>
  );
}