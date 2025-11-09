"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Table, TableColumn } from '../../../components/Table';
import GlobalSearchFilter from '../../../components/GlobalSearchFilter';

interface LeaveRequest {
  id: number;
  user_id: number;
  employee_name?: string;
  type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: string;
  is_approve: number | null; // Add this field to match database
  created_at: string;
}

// Helper function to get real status based on is_approve field
function getRealStatus(is_approve: number | null): string {
  if (is_approve === null) return 'pending';
  if (is_approve === 0) return 'disapproved';
  if (is_approve === 1) return 'approved';
  return 'pending'; // fallback
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
  // Use UTC to avoid timezone shifts
  const diff = Math.floor((Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()) - Date.UTC(s.getFullYear(), s.getMonth(), s.getDate())) / msPerDay) + 1;
  return diff >= 0 ? diff : (typeof fallback === 'number' ? fallback : '-');
}

function getStatusBadge(status: string) {
  const statusClasses = {
    pending: 'bg-warning text-dark',      // Yellow with dark text
    approved: 'bg-success',               // Green  
    rejected: 'bg-danger',                // Red (legacy mapping)
    disapprove: 'bg-danger',              // Red (legacy mapping)
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

  // Derive display status for a row: prefer textual status if present (e.g., cancelled),
  // else compute from is_approve
  const getDisplayStatus = (row: Pick<LeaveRequest, 'status' | 'is_approve'>): string => {
    const s = String(row.status || '').toLowerCase();
    if (s) return s;
    return getRealStatus(row.is_approve);
  };

  // Build the status options from the actual data so the dropdown reflects the table
  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of leaveRequests) {
      set.add(getDisplayStatus(r));
    }
    // Normalize legacy terms
    if (set.has('rejected')) {
      set.delete('rejected');
      set.add('disapproved');
    }
    // Return sorted for stable UI
    return Array.from(set).sort();
  }, [leaveRequests]);

  // Get current user ID from localStorage (HR user)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      console.log('Retrieved current HR user ID from localStorage:', userId);
      setCurrentUserId(userId);
    }
  }, []);

  // Fetch all leave requests for HR view
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching all leave requests for HR view');
        
        const { apiFetch } = await import('../../../apiFetch');
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
        console.log('Fetched leave requests:', data);
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

  // Handle approve leave request (HR can approve all including dean requests)
  const handleApproveRequest = async (requestId: number) => {
    const req = leaveRequests.find(r => r.id === requestId);
    let details = `Are you sure you want to approve leave request #${requestId}?`;
    if (req) {
      details += `\n\nEmployee: ${req.employee_name ? req.employee_name : 'Unknown'}`;
      details += `\nType: ${req.type}`;
      details += `\nDates: ${formatDate(req.start_date)} to ${formatDate(req.end_date)}`;
      details += `\nDays: ${req.days}`;
      details += `\nReason: ${req.reason}`;
    }
    if (!confirm(details)) {
      return;
    }

    try {
      console.log('🔍 Approving request ID:', requestId);
      
      const { apiFetch } = await import('../../../apiFetch');
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approve: 1 })
      });

      console.log('📡 API Response Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to approve leave request`);
      }

      const result = await response.json();
      console.log('✅ API Success Response:', result);

      // Instead of just updating local state, refresh the data from server
      console.log('🔄 Refreshing data from server...');
      
      // Re-fetch the updated data from the API
      const refreshResponse = await apiFetch('/api/proxy/leave_request', { headers: { 'Content-Type': 'application/json' } });
      
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        console.log('🔄 Refreshed data:', refreshedData);
        setLeaveRequests(refreshedData);
      } else {
        // Fallback to manual state update if refresh fails
        setLeaveRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId 
              ? { ...request, status: 'approved', is_approve: 1 }
              : request
          )
        );
      }

      // Show success toast notification
      showToast(`Leave request #${requestId} has been approved successfully.`, 'success');

    } catch (err: any) {
      console.error('❌ Error approving leave request:', err);
      showToast(`Failed to approve leave request: ${err.message || 'Unknown error'}`, 'danger');
    }
  };

  // Handle reject leave request (HR can reject all including dean requests)
  const handleRejectRequest = async (requestId: number) => {
    if (!confirm(`Are you sure you want to reject leave request #${requestId}?`)) {
      return;
    }

    try {
      console.log('🔍 Rejecting request ID:', requestId);
      
      const { apiFetch } = await import('../../../apiFetch');
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/disapprove`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('📡 API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ API Error Response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to reject leave request`);
      }

      const result = await response.json();
      console.log('✅ API Success Response:', result);

      // Re-fetch the updated data from the API
      console.log('🔄 Refreshing data from server...');
      
      const refreshResponse = await apiFetch('/api/proxy/leave_request', { headers: { 'Content-Type': 'application/json' } });
      
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        console.log('🔄 Refreshed data:', refreshedData);
        setLeaveRequests(refreshedData);
      } else {
        // Fallback to manual state update if refresh fails
        setLeaveRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId 
              ? { ...request, status: 'disapproved', is_approve: 0 }
              : request
          )
        );
      }

      // Show success toast notification
      showToast(`Leave request #${requestId} has been rejected.`, 'warning');

    } catch (err: any) {
      console.error('❌ Error rejecting leave request:', err);
      showToast(`Failed to reject leave request: ${err.message || 'Unknown error'}`, 'danger');
    }
  };

  // Handle cancel leave request (users can cancel their own requests)
  const handleCancelRequest = async (requestId: number) => {
    if (!confirm(`Are you sure you want to cancel leave request #${requestId}?`)) {
      return;
    }

    try {
      const { apiFetch } = await import('../../../apiFetch');
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
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
    { key: 'employee_name', header: 'Employee' },
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
  { key: 'days', header: 'Days', render: (_value: any, row: LeaveRequest) => computeDays(row.start_date, row.end_date, row.days as any) },
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
      render: (value: any, row: LeaveRequest) => {
        const display = getDisplayStatus(row);
        return getStatusBadge(display);
      }
    },
    {
      key: 'actions' as keyof LeaveRequest,
      header: 'Actions',
      render: (_value: any, row: LeaveRequest) => {
  const isOwnRequest = currentUserId && String(row.user_id) === String(currentUserId);
  const display = getDisplayStatus(row);
  const isPending = display === 'pending';
        
        return (
          <div className="d-flex gap-1">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => setSelectedLeave(row)}
              title="View Details"
            >
              <i className="bi bi-eye"></i>
            </button>
            {isPending && (
              // HR can approve/reject pending requests (admins do not cancel others)
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

  // Render details modal for admin
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
                <div className="col-6"><strong>Employee</strong><div>{s.employee_name || String(s.user_id)}</div></div>
                <div className="col-6 mt-3"><strong>Type</strong><div>{s.type}</div></div>
                <div className="col-6 mt-3"><strong>Start Date</strong><div>{formatDate(s.start_date)}</div></div>
                <div className="col-6 mt-3"><strong>End Date</strong><div>{formatDate(s.end_date)}</div></div>
                <div className="col-12 mt-3"><strong>Days</strong><div>{s.days}</div></div>
                <div className="col-12 mt-3"><strong>Reason</strong><div>{s.reason}</div></div>
                <div className="col-12 mt-3"><strong>Status</strong><div>{getRealStatus(s.is_approve)}</div></div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="me-auto">
                {getRealStatus(s.is_approve) === 'pending' && (
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
    const displayStatus = getDisplayStatus(request);
    
    const s = (search || '').toString();
    const lowerS = s.toLowerCase();
    const matchesSearch = 
      String(request.id).includes(s) ||
      (String(request.employee_name || '')).toLowerCase().includes(lowerS) ||
      String(request.type || '').toLowerCase().includes(lowerS) ||
      String(request.reason || '').toLowerCase().includes(lowerS) ||
      displayStatus.toLowerCase().includes(lowerS);
    
    const matchesFilter = 
      !filter || 
      displayStatus.toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
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
      <div className="card border-0 shadow-sm">
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
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: '#1a237e' }}>All Leave Requests</h5>
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
