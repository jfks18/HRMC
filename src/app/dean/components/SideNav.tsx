"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: 'bi-grid', href: NGROK_BASE + '/dean/dashboard'},
  { label: 'Time Tracking', icon: 'bi-clock-history', href: NGROK_BASE + '/dean/attendance' },
  { label: 'Leave Management', icon: 'bi-calendar-check', href: NGROK_BASE + '/dean/leave' },
  { label: 'Faculty Evaluation', icon: 'bi-star', href: NGROK_BASE + '/dean/faculty-evaluation' },
  { label: 'Certificates', icon: 'bi-file-earmark-text', href: NGROK_BASE + '/dean/dean-certificate' },
];

const navItems = [
  { label: 'Dashboard', icon: 'bi-grid', href: '/dean/dashboard'},
  { label: 'Time Tracking', icon: 'bi-clock-history', href: '/dean/attendance' },
  { label: 'Leave Management', icon: 'bi-calendar-check', href: '/dean/leave' },
  { label: 'Faculty Evaluation', icon: 'bi-star', href: '/dean/faculty-evaluation' },
  { label: 'Certificates', icon: 'bi-file-earmark-text', href: '/dean/dean-certificate' },
];
export default function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="d-flex flex-column bg-white shadow-sm p-3" style={{ width: 260, minHeight: '100vh' }}>
      <div className="mb-4 d-flex align-items-center gap-2">
        <img src="/gwclogo.png" alt="HRMS Logo" width={36} height={36} />
        <div>
          <div className="fw-bold fs-5" style={{ color: '#1a237e' }}>GWC HRMS</div>
          <div className="text-muted small">Management System</div>
        </div>
      </div>
      <ul className="nav nav-pills flex-column mb-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <li className="nav-item mb-1" key={item.label}>
              <Link
                href={item.href}
                className={`nav-link d-flex align-items-center gap-2 ${isActive ? 'active' : 'text-secondary'}`}
                style={{
                  background: isActive ? '#e3e8ff' : 'none',
                  color: isActive ? '#1a237e' : '#495057',
                  fontWeight: isActive ? 600 : 400,
                  borderRadius: 8,
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto d-flex align-items-center gap-2 p-2 rounded bg-light">
        <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
          <span>SJ</span>
        </div>
        <div>
          <div className="fw-semibold" style={{ color: '#1a237e' }}>Sarah Johnson</div>
          <div className="text-muted small">Admin</div>
        </div>
      </div>
    </aside>
  );
}
