// Dashboard summary card (e.g., Total Users, Active Sessions)
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: string; // Bootstrap icon class name
  subtitle?: string;
  trend?: 'up' | 'down'; // For up/down arrow
}

export default function DashboardCard({ title, value, icon, subtitle, trend }: DashboardCardProps) {
  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body d-flex flex-column align-items-start">
        <div className="d-flex align-items-center mb-2">
          {icon && <i className={`bi ${icon} fs-3 me-2 text-primary`}></i>}
          <span className="fw-semibold text-secondary">{title}</span>
        </div>
        <div className="fs-2 fw-bold mb-1">{value}</div>
        {subtitle && (
          <div className="text-success small d-flex align-items-center">
            {trend === 'up' && <i className="bi bi-arrow-up me-1"></i>}
            {trend === 'down' && <i className="bi bi-arrow-down me-1"></i>}
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
