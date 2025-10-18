"use client";
import React from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../components/SideNav';
import LeaveTable from './leavetable';

export default function StaffLeaveManagementPage() {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <h1 className="fw-bold mb-1" style={{ color: '#1a237e' }}>Leave Management</h1>
          <div className="text-muted mb-4">View and manage your leave requests</div>
          {/* Add leave search/filter and table here */}
          <LeaveTable/>
        </main>
      </div>
    </div>
  );
}
