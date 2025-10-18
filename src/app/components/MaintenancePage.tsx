"use client";
import React from 'react';

interface MaintenancePageProps {
  title?: string;
  description?: string;
  expectedCompletion?: string;
  contactInfo?: string;
  showReturnTime?: boolean;
}

export default function MaintenancePage({
  title = "System Maintenance",
  description = "This section is currently under maintenance. We're working to improve your experience.",
  expectedCompletion = "We expect to complete this maintenance soon.",
  contactInfo = "If you need immediate assistance, please contact your system administrator.",
  showReturnTime = true
}: MaintenancePageProps) {
  return (
    <div className="container-fluid d-flex align-items-center justify-content-center min-vh-100" style={{ background: 'linear-gradient(135deg, #1a237e 0%, #3f51b5 100%)' }}>
      <div className="text-center text-white">
        <div className="mb-4">
          {/* GWC Logo */}
                     <img 
              src="/gwclogo.png" 
              alt="GWC Logo" 
              style={{ 
                maxWidth: '100px', 
                maxHeight: '100px', 
                objectFit: 'contain'
              }} 
            />
          </div>
        
    
        
        <h1 className="display-4 fw-bold mb-3">{title}</h1>
        <p className="lead mb-4" style={{ maxWidth: '500px', margin: '0 auto' }}>
          {description}
        </p>
        
        {showReturnTime && (
          <div className="mb-4">
            <div className="card bg-white bg-opacity-10 border-0 d-inline-block">
              <div className="card-body p-3">
                <h6 className="card-title text-white mb-2">
                  <i className="bi bi-clock me-2"></i>
                  Expected Completion
                </h6>
                <p className="card-text text-white-50 mb-0">
                  {expectedCompletion}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-4">
          <p className="text-white-50 mb-3">{contactInfo}</p>
          <button 
            className="btn btn-light btn-lg me-3 shadow"
            onClick={() => window.location.reload()}
            style={{ color: '#1a237e', fontWeight: 'bold' }}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh Page
          </button>
          <button 
            className="btn btn-outline-light btn-lg shadow"
            onClick={() => window.history.back()}
            style={{ borderColor: 'white', color: 'white' }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Go Back
          </button>
        </div>
        
        {/* Animated maintenance indicator */}
        <div className="mt-5">
          <div className="d-flex justify-content-center align-items-center">
            <div className="spinner-border spinner-border-sm text-white me-2" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <small className="text-white-50">Maintenance in progress...</small>
          </div>
        </div>
        
        {/* Additional info cards */}
        <div className="row justify-content-center mt-5">
          <div className="col-md-4">
            <div className="card bg-white bg-opacity-10 border-0 h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-shield-check" style={{ fontSize: '2rem', color: 'white' }}></i>
                <h6 className="text-white mt-3 mb-2">Data Security</h6>
                <p className="text-white-50 small mb-0">Your data is safe and secure during maintenance</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-white bg-opacity-10 border-0 h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-lightning-charge" style={{ fontSize: '2rem', color: 'white' }}></i>
                <h6 className="text-white mt-3 mb-2">Performance</h6>
                <p className="text-white-50 small mb-0">We're improving system performance and features</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-white bg-opacity-10 border-0 h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-headset" style={{ fontSize: '2rem', color: 'white' }}></i>
                <h6 className="text-white mt-3 mb-2">Support</h6>
                <p className="text-white-50 small mb-0">Our support team is available for urgent matters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
