 "use client";
import React, { useEffect, useState } from 'react';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';

interface LeaveRequest {
  id: number;
  user_id: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status?: string;
  created_at?: string;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
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
  const [userId, setUserId] = useState<string | null>(null);

  const filters = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

  // Get user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      console.log('Retrieved user ID from localStorage:', storedUserId);
      setUserId(storedUserId);
    }
  }, []);

  // Fetch leave requests for the logged-in user
  useEffect(() => {
    if (!userId) return;
    
    const fetchLeaveRequests = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching leave requests for user ID:', userId);
        
        const { apiFetch } = await import('../../apiFetch');
        const response = await apiFetch(`/api/proxy/leave_request/user/${userId}`, { headers: { 'Content-Type': 'application/json' } });
        
        if (!response.ok) {
          if (response.status === 404) {
            setLeaveRequests([]);
            setError('No leave requests found for your account');
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
  }, [userId]);

  // Handle cancel leave request
  const handleCancelRequest = async (requestId: number) => {
    if (!confirm(`Are you sure you want to cancel leave request #${requestId}?`)) {
      return;
    }

    try {
      const { apiFetch } = await import('../../apiFetch');
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/cancel`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });

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
      if (typeof window !== 'undefined' && (window as any).bootstrap) {
        const toastHtml = `
          <div class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">
                Leave request #${requestId} has been cancelled successfully.
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

    } catch (err: any) {
      console.error('Error cancelling leave request:', err);
      
      // Show error toast notification
      if (typeof window !== 'undefined' && (window as any).bootstrap) {
        const toastHtml = `
          <div class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">
                Failed to cancel leave request: ${err.message || 'Unknown error'}
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
    }
  };

  const columns: TableColumn<LeaveRequest>[] = [
    { key: 'id', header: 'Request ID' },
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
    { 
      key: 'reason', 
      header: 'Reason',
      render: (value) => (
        <div style={{ maxWidth: '200px' }}>
          {value?.length > 50 ? `${value.substring(0, 50)}...` : value}
        </div>
      )
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (value) => getStatusBadge(value || 'pending')
    },
    {
      key: 'actions' as keyof LeaveRequest,
      header: 'Actions',
      render: (_value, row) => (
        <div className="d-flex gap-2">
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
          {(!row.status || row.status === 'pending') && (
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleCancelRequest(row.id)}
              title="Cancel Request"
            >
              <i className="bi bi-x-circle"></i>
            </button>
          )}
        </div>
      )
    }
  ];

  // Filter leave requests based on search and filter
  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesSearch = 
      request.type.toLowerCase().includes(search.toLowerCase()) ||
      request.reason.toLowerCase().includes(search.toLowerCase()) ||
      request.id.toString().includes(search);
    
    const matchesFilter = 
      filter === 'All' || !filter ? true : 
      (request.status || 'pending').toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  if (!userId) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            User not logged in. Please login to view your leave requests.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">My Leave Requests</h5>
          <div className="text-muted small">
            Total: {leaveRequests.length} requests
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Loading your leave requests...</div>
          </div>
        ) : (
          <>
            <GlobalSearchFilter
              search={search}
              setSearch={setSearch}
              filter={filter}
              setFilter={setFilter}
              filters={filters}
            />
            
            {filteredLeaveRequests.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <div className="mt-2 text-muted">
                  {leaveRequests.length === 0 ? 'No leave requests found' : 'No requests match your search criteria'}
                </div>
              </div>
            ) : (
              <Table columns={columns} data={filteredLeaveRequests} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
