"use client";
import React, { useEffect, useState } from 'react';
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

function getStatusBadge(status: string) {
  const statusClasses = {
    pending: 'bg-warning text-dark',      // Yellow with dark text
    approved: 'bg-success',               // Green  
    rejected: 'bg-danger',                // Red
    disapprove: 'bg-danger',              // Red (same as rejected)
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

  const filters = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

  // Get current user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId');
      console.log('Retrieved current user ID from localStorage:', userId);
      setCurrentUserId(userId);
    }
  }, []);

  // Fetch all leave requests for dean view
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching all leave requests for dean view');
        
        const { apiFetch } = await import('../../apiFetch');
        const response = await apiFetch('/api/proxy/leave_request', { headers: { 'Content-Type': 'application/json' } });
        
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

  // Handle approve leave request
  const handleApproveRequest = async (requestId: number) => {
    if (!confirm(`Are you sure you want to approve leave request #${requestId}?`)) {
      return;
    }

    try {
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/approve`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to approve leave request`);
      }

      // Update the local state to reflect the approved status
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: 'approved' }
            : request
        )
      );

      // Show success toast notification
      showToast(`Leave request #${requestId} has been approved successfully.`, 'success');

    } catch (err: any) {
      console.error('Error approving leave request:', err);
      showToast(`Failed to approve leave request: ${err.message || 'Unknown error'}`, 'danger');
    }
  };

  // Handle reject leave request
  const handleRejectRequest = async (requestId: number) => {
    if (!confirm(`Are you sure you want to reject leave request #${requestId}?`)) {
      return;
    }

    try {
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/reject`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to reject leave request`);
      }

      // Update the local state to reflect the rejected status
      setLeaveRequests(prevRequests => 
        prevRequests.map(request => 
          request.id === requestId 
            ? { ...request, status: 'rejected' }
            : request
        )
      );

      // Show success toast notification
      showToast(`Leave request #${requestId} has been rejected.`, 'warning');

    } catch (err: any) {
      console.error('Error rejecting leave request:', err);
      showToast(`Failed to reject leave request: ${err.message || 'Unknown error'}`, 'danger');
    }
  };

  // Handle cancel leave request (only for dean's own requests)
  const handleCancelRequest = async (requestId: number) => {
    if (!confirm(`Are you sure you want to cancel leave request #${requestId}?`)) {
      return;
    }

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
    { key: 'id', header: 'Request ID' },
    { key: 'user_name', header: 'Employee' },
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
    { key: 'days', header: 'Days' },
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
      render: (value) => getStatusBadge(value)
    },
    {
      key: 'actions' as keyof LeaveRequest,
      header: 'Actions',
      render: (_value: any, row: LeaveRequest) => {
        const isOwnRequest = currentUserId && row.user_id.toString() === currentUserId.toString();
        const isPending = !row.status || row.status === 'pending';
        
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
              onClick={() => {
                alert(`View details for leave request #${row.id}`);
                // You can implement a view details modal here
              }}
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

  // Filter leave requests based on search and filter
  const filteredRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.id.toString().includes(search.toLowerCase()) ||
      (request.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      request.type.toLowerCase().includes(search.toLowerCase()) ||
      request.reason.toLowerCase().includes(search.toLowerCase()) ||
      (request.status || 'pending').toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === 'All' || 
      !filter || 
      (request.status || 'pending').toLowerCase() === filter.toLowerCase();
    
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
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">All Leave Requests</h5>
          <span className="badge bg-primary">{filteredRequests.length} requests</span>
        </div>
        
        <GlobalSearchFilter
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filters={filters}
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
  );
}
