import React from 'react';

const stats = [
  { label: 'Total Requests', value: 3, icon: 'bi-file-earmark', color: '#1a237e' },
  { label: 'Approved', value: 1, icon: 'bi-check2-circle', color: '#388e3c' },
  { label: 'Pending', value: 1, icon: 'bi-clock', color: '#ffb300' },
  { label: 'This Month', value: 3, icon: 'bi-award', color: '#7c3aed' },
];

export default function CertificatesStatsCards() {
  return (
    <div className="row g-3 mb-4">
      {stats.map(stat => (
        <div className="col-md-3" key={stat.label}>
          <div className="card border-0 shadow-sm d-flex flex-row align-items-center gap-3 p-3" style={{ background: '#fff' }}>
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
              <i className={`bi ${stat.icon} fs-4`} style={{ color: stat.color }}></i>
            </div>
            <div>
              <div className="fw-semibold text-secondary">{stat.label}</div>
              <div className="fs-5 fw-bold">{stat.value}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
