"use client";
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../apiFetch';
import ServiceUnavailable from './ServiceUnavailable';

// Raw shapes from API (snake_case)
interface RawLeaveBalance {
  id: number;
  type: string;
  total_credits: number;
  used_days: number;
  remaining_days: number;
  year: number;
}

interface RawLeaveCreditData {
  user_id?: number | string;
  userId?: number | string; // fallback if backend returns camelCase
  year: number | string;
  leave_balance?: RawLeaveBalance[];
  leaveBalance?: RawLeaveBalance[]; // fallback if backend returns camelCase
}

// Normalized shapes used by UI (camelCase)
interface LeaveBalance {
  id: number;
  type: string;
  totalCredits: number;
  usedDays: number;
  remainingDays: number;
  year: number;
}

interface LeaveCreditData {
  userId: number;
  year: number;
  leaveBalance: LeaveBalance[];
}

interface LeaveCreditCardProps {
  userId?: string | number;
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
      const currentUserId = (userId ?? (typeof window !== 'undefined' ? localStorage.getItem('userId') : ''))
        ?.toString()
        .trim();
      
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

      const raw: RawLeaveCreditData = await response.json();

      // Normalize data to camelCase and safe numbers
      const normalized: LeaveCreditData = {
        userId: Number(raw.user_id ?? raw.userId ?? currentUserId),
        year: Number(raw.year ?? year),
        leaveBalance: (raw.leave_balance ?? raw.leaveBalance ?? []).map((lb) => ({
          id: Number(lb.id),
          type: lb.type,
          totalCredits: Number(lb.total_credits ?? 0),
          usedDays: Number(lb.used_days ?? 0),
          remainingDays: Number(lb.remaining_days ?? 0),
          year: Number(lb.year ?? year),
        })),
      };

      setLeaveCreditData(normalized);
      
    } catch (err: any) {
      console.error('Error fetching leave credit data:', err);
      setError(err.message || 'Failed to load leave credits');
      setLeaveCreditData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    // Wrap to prevent state updates after unmount
    const run = async () => {
      await fetchLeaveCreditData(currentYear);
    };
    run();
    return () => {
      cancelled = true;
    };
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

  if (!leaveCreditData || !leaveCreditData.leaveBalance || leaveCreditData.leaveBalance.length === 0) {
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
    if (!total || total <= 0) return 'secondary';
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
          {leaveCreditData.leaveBalance.map((leaveType) => {
            const total = leaveType.totalCredits;
            const remaining = leaveType.remainingDays;
            const progressColor = getProgressColor(remaining, total);
            const progressPercentage = total > 0 ? (remaining / total) * 100 : 0;
            
            return (
              <div key={leaveType.id} className="col-12">
                <div className="p-2 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="fw-semibold text-dark">
                      {getTypeDisplayName(leaveType.type)}
                    </small>
                    <small className="text-muted">
                      {remaining} / {total} days
                    </small>
                  </div>
                  
                  <div className="progress" style={{ height: '6px' }}>
                    <div 
                      className={`progress-bar bg-${progressColor}`}
                      role="progressbar"
                      style={{ width: `${progressPercentage}%` }}
                      aria-valuenow={remaining}
                      aria-valuemin={0}
                      aria-valuemax={total}
                    ></div>
                  </div>
                  
                  {leaveType.usedDays > 0 && (
                    <div className="mt-1">
                      <small className="text-muted">
                        Used: {leaveType.usedDays} days
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