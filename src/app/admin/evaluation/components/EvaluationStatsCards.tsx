import React from 'react';

const stats = [
  { label: 'Total Faculty', value: 4, icon: 'bi-person', color: '#1a237e' },
  { label: 'Total Evaluations', value: 2, icon: 'bi-file-earmark', color: '#388e3c' },
  { label: 'Average Rating', value: 4.2, icon: 'bi-star', color: '#ffb300' },
  { label: 'This Month', value: '+12', icon: 'bi-graph-up-arrow', color: '#7c3aed' },
];

export default function EvaluationStatsCards() {
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
