import React from 'react';

const stats = [
  { label: 'Total Hours', value: '39.3h', icon: 'bi-clock', color: '#1a237e' },
  { label: 'Overtime Hours', value: '1.5h', icon: 'bi-stopwatch', color: '#ff6f00' },
  { label: 'Average Hours', value: '7.8h', icon: 'bi-graph-up', color: '#388e3c' },
  { label: 'Present Today', value: 5, icon: 'bi-person', color: '#7c3aed' },
];

export default function AttendanceStatsCards() {
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
