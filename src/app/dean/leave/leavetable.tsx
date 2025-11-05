"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../apiFetch';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';

interface LeaveRequest {
  id: number;
  user_id: number;
  user_name?: string;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  is_approve?: number | null;
  created_at: string;
}

// Helper function to format dates
function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Compute inclusive days between two dates (start and end). Returns number or '-' if invalid.
function computeDays(start?: string, end?: string, fallback?: number | null) {
  if (!start || !end) return (typeof fallback === 'number' ? fallback : '-');
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return (typeof fallback === 'number' ? fallback : '-');
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.floor((Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()) - Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())) / msPerDay) + 1;
  return diff >= 0 ? diff : (typeof fallback === 'number' ? fallback : '-');
}

function getStatusBadge(status: string) {
  const statusClasses = {
    pending: 'bg-warning text-dark',      // Yellow with dark text
    approved: 'bg-success',               // Green  
    rejected: 'bg-danger',                // Red (legacy)
    disapprove: 'bg-danger',              // Red (legacy)
    disapproved: 'bg-danger',             // Red (canonical)
    cancelled: 'bg-secondary'             // Gray
  };
  
  return (
    <span className={`badge ${statusClasses[status as keyof typeof statusClasses] || 'bg-secondary'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
    </span>
  );
}

function getLeaveTypeBadge(type: string) {
  const typeClasses = {
    sick: 'bg-info',
    vacation: 'bg-primary',
    personal: 'bg-secondary',
    emergency: 'bg-danger',
    maternity: 'bg-success',
    paternity: 'bg-success'
  };
  
  return (
    <span className={`badge ${typeClasses[type as keyof typeof typeClasses] || 'bg-secondary'}`}>
      {type?.charAt(0).toUpperCase() + type?.slice(1)}
    </span>
  );
}

export default function LeaveTable() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const [departmentName, setDepartmentName] = useState<string>('');

  const getRealStatus = (is_approve: number | null | undefined): string => {
    if (is_approve === null || typeof is_approve === 'undefined') return 'pending';
    if (is_approve === 0) return 'disapproved';
    if (is_approve === 1) return 'approved';
    return 'pending';
  };

  const getDisplayStatus = (row: Pick<LeaveRequest, 'status' | 'is_approve'>): string => {
    const s = String(row.status || '').toLowerCase();
    if (s) return s;
    return getRealStatus(row.is_approve);
  };

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of leaveRequests) set.add(getDisplayStatus(r));
    if (set.has('rejected')) { set.delete('rejected'); set.add('disapproved'); }
    return Array.from(set).sort();
  }, [leaveRequests]);

  // Get current user ID and department from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      console.log('Retrieved current user ID from localStorage:', userId);
      setCurrentUserId(userId);
    }
  }, []);

  // Fetch leave requests filtered by dean's department
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      setError('');
      
      try {
        // First get the current dean's department information
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('User ID not found. Please log in again.');
        }
        
        console.log('Fetching dean user info to get department ID');
        
        const { apiFetch } = await import('../../apiFetch');
        
        // Get dean's user information including department_id
        const userResponse = await apiFetch(`/api/proxy/users/${userId}`, { 
          headers: { 'Content-Type': 'application/json' } 
        });
        
        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user information: HTTP ${userResponse.status}`);
        }
        
        const userData = await userResponse.json();
        console.log('Dean user data:', userData);
        
        // Set department name for display
        setDepartmentName(userData.department_name || 'All Departments');
        
        if (!userData.department_id) {
          // Fallback to all leave requests if no department assigned
          console.log('Dean has no department assigned, fetching all leave requests');
          
          const response = await apiFetch('/api/proxy/leave_request', { 
            headers: { 'Content-Type': 'application/json' } 
          });
          
          if (!response.ok) {
            if (response.status === 404) {
              setLeaveRequests([]);
              setError('No leave requests found');
              return;
            }
            throw new Error(`HTTP ${response.status}: Failed to fetch leave requests`);
          }
          
          const data = await response.json();
          console.log('Fetched all leave requests (no department filter):', data);
          setLeaveRequests(data);
          setError('');
          return;
        }
        
        // Fetch leave requests for dean's department only
        console.log(`Fetching leave requests for department: ${userData.department_id}`);
        
        const response = await apiFetch(`/api/proxy/leave_request/department/${userData.department_id}`, { 
          headers: { 'Content-Type': 'application/json' } 
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            setLeaveRequests([]);
            setError(`No leave requests found in your department`);
            return;
          }
          throw new Error(`HTTP ${response.status}: Failed to fetch department leave requests`);
        }
        
        const data = await response.json();
        console.log(`Fetched ${data.length} leave requests for department ${userData.department_id}:`, data);
        setLeaveRequests(data);
        setError('');
        
      } catch (err: any) {
        console.error('Error fetching leave requests:', err);
        setError(err.message || 'Failed to load leave requests');
        setLeaveRequests([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveRequests();
  }, []);

  // Handle approve leave request
  const handleApproveRequest = async (requestId: number) => {
    if (processingIds.includes(requestId)) return; // already processing
    if (!confirm(`Are you sure you want to approve leave request #${requestId}?`)) {
      return;
    }

    setProcessingIds(prev => prev.includes(requestId) ? prev : [...prev, requestId]);
    try {
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/approve`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_approve: 1 }) });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to approve leave request`);
      }

      // Update the local state to reflect the approved status
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: 'approved', is_approve: 1 }
            : request
        )
      );

      // Show success toast notification
      showToast(`Leave request #${requestId} has been approved successfully.`, 'success');

    } catch (err: any) {
      console.error('Error approving leave request:', err);
      showToast(`Failed to approve leave request: ${err.message || 'Unknown error'}`, 'danger');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  // Handle reject leave request
  const handleRejectRequest = async (requestId: number) => {
    if (processingIds.includes(requestId)) return; // already processing
    if (!confirm(`Are you sure you want to reject leave request #${requestId}?`)) {
      return;
    }

    setProcessingIds(prev => prev.includes(requestId) ? prev : [...prev, requestId]);
    try {
      // Call the dedicated disapprove endpoint
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/disapprove`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to reject leave request`);
      }

      // Update the local state to reflect the rejected status
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: 'rejected', is_approve: 0 }
            : request
        )
      );

      // Show success toast notification
      showToast(`Leave request #${requestId} has been rejected.`, 'warning');

    } catch (err: any) {
      console.error('Error rejecting leave request:', err);
      showToast(`Failed to reject leave request: ${err.message || 'Unknown error'}`, 'danger');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  // Handle cancel leave request (only for dean's own requests)
  const handleCancelRequest = async (requestId: number) => {
    if (processingIds.includes(requestId)) return; // already processing
    if (!confirm(`Are you sure you want to cancel leave request #${requestId}?`)) {
      return;
    }

    setProcessingIds(prev => prev.includes(requestId) ? prev : [...prev, requestId]);
    try {
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to cancel leave request`);
      }

      // Update the local state to reflect the cancelled status
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: 'cancelled' }
            : request
        )
      );

      // Show success toast notification
      showToast(`Leave request #${requestId} has been cancelled successfully.`, 'success');

    } catch (err: any) {
      console.error('Error cancelling leave request:', err);
      showToast(`Failed to cancel leave request: ${err.message || 'Unknown error'}`, 'danger');
    } finally {
      setProcessingIds(prev => prev.filter(id => id !== requestId));
    }
  };

  // Helper function to show toast notifications
  const showToast = (message: string, type: string) => {
    if (typeof window !== 'undefined' && (window as any).bootstrap) {
      const bgClass = type === 'success' ? 'text-bg-success' : 
                      type === 'warning' ? 'text-bg-warning' : 
                      'text-bg-danger';
      
      const toastHtml = `
        <div class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
          <div class="d-flex">
            <div class="toast-body">
              ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
        </div>
      `;
      
      const toastContainer = document.getElementById('toast-container') || (() => {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
        return container;
      })();
      
      toastContainer.insertAdjacentHTML('beforeend', toastHtml);
      const toastElement = toastContainer.lastElementChild as HTMLElement;
      const toast = new (window as any).bootstrap.Toast(toastElement);
      toast.show();
      
      toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
      });
    }
  };

  const columns: TableColumn<LeaveRequest>[] = [
    { key: 'user_name', header: 'Employee', render: (_v, row) => (
      <div>
        <div className="fw-semibold">{(row as any).user_name || (row as any).employee_name || String(row.user_id)}</div>
        <div className="text-muted small">ID: {row.user_id}</div>
      </div>
    ) },
    { 
      key: 'type', 
      header: 'Leave Type',
      render: (value) => getLeaveTypeBadge(value)
    },
    { 
      key: 'start_date', 
      header: 'Start Date',
      render: (value) => formatDate(value)
    },
    { 
      key: 'end_date', 
      header: 'End Date',
      render: (value) => formatDate(value)
    },
  { key: 'days', header: 'Days', render: (value, row) => computeDays(row.start_date, row.end_date, (row as any).days) },
    { 
      key: 'reason', 
      header: 'Reason',
      render: (value) => (
        <span title={value} className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
          {value}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (_value, row) => getStatusBadge(getDisplayStatus(row))
    },
    {
      key: 'actions' as keyof LeaveRequest,
      header: 'Actions',
      render: (_value: any, row: LeaveRequest) => {
  const isOwnRequest = currentUserId && String(row.user_id) === String(currentUserId);
  const isPending = getDisplayStatus(row) === 'pending';
        
        // Debug logging to help troubleshoot
        console.log('Action buttons debug:', {
          requestId: row.id,
          requestUserId: row.user_id,
          currentUserId: currentUserId,
          isOwnRequest,
          isPending,
          userComparison: `${row.user_id} === ${currentUserId}`
        });
        
        return (
          <div className="d-flex gap-1">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setSelectedLeave(row)}
                  title="View Details"
                >
                  <i className="bi bi-eye"></i>
                </button>
            
            {isPending && isOwnRequest && (
              // Dean can cancel their own pending requests
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={() => handleCancelRequest(row.id)}
                title="Cancel Request"
              >
                <i className="bi bi-x-circle"></i>
              </button>
            )}
            
            {isPending && !isOwnRequest && (
              // Dean can approve/reject faculty and staff requests (not their own)
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleApproveRequest(row.id)}
                  title="Approve Request"
                >
                  <i className="bi bi-check-circle"></i>
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRejectRequest(row.id)}
                  title="Reject Request"
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  // Render details modal for dean (approve/reject from modal)
  const renderDetailsModal = () => {
    if (!selectedLeave) return null;
    const s = selectedLeave;
    return (
      <div className="modal show d-block" tabIndex={-1}>
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Leave Request Details</h5>
              <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedLeave(null)}></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-6"><strong>Employee</strong><div>{s.user_name || (s as any).employee_name || String(s.user_id)}</div></div>
                <div className="col-6 mt-3"><strong>Type</strong><div>{s.type}</div></div>
                <div className="col-6 mt-3"><strong>Start Date</strong><div>{formatDate(s.start_date)}</div></div>
                <div className="col-6 mt-3"><strong>End Date</strong><div>{formatDate(s.end_date)}</div></div>
                <div className="col-12 mt-3"><strong>Days</strong><div>{s.days}</div></div>
                <div className="col-12 mt-3"><strong>Reason</strong><div>{s.reason}</div></div>
                <div className="col-12 mt-3"><strong>Status</strong><div>{getDisplayStatus(s)}</div></div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="me-auto">
                {(!s.status || s.status === 'pending') && String(s.user_id) !== String(currentUserId) && (
                  <>
                    <button className="btn btn-success me-2" onClick={() => { handleApproveRequest(s.id); setSelectedLeave(null); }}>Approve</button>
                    <button className="btn btn-danger me-2" onClick={() => { handleRejectRequest(s.id); setSelectedLeave(null); }}>Reject</button>
                  </>
                )}
              </div>
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedLeave(null)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Filter leave requests based on search and filter
  const filteredRequests = leaveRequests.filter(request => {
    const s = (search || '').toString();
    const lowerS = s.toLowerCase();
    const matchesSearch = 
      String(request.id).includes(s) ||
      (String(request.user_name || '')).toLowerCase().includes(lowerS) ||
      String(request.type || '').toLowerCase().includes(lowerS) ||
      String(request.reason || '').toLowerCase().includes(lowerS) ||
      getDisplayStatus(request).toLowerCase().includes(lowerS);
    
    const matchesFilter = 
      !filter || 
      getDisplayStatus(request).toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  if (error && leaveRequests.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="card-title mb-0">Department Leave Requests</h5>
            {departmentName && (
              <small className="text-muted">Showing requests from: {departmentName}</small>
            )}
          </div>
          <span className="badge bg-primary">{filteredRequests.length} requests</span>
        </div>
        
        <GlobalSearchFilter
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filters={statusOptions}
        />
        
        {filteredRequests.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="text-muted mt-2">No leave requests found</p>
          </div>
        ) : (
          <Table columns={columns} data={filteredRequests} />
        )}
      </div>
    </div>
    {renderDetailsModal()}
    </>
  );
}
