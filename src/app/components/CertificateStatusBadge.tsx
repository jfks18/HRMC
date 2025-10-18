import React from 'react';

interface CertificateStatusBadgeProps {
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing';
  size?: 'sm' | 'md' | 'lg';
}

export default function CertificateStatusBadge({ status, size = 'md' }: CertificateStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Approved':
        return {
          color: 'success',
          icon: 'bi-check-circle',
          text: 'Approved'
        };
      case 'Rejected':
        return {
          color: 'danger',
          icon: 'bi-x-circle',
          text: 'Rejected'
        };
      case 'Processing':
        return {
          color: 'info',
          icon: 'bi-gear',
          text: 'Processing'
        };
      case 'Pending':
      default:
        return {
          color: 'warning',
          icon: 'bi-clock',
          text: 'Pending'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'badge-sm' : size === 'lg' ? 'badge-lg' : '';

  return (
    <span 
      className={`badge bg-${config.color} bg-opacity-10 text-${config.color} border border-${config.color} fw-semibold ${sizeClass} d-inline-flex align-items-center gap-1`}
    >
      <i className={`bi ${config.icon}`}></i>
      {config.text}
    </span>
  );
}
