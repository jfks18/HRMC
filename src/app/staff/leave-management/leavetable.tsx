"use client";
import React, { useEffect, useMemo, useState } from 'react';
import GlobalModal, { GlobalModalField } from '../../components/GlobalModal';
import { apiFetch } from '../../apiFetch';
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
  is_approve?: number | null;
  days?: number | null;
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
    pending: 'bg-warning text-dark',
    approved: 'bg-success',
    rejected: 'bg-danger',
    disapprove: 'bg-danger',
    disapproved: 'bg-danger',
    cancelled: 'bg-secondary'
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
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<Array<{id: number, type: string, credits: number}>>([]);

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

  // Get user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
  }, []);

  // Fetch leave types from API
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await apiFetch('/api/proxy/leave_cred');
        if (response.ok) {
          const types = await response.json();
          setLeaveTypes(types);
        }
      } catch (error) {
        console.error('Error fetching leave types:', error);
        // Fallback to default types if API fails
        setLeaveTypes([
          { id: 1, type: 'sick', credits: 15 },
          { id: 2, type: 'vacation', credits: 15 },
          { id: 3, type: 'personal', credits: 5 },
          { id: 4, type: 'emergency', credits: 3 },
          { id: 5, type: 'maternity', credits: 90 },
          { id: 6, type: 'paternity', credits: 7 }
        ]);
      }
    };
    fetchLeaveTypes();
  }, []);

  // Fetch leave requests for the logged-in user
  useEffect(() => {
    if (!userId) return;

    const fetchLeaveRequests = async () => {
      setLoading(true);
      setError('');
      try {
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
        setLeaveRequests(data);
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

  // Auto-hide success toast
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // Render helper for leave details modal (safely narrow selectedLeave)
  const renderDetailsModal = () => {
    if (!selectedLeave) return null;
    const s = selectedLeave;
    // Approve / Disapprove handlers
    const handleApprove = async (approve: boolean) => {
      try {
        let response;
        if (approve) {
          response = await apiFetch(`/api/proxy/leave_request/${s.id}/approve`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_approve: 1 })
          });
        } else {
          response = await apiFetch(`/api/proxy/leave_request/${s.id}/disapprove`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: 'Failed' }));
          throw new Error(err.error || `HTTP ${response.status}`);
        }

        // update local state with numeric is_approve
        setLeaveRequests(prev => prev.map(r => r.id === s.id ? { ...r, is_approve: approve ? 1 : 0, status: approve ? 'approved' : 'disapproved' } : r));
        setSelectedLeave(null);
        setShowSuccessToast(true);
      } catch (err: any) {
        console.error('Error updating approval status:', err);
        alert(`Failed to update approval: ${err.message || 'Unknown error'}`);
      }
    };
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
                <div className="col-6"><strong>Type</strong><div>{s.type}</div></div>
                <div className="col-6 mt-3"><strong>Start Date</strong><div>{formatDate(s.start_date)}</div></div>
                <div className="col-6 mt-3"><strong>End Date</strong><div>{formatDate(s.end_date)}</div></div>
                <div className="col-12 mt-3"><strong>Reason</strong><div>{s.reason}</div></div>
                <div className="col-12 mt-3"><strong>Status</strong><div>{s.status || 'pending'}</div></div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedLeave(null)}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleLeaveSubmit = async (formData: Record<string, any>) => {
    try {
      if (!userId) {
        alert('User not logged in. Please login first.');
        return;
      }

      // Auto-calculate end date for maternity leave (105 days)
      let endDateValue = formData.end_date;
      if (formData.type === 'maternity' && formData.start_date) {
        const startDate = new Date(formData.start_date);
        const calculatedEndDate = new Date(startDate);
        calculatedEndDate.setDate(startDate.getDate() + 104); // 105 days total (start day + 104 additional days)
        endDateValue = calculatedEndDate.toISOString().split('T')[0];
      }

      // Validate dates: start and end must be present and end >= start
      const start = formData.start_date;
      const end = endDateValue;
      if (!start || !end) {
        alert('Please select both start and end dates for the leave.');
        return;
      }
      const s = new Date(start);
      const e = new Date(end);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) {
        alert('One of the selected dates is invalid. Please choose valid dates.');
        return;
      }
      if (e < s) {
        alert('End date cannot be earlier than start date. Please correct the dates.');
        return;
      }

      const leaveData = {
        user_id: userId,
        type: formData.type,
        start_date: formData.start_date,
        end_date: endDateValue, // Use calculated end date for maternity leave
        reason: formData.reason
      };

      const response = await apiFetch('/api/proxy/leave_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed' }));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to submit leave request`);
      }

      setShowLeaveModal(false);
      setShowSuccessToast(true);
      // Refresh the list
      setTimeout(() => {
        // re-fetch
        apiFetch(`/api/proxy/leave_request/user/${userId}`, { headers: { 'Content-Type': 'application/json' } })
          .then(r => r.ok ? r.json() : [])
          .then(d => setLeaveRequests(Array.isArray(d) ? d : []))
          .catch(() => {});
      }, 500);

    } catch (err: any) {
      console.error('Error submitting leave request:', err);
      alert(`Error submitting leave request: ${err.message || 'Unknown error'}`);
    }
  };

  // Handle cancel leave request
  const handleCancelRequest = async (requestId: number) => {
    if (!confirm(`Are you sure you want to cancel leave request #${requestId}?`)) return;
    try {
      const response = await apiFetch(`/api/proxy/leave_request/${requestId}/cancel`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to cancel leave request`);
      setLeaveRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'cancelled' } : r));
      // show toast
      setShowSuccessToast(true);
    } catch (err: any) {
      console.error('Error cancelling leave request:', err);
      alert(`Failed to cancel leave request: ${err.message || 'Unknown error'}`);
    }
  };

  const columns: TableColumn<LeaveRequest>[] = [
    { key: 'type', header: 'Leave Type', render: (value) => getLeaveTypeBadge(value) },
    { key: 'start_date', header: 'Start Date', render: (value) => formatDate(value) },
    { key: 'end_date', header: 'End Date', render: (value) => formatDate(value) },
  { key: 'days' as any, header: 'Days', render: (_v, row) => computeDays(row.start_date, row.end_date, (row as any).days) },
  { key: 'status', header: 'Status', render: (_value, row) => getStatusBadge(getDisplayStatus(row)) },
    { key: 'actions' as keyof LeaveRequest, header: 'Actions', render: (_value, row) => (
  <div className="d-flex gap-2">
  <button className="btn btn-sm btn-outline-primary" onClick={() => setSelectedLeave(row)} title="View Details"><i className="bi bi-eye"></i></button>
        {getDisplayStatus(row) === 'pending' && (
          <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelRequest(row.id)} title="Cancel Request"><i className="bi bi-x-circle"></i></button>
        )}
      </div>
    )}
  ];

  // Filter
  const filteredLeaveRequests = leaveRequests.filter(request => {
    const matchesSearch = request.type.toLowerCase().includes(search.toLowerCase()) || request.reason.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filter ? true : getDisplayStatus(request).toLowerCase() === filter.toLowerCase();
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

  return (<>
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">My Leave Requests</h5>
          <div className="d-flex align-items-center gap-2">
            <div className="text-muted small">Total: {leaveRequests.length} requests</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowLeaveModal(true)}><i className="bi bi-plus-circle me-1"></i> Leave Application</button>
          </div>
        </div>

        {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
            <div className="mt-2">Loading your leave requests...</div>
          </div>
        ) : (
          <>
            <GlobalSearchFilter search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} filters={statusOptions} />
            {filteredLeaveRequests.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <div className="mt-2 text-muted">{leaveRequests.length === 0 ? 'No leave requests found' : 'No requests match your search criteria'}</div>
              </div>
            ) : (
              <Table columns={columns} data={filteredLeaveRequests} />
            )}
          </>
        )}
      </div>

      {/* Leave Application Modal */}
      <GlobalModal
        show={showLeaveModal}
        title="Submit Leave Application"
        fields={[
          { key: 'type', label: 'Leave Type', type: 'select', options: leaveTypes.map(type => ({
            value: type.type,
            label: `${type.type.charAt(0).toUpperCase() + type.type.slice(1)} Leave (${type.credits} days)`
          }))},
          { key: 'start_date', label: 'Start Date', type: 'date' },
          { key: 'end_date', label: 'End Date (Auto-calculated for Maternity Leave)', type: 'date' },
          { key: 'reason', label: 'Reason', type: 'textarea' }
        ] as GlobalModalField[]}
        onClose={() => setShowLeaveModal(false)}
        onSubmit={handleLeaveSubmit}
        submitText="Submit Leave Request"
        cancelText="Cancel"
      />

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className="toast show" role="alert">
            <div className="toast-header bg-success text-white">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong className="me-auto">Success</strong>
              <button type="button" className="btn-close btn-close-white" onClick={() => setShowSuccessToast(false)}></button>
            </div>
            <div className="toast-body"><i className="bi bi-check-circle text-success me-2"></i>Leave request submitted successfully!</div>
          </div>
        </div>
      )}
    </div>

    {renderDetailsModal()}
  </>
  );
}
