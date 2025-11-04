"use client";
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../apiFetch';

interface LeaveSummaryItem {
  user_id: number;
  user_name: string;
  leave_type: string;
  total_credits: number;
  used_days: number;
  remaining_days: number;
}

interface LeaveSummaryData {
  year: number;
  summary: LeaveSummaryItem[];
}

interface LeaveSummaryCardProps {
  className?: string;
}

const LeaveSummaryCard: React.FC<LeaveSummaryCardProps> = ({ className = "" }) => {
  const [summaryData, setSummaryData] = useState<LeaveSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  const fetchLeaveSummary = async (year: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch(`/api/proxy/leave_summary?year=${year}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle specific error cases
        if (response.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        }
        
        throw new Error(errorData.error || errorData.message || `Failed to fetch leave summary: ${response.status}`);
      }

      const data = await response.json();
      setSummaryData(data);
      
    } catch (err: any) {
      console.error('Error fetching leave summary:', err);
      setError(err.message || 'Failed to load leave summary');
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveSummary(selectedYear);
  }, [selectedYear]);

  const handleYearChange = (newYear: number) => {
    setSelectedYear(newYear);
  };

  const toggleUserExpansion = (userId: number) => {
    const newExpandedUsers = new Set(expandedUsers);
    if (newExpandedUsers.has(userId)) {
      newExpandedUsers.delete(userId);
    } else {
      newExpandedUsers.add(userId);
    }
    setExpandedUsers(newExpandedUsers);
  };

  // Generate year options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Group summary data by user
  const groupedData = summaryData?.summary.reduce((acc, item) => {
    if (!acc[item.user_id]) {
      acc[item.user_id] = {
        user_id: item.user_id,
        user_name: item.user_name,
        leave_types: []
      };
    }
    acc[item.user_id].leave_types.push(item);
    return acc;
  }, {} as Record<number, { user_id: number; user_name: string; leave_types: LeaveSummaryItem[] }>) || {};

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

  if (loading) {
    return (
      <div className={`card shadow-sm ${className}`}>
        <div className="card-body">
          <h6 className="card-title text-muted mb-3">
            <i className="bi bi-people me-2"></i>
            Leave Summary - All Employees
          </h6>
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted mt-2 mb-0">Loading leave summary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`card shadow-sm ${className}`}>
        <div className="card-body">
          <h6 className="card-title text-muted mb-3">
            <i className="bi bi-people me-2"></i>
            Leave Summary - All Employees
          </h6>
          <div className="alert alert-warning py-2 mb-2">
            <small>
              <i className="bi bi-exclamation-triangle me-1"></i>
              {error}
            </small>
          </div>
          <button 
            className="btn btn-sm btn-outline-primary w-100"
            onClick={() => fetchLeaveSummary(selectedYear)}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`card shadow-sm ${className}`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="card-title text-muted mb-0">
            <i className="bi bi-people me-2"></i>
            Leave Summary - All Employees
          </h6>
          <select 
            className="form-select form-select-sm" 
            style={{ width: 'auto' }}
            value={selectedYear}
            onChange={(e) => handleYearChange(parseInt(e.target.value))}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Scrollable container with max 3 items visible */}
        <div 
          className="overflow-auto" 
          style={{ 
            maxHeight: '300px', // Approximately 3 items at ~100px each
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          <div className="accordion" id="leaveSummaryAccordion">
            {Object.values(groupedData).map((userGroup, index) => {
            const isExpanded = expandedUsers.has(userGroup.user_id);
            
            // Calculate total used and remaining for this user
            const totalUsed = userGroup.leave_types.reduce((sum, lt) => sum + lt.used_days, 0);
            const totalRemaining = userGroup.leave_types.reduce((sum, lt) => sum + lt.remaining_days, 0);
            const totalCredits = userGroup.leave_types.reduce((sum, lt) => sum + lt.total_credits, 0);
            
            return (
              <div key={userGroup.user_id} className="accordion-item border-0 mb-2">
                <h2 className="accordion-header">
                  <button 
                    className={`accordion-button ${isExpanded ? '' : 'collapsed'} py-2 bg-light`}
                    type="button"
                    onClick={() => toggleUserExpansion(userGroup.user_id)}
                    style={{ fontSize: '0.9rem' }}
                  >
                    <div className="d-flex justify-content-between align-items-center w-100 me-3">
                      <span className="fw-semibold">{userGroup.user_name}</span>
                      <div className="d-flex gap-3">
                        <small className="text-muted">
                          <i className="bi bi-calendar-check me-1"></i>
                          Used: {totalUsed}
                        </small>
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          Remaining: {totalRemaining}
                        </small>
                      </div>
                    </div>
                  </button>
                </h2>
                <div className={`accordion-collapse collapse ${isExpanded ? 'show' : ''}`}>
                  <div className="accordion-body py-2">
                    <div className="row g-2">
                      {userGroup.leave_types.map((leaveType) => {
                        const progressColor = getProgressColor(leaveType.remaining_days, leaveType.total_credits);
                        const progressPercentage = (leaveType.remaining_days / leaveType.total_credits) * 100;
                        
                        return (
                          <div key={`${leaveType.user_id}-${leaveType.leave_type}`} className="col-md-6">
                            <div className="p-2 border rounded bg-white">
                              <div className="d-flex justify-content-between align-items-center mb-1">
                                <small className="fw-semibold text-dark">
                                  {getTypeDisplayName(leaveType.leave_type)}
                                </small>
                                <small className="text-muted">
                                  {leaveType.remaining_days} / {leaveType.total_credits}
                                </small>
                              </div>
                              
                              <div className="progress mb-1" style={{ height: '6px' }}>
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
                                <small className="text-muted">
                                  Used: {leaveType.used_days} days
                                </small>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        </div>

        {Object.keys(groupedData).length === 0 && (
          <div className="text-center py-3">
            <i className="bi bi-info-circle text-muted mb-2" style={{ fontSize: '1.5rem' }}></i>
            <p className="text-muted mb-0">No leave data found for {selectedYear}</p>
          </div>
        )}

        <div className="mt-3 pt-2 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="bi bi-info-circle me-1"></i>
              {Object.keys(groupedData).length} employees • {selectedYear}
            </small>
            {Object.keys(groupedData).length > 3 && (
              <small className="text-muted">
                <i className="bi bi-arrow-down-up me-1"></i>
                Scroll for more
              </small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveSummaryCard;