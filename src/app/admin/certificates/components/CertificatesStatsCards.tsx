import React from 'react';

export type CertificateStats = {
  total: number;
  approved: number;
  pending: number;
  thisMonth: number;
};

export default function CertificatesStatsCards({ stats }: { stats: CertificateStats }) {
  const cards = [
    { label: 'Total Requests', value: stats.total, icon: 'bi-file-earmark', color: '#1a237e' },
    { label: 'Approved', value: stats.approved, icon: 'bi-check2-circle', color: '#388e3c' },
    { label: 'Pending', value: stats.pending, icon: 'bi-clock', color: '#ffb300' },
    { label: 'This Month', value: stats.thisMonth, icon: 'bi-award', color: '#7c3aed' },
  ];
  return (
    <div className="row g-3 mb-4">
      {cards.map(stat => (
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
