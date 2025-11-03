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
    <div 
      className="card shadow-sm border-0 h-100" 
      style={{ 
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      }}
    >
      <div className="card-body d-flex flex-column align-items-start" style={{ minHeight: '120px' }}>
        <div className="d-flex align-items-center justify-content-between w-100 mb-3">
          <span className="fw-semibold text-secondary">{title}</span>
          {icon && (
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center" 
              style={{ 
                width: '40px', 
                height: '40px', 
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white'
              }}
            >
              <i className={`bi ${icon}`}></i>
            </div>
          )}
        </div>
        <div className="fs-2 fw-bold mb-2" style={{ color: '#1976d2' }}>{value}</div>
        {subtitle && (
          <div className={`small d-flex align-items-center ${trend ? (trend === 'up' ? 'text-success' : 'text-danger') : 'text-muted'}`}>
            {trend === 'up' && <i className="bi bi-arrow-up me-1"></i>}
            {trend === 'down' && <i className="bi bi-arrow-down me-1"></i>}
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
}
