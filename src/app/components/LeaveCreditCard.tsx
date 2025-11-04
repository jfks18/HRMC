"use client";
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../apiFetch';
import ServiceUnavailable from './ServiceUnavailable';

interface LeaveBalance {
  id: number;
  type: string;
  total_credits: number;
  used_days: number;
  remaining_days: number;
  year: number;
}

interface LeaveCreditData {
  user_id: number;
  year: number;
  leave_balance: LeaveBalance[];
}

interface LeaveCreditCardProps {
  userId?: string;
  className?: string;
}

const LeaveCreditCard: React.FC<LeaveCreditCardProps> = ({ 
  userId, 
  className = ""
}) => {
  const [leaveCreditData, setLeaveCreditData] = useState<LeaveCreditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const fetchLeaveCreditData = async (year: number) => {
    try {
      setLoading(true);
      setError(null);

      // Get userId from props or localStorage
      const currentUserId = userId || localStorage.getItem('userId');
      
      if (!currentUserId) {
        throw new Error('User ID not found. Please log in again.');
      }

      const response = await apiFetch(`/api/proxy/leave_balance/${currentUserId}?year=${year}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        }
        
        throw new Error(errorData.error || errorData.message || `Failed to fetch leave credits: ${response.status}`);
      }

      const data = await response.json();
      setLeaveCreditData(data);
      
    } catch (err: any) {
      console.error('Error fetching leave credit data:', err);
      setError(err.message || 'Failed to load leave credits');
      setLeaveCreditData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveCreditData(currentYear);
  }, [userId, currentYear]);

  if (loading) {
    return (
      <div className={`card shadow-sm ${className}`}>
        <div className="card-body">
          <h6 className="card-title text-muted mb-3">
            <i className="bi bi-calendar-event me-2"></i>
            Leave Credits
          </h6>
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2 mb-0">Loading leave credits...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Check if it's a service unavailable error
    if (error.includes('temporarily unavailable') || error.includes('Service temporarily unavailable')) {
      return (
        <ServiceUnavailable 
          serviceName="Leave Credits"
          className={className}
          onRetry={() => fetchLeaveCreditData(currentYear)}
        />
      );
    }
    
    return (
      <div className={`card shadow-sm ${className}`}>
        <div className="card-body">
          <h6 className="card-title text-muted mb-3">
            <i className="bi bi-calendar-event me-2"></i>
            Leave Credits
          </h6>
          <div className="alert alert-warning py-2 mb-2">
            <small>
              <i className="bi bi-exclamation-triangle me-1"></i>
              {error}
            </small>
          </div>
          <button 
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => fetchLeaveCreditData(currentYear)}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!leaveCreditData || !leaveCreditData.leave_balance || leaveCreditData.leave_balance.length === 0) {
    return (
      <div className={`card shadow-sm ${className}`}>
        <div className="card-body">
          <h6 className="card-title text-muted mb-3">
            <i className="bi bi-calendar-event me-2"></i>
            Leave Credits
          </h6>
          <div className="text-center py-2">
            <i className="bi bi-info-circle text-muted mb-2" style={{ fontSize: '1.5rem' }}></i>
            <p className="text-muted mb-0">No leave credit data found</p>
          </div>
        </div>
      </div>
    );
  }

  const getTypeDisplayName = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'sick': 'Sick Leave',
      'vacation': 'Vacation',
      'personal': 'Personal',
      'emergency': 'Emergency',
      'maternity': 'Maternity',
      'paternity': 'Paternity'
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getProgressColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage >= 70) return 'success';
    if (percentage >= 30) return 'warning';
    return 'danger';
  };

  return (
    <div className={`card shadow-sm ${className}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title text-muted mb-0">
            <i className="bi bi-calendar-event me-2"></i>
            Leave Credits ({currentYear})
          </h6>
        </div>

        <div className="row g-2">
          {leaveCreditData.leave_balance.map((leaveType) => {
            const progressColor = getProgressColor(leaveType.remaining_days, leaveType.total_credits);
            const progressPercentage = (leaveType.remaining_days / leaveType.total_credits) * 100;
            
            return (
              <div key={leaveType.id} className="col-12">
                <div className="p-2 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="fw-semibold text-dark">
                      {getTypeDisplayName(leaveType.type)}
                    </small>
                    <small className="text-muted">
                      {leaveType.remaining_days} / {leaveType.total_credits} days
                    </small>
                  </div>
                  
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className={`progress-bar bg-${progressColor}`}
                      role="progressbar"
                      style={{ width: `${progressPercentage}%` }}
                      aria-valuenow={leaveType.remaining_days}
                      aria-valuemin={0}
                      aria-valuemax={leaveType.total_credits}
                    ></div>
                  </div>
                  
                  {leaveType.used_days > 0 && (
                    <div className="mt-1">
                      <small className="text-muted">
                        Used: {leaveType.used_days} days
                      </small>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 pt-2 border-top">
          <small className="text-muted d-flex align-items-center">
            <i className="bi bi-info-circle me-1"></i>
            Current year leave balance
          </small>
        </div>
      </div>
    </div>
  );
};

export default LeaveCreditCard;