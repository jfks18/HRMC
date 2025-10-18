// Example of how to protect a page with MaintenanceGuard

"use client";
import React, { useState } from 'react';
import MaintenanceGuard from '../../components/MaintenanceGuard';

// This should come from your authentication system
function getUserRole(): string {
  // Replace this with your actual auth logic
  // For demo purposes, you can change this to 'dev' to test developer access
  return 'admin'; // or 'user', 'dev', etc.
}

export default function LeavePageWithMaintenance() {
  const userRole = getUserRole();

  return (
    <MaintenanceGuard moduleName="leave_management" userRole={userRole}>
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-1">📋 Leave Management</h2>
            <p className="text-muted mb-0">
              Manage and process leave requests
            </p>
          </div>
          <button className="btn btn-primary">
            <i className="bi bi-plus me-2"></i>
            New Leave Request
          </button>
        </div>

        <div className="card">
          <div className="card-header">
            <h5 className="card-title mb-0">Leave Requests</h5>
          </div>
          <div className="card-body">
            <p>This is the leave management module content.</p>
            <p>When this module is set to maintenance mode:</p>
            <ul>
              <li>Regular users will see a maintenance page</li>
              <li>Developers will see this content with a warning banner</li>
              <li>Access buttons in system monitor will be disabled for non-dev users</li>
            </ul>
          </div>
        </div>
      </div>
    </MaintenanceGuard>
  );
}

// To use this system:
// 1. Wrap your existing page content with MaintenanceGuard
// 2. Pass the correct moduleName (should match what you use in system monitor)
// 3. Integrate with your actual authentication system to get userRole
// 4. The MaintenanceGuard will automatically handle access control
