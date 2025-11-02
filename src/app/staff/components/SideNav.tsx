"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: 'Dashboard', icon: 'bi-grid', href: '/staff/dashboard'},
  { label: 'Time Tracking', icon: 'bi-clock-history', href: '/staff/attendance' },
  { label: 'Leave Management', icon: 'bi-calendar-check', href: '/staff/leave-management' },
  { label: 'Certificates', icon: 'bi-file-earmark-text', href: '/staff/certificate-management' },
];

export default function SideNav() {
  const pathname = usePathname();
  
  // Get user info from localStorage
  let userName = '';
  let userRole = '';
  if (typeof window !== 'undefined') {
    userName = localStorage.getItem('userName') || '';
    userRole = localStorage.getItem('userRole') || '';
  }

  // Generate initials from username
  const getUserInitials = (name: string) => {
    if (!name || name.trim() === '') return 'U';
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    } else {
      const firstInitial = nameParts[0].charAt(0).toUpperCase();
      const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      return firstInitial + lastInitial;
    }
  };

  const userInitials = getUserInitials(userName);
  
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
        <div 
          className="text-white rounded-circle d-flex align-items-center justify-content-center fw-semibold" 
          style={{ 
            width: 36, 
            height: 36,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            fontSize: '0.875rem'
          }}
        >
          <span>{userInitials}</span>
        </div>
        <div>
          <div className="fw-semibold" style={{ color: '#1a237e' }}>{userName || 'User'}</div>
          <div className="text-muted small">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Role'}</div>
        </div>
      </div>
    </aside>
  );
}
