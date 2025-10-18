"use client";
import React from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../components/SideNav';
import CertificatesTable from './certificatestable';

export default function StaffCertificateManagementPage() {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <h1 className="fw-bold mb-1" style={{ color: '#1a237e' }}>Certificate Management</h1>
          <div className="text-muted mb-4">Manage your certificates and awards</div>
          <CertificatesTable/>
        </main>
      </div>
    </div>
  );
}
