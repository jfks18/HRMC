"use client";
import React from 'react';

interface ServiceUnavailableProps {
  serviceName?: string;
  className?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

const ServiceUnavailable: React.FC<ServiceUnavailableProps> = ({ 
  serviceName = "Service", 
  className = "",
  showRetry = true,
  onRetry
}) => {
  return (
    <div className={`card shadow-sm ${className}`}>
      <div className="card-body text-center py-4">
        <div className="mb-3">
          <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '2.5rem' }}></i>
        </div>
        <h6 className="card-title text-muted mb-2">{serviceName} Temporarily Unavailable</h6>
        <p className="text-muted small mb-3">
          We're experiencing some technical difficulties. Our team has been notified and is working on a fix.
        </p>
        
        <div className="alert alert-info py-2 mb-3">
          <small>
            <strong>What you can do:</strong>
            <ul className="list-unstyled mt-1 mb-0 small">
              <li>• Wait a few minutes and try again</li>
              <li>• Check your internet connection</li>
              <li>• Contact support if the issue persists</li>
            </ul>
          </small>
        </div>
        
        {showRetry && onRetry && (
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={onRetry}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Try Again
          </button>
        )}
        
        <div className="mt-3">
          <small className="text-muted">
            <i className="bi bi-clock me-1"></i>
            Status will be updated automatically
          </small>
        </div>
      </div>
    </div>
  );
};

export default ServiceUnavailable;