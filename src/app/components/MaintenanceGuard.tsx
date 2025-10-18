"use client";
import React, { useEffect, useState } from 'react';
import { APP_LINKS } from '../apiFetch';

interface MaintenanceGuardProps {
  children: React.ReactNode;
  moduleName: string;
  userRole?: string; // Should come from your auth system
}

interface MaintenanceStatus {
  isMaintenanceMode: boolean;
  message?: string;
  estimatedDowntime?: string;
}

export default function MaintenanceGuard({ 
  children, 
  moduleName, 
  userRole = 'user' 
}: MaintenanceGuardProps) {
  const [maintenanceStatus, setMaintenanceStatus] = useState<MaintenanceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMaintenanceStatus();
  }, [moduleName]);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch(
        `${APP_LINKS.itMaintenanceStatus || APP_LINKS.itSystemStats.split('/system-stats')[0] + '/maintenance-status'}?module=${moduleName}`,
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMaintenanceStatus(data);
      } else {
        // Fallback: check local storage or default to false
        const localMaintenance = localStorage.getItem(`maintenance_${moduleName}`);
        setMaintenanceStatus({
          isMaintenanceMode: localMaintenance === 'true',
          message: 'Module is currently under maintenance.'
        });
      }
    } catch (error) {
      console.error('Error checking maintenance status:', error);
      // Default to allowing access if API fails
      setMaintenanceStatus({
        isMaintenanceMode: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5>Checking Module Status...</h5>
          </div>
        </div>
      </div>
    );
  }

  // If module is in maintenance mode and user is not a developer
  if (maintenanceStatus?.isMaintenanceMode && userRole !== 'dev') {
    return (
      <div className="container-fluid p-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2" style={{ fontSize: '1.5rem' }}></i>
                  <h4 className="mb-0">Module Under Maintenance</h4>
                </div>
              </div>
              <div className="card-body text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-tools text-warning" style={{ fontSize: '4rem' }}></i>
                </div>
                
                <h5 className="card-title mb-3">
                  {moduleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Module
                </h5>
                
                <p className="card-text text-muted mb-4">
                  {maintenanceStatus.message || 'This module is currently undergoing maintenance and is temporarily unavailable.'}
                </p>
                
                {maintenanceStatus.estimatedDowntime && (
                  <div className="alert alert-info">
                    <i className="bi bi-clock me-2"></i>
                    <strong>Estimated downtime:</strong> {maintenanceStatus.estimatedDowntime}
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-muted mb-2">We apologize for any inconvenience. Please try again later.</p>
                  <small className="text-muted">
                    For urgent matters, please contact the system administrator.
                  </small>
                </div>
                
                <div className="d-flex gap-2 justify-content-center">
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => window.history.back()}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Go Back
                  </button>
                  
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Refresh
                  </button>
                  
                  <a href="/" className="btn btn-primary">
                    <i className="bi bi-house me-2"></i>
                    Home
                  </a>
                </div>
              </div>
              
              <div className="card-footer bg-light">
                <div className="row text-center">
                  <div className="col">
                    <small className="text-muted">
                      <i className="bi bi-shield-check me-1"></i>
                      Your data is safe and secure
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If user is developer, show maintenance warning but allow access
  if (maintenanceStatus?.isMaintenanceMode && userRole === 'dev') {
    return (
      <div>
        <div className="alert alert-warning alert-dismissible fade show m-3" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div className="flex-grow-1">
              <strong>Developer Access:</strong> This module is in maintenance mode. 
              Regular users cannot access this page.
            </div>
            <button type="button" className="btn-close" data-bs-dismiss="alert"></button>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // Normal operation - render the protected content
  return <>{children}</>;
}
