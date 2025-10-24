"use client";
import React from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../../components/SideNav';
import AttendanceStatsCards from './components/AttendanceStatsCards';
import AttendanceSearchFilter from './components/AttendanceSearchFilter';
import AttendanceTable from './components/AttendanceTable';

export default function Attendance() {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <h1 className="fw-bold mb-1" style={{ color: '#1a237e' }}>Time & Attendance Tracking</h1>
          <div className="text-muted mb-4">Monitor all employee attendance and work hours</div>
          <AttendanceTable />
        </main>
      </div>
    </div>
  );
}