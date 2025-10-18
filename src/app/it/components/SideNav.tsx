"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    title: 'Dashboard',
    href: '/it',
    icon: 'bi-speedometer2'
  },
  {
    title: 'Database Query',
    href: '/it/database-query',
    icon: 'bi-database'
  },
  {
    title: 'System Monitor',
    href: '/it/system-monitor',
    icon: 'bi-cpu'
  },
  {
    title: 'User Logs',
    href: '/it/user-logs',
    icon: 'bi-journal-text'
  },
  {
    title: 'Data Analytics',
    href: '/it/analytics',
    icon: 'bi-graph-up'
  }
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="sidebar bg-dark text-white p-3" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="mb-4">
        <h4 className="text-center text-white mb-0">
          <i className="bi bi-gear-fill me-2"></i>
          IT Management
        </h4>
      </div>
      
      <ul className="nav nav-pills flex-column">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li className="nav-item mb-1" key={item.href}>
              <Link
                href={item.href}
                className={`nav-link text-white d-flex align-items-center ${
                  isActive ? 'active bg-primary' : 'hover-bg-secondary'
                }`}
                style={{
                  transition: 'background-color 0.2s',
                  textDecoration: 'none'
                }}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto pt-4">
        <div className="border-top pt-3">
          <Link
            href="/admin"
            className="nav-link text-white d-flex align-items-center"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Back to Admin
          </Link>
        </div>
      </div>
      
      <style jsx>{`
        .hover-bg-secondary:hover {
          background-color: #495057 !important;
        }
      `}</style>
    </nav>
  );
}
