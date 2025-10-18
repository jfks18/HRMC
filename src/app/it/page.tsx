"use client";
import React from 'react';
import Link from 'next/link';

export default function ITDashboard() {
  const cards = [
    {
      title: 'Database Query',
      description: 'Execute SQL queries and view database data',
      icon: 'bi-database',
      href: '/it/database-query',
      color: 'primary'
    },
    {
      title: 'System Monitor',
      description: 'Monitor system performance and resources',
      icon: 'bi-cpu',
      href: '/it/system-monitor',
      color: 'success'
    },
    {
      title: 'User Activity Logs',
      description: 'View user login and activity logs',
      icon: 'bi-journal-text',
      href: '/it/user-logs',
      color: 'info'
    },
    {
      title: 'Data Analytics',
      description: 'Analyze application data and generate reports',
      icon: 'bi-graph-up',
      href: '/it/analytics',
      color: 'warning'
    }
  ];

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold text-dark mb-1">IT Management Dashboard</h2>
          <p className="text-muted">Manage database, monitor systems, and analyze application data</p>
        </div>
      </div>

      <div className="row">
        {cards.map((card, index) => (
          <div key={index} className="col-lg-3 col-md-6 mb-4">
            <Link href={card.href} className="text-decoration-none">
              <div className="card h-100 border-0 shadow-sm hover-shadow-lg" style={{ transition: 'all 0.3s' }}>
                <div className="card-body text-center p-4">
                  <div className={`text-${card.color} mb-3`}>
                    <i className={`bi ${card.icon}`} style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="card-title text-dark mb-2">{card.title}</h5>
                  <p className="card-text text-muted small">{card.description}</p>
                  <div className={`btn btn-outline-${card.color} btn-sm`}>
                    Access Tool
                    <i className="bi bi-arrow-right ms-1"></i>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="card-title text-danger">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                IT Access Notice
              </h5>
              <p className="card-text text-muted mb-0">
                This section contains sensitive database and system information. 
                Access is restricted to authorized IT personnel only. 
                All activities are logged and monitored for security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hover-shadow-lg:hover {
          transform: translateY(-2px);
          box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>
    </div>
  );
}
