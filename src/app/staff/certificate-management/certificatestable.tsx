"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';
import CertificateStatusBadge from '../../components/CertificateStatusBadge';
import CertificateRequestForm from '../../components/CertificateRequestForm';
import CertificateUploadModal from '../../admin/certificates/components/CertificateUploadModal';

interface CertificateRequest {
  id: number;
  user_id: number;
  user_name: string;
  certificate_type: string;
  purpose: string;
  additional_details?: string;
  request_date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing';
  approved_by?: number;
  approved_date?: string;
  rejection_reason?: string;
  certificate_file_path?: string;
  certificate_file_name?: string;
}

const baseColumns: TableColumn<CertificateRequest>[] = [
  { key: 'user_name', header: 'Employee' },
  { key: 'certificate_type', header: 'Certificate Type' },
  { key: 'purpose', header: 'Purpose' },
  { 
    key: 'request_date', 
    header: 'Request Date',
    render: (value: string) => new Date(value).toLocaleDateString()
  },
  {
    key: 'status',
    header: 'Status',
    render: (value: any, row: CertificateRequest) => (
      <div>
        <CertificateStatusBadge status={row.status} />
        {row.status === 'Rejected' && row.rejection_reason && (
          <div className="text-muted small mt-1" title={row.rejection_reason}>
            <i className="bi bi-info-circle me-1"></i>
            Reason: {row.rejection_reason.length > 30 
              ? row.rejection_reason.substring(0, 30) + '...'
              : row.rejection_reason
            }
          </div>
        )}
        {row.status === 'Approved' && row.approved_date && (
          <div className="text-muted small mt-1">
            <i className="bi bi-calendar-check me-1"></i>
            Approved: {new Date(row.approved_date).toLocaleDateString()}
          </div>
        )}
      </div>
    )
  },
];

export default function CertificatesTable() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);
  
  const filters = ['Pending', 'Approved', 'Rejected', 'Processing'];

  useEffect(() => {
    fetchCertificateRequests();
  }, []);

  const fetchCertificateRequests = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');
      
      // If HR role, show all staff certificate requests, otherwise show only own requests
      const endpoint = userRole === 'HR' 
        ? '/api/proxy/certificates/staff'
        : `/api/proxy/certificates/user/${userId}`;
      const { apiFetch } = await import('../../apiFetch');
      const response = await apiFetch(endpoint, { headers: { 'Content-Type': 'application/json' } });
      
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error('Failed to fetch certificate requests');
      }
    } catch (error) {
      console.error('Error fetching certificate requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request: CertificateRequest) => {
    setSelectedRequest(request);
    setUploadModalOpen(true);
  };

  const handleReject = async (request: CertificateRequest) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const { apiFetch } = await import('../../apiFetch');
      const response = await apiFetch(`/api/proxy/certificates/${request.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: reason, rejected_by: localStorage.getItem('userId') })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to reject request' }));
        throw new Error(errorData.error || 'Failed to reject request');
      }

      showToast('Certificate request rejected successfully.', 'success');
      fetchCertificateRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast(error instanceof Error ? error.message : 'Failed to reject certificate request.', 'danger');
    }
  };

  const handleRequestSuccess = () => {
    showToast('Certificate request submitted successfully! You will be notified when it is processed.', 'success');
    setShowRequestForm(false);
    fetchCertificateRequests();
  };

  const handleUploadSuccess = () => {
    fetchCertificateRequests();
  };

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

      const existingContainer = document.querySelector('.toast-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      const toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.innerHTML = toastHtml;
      document.body.appendChild(toastContainer);

      const toastElement = toastContainer.querySelector('.toast');
      if (toastElement) {
        const toast = new (window as any).bootstrap.Toast(toastElement);
        toast.show();

        setTimeout(() => {
          if (toastContainer && toastContainer.parentNode) {
            toastContainer.parentNode.removeChild(toastContainer);
          }
        }, 5000);
      }
    }
  };

  const userRole = localStorage.getItem('userRole');

  const columns: TableColumn<CertificateRequest>[] = [
    ...baseColumns,
    {
      key: 'actions' as keyof CertificateRequest,
      header: 'Actions',
      render: (_value: any, row: CertificateRequest) => (
        <div className="d-flex gap-2 align-items-center flex-wrap">
          {/* HR can approve/reject pending requests */}
          {userRole === 'HR' && row.status === 'Pending' && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleApprove(row)}
                title="Approve & Upload Certificate"
              >
                <i className="bi bi-check-circle me-1"></i>
                Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleReject(row)}
                title="Reject Request"
              >
                <i className="bi bi-x-circle me-1"></i>
                Reject
              </button>
            </>
          )}
          
          {/* Download button for approved certificates */}
          {row.status === 'Approved' && row.certificate_file_path && (
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={async () => {
                console.log('🔍 Download Debug Info:');
                console.log('Certificate Request ID:', row.id);
                console.log('File Name:', row.certificate_file_name);
                console.log('File Path:', row.certificate_file_path);
                
                const downloadUrl = `/api/proxy/certificates/${row.id}/download-binary`;
                console.log('Download URL:', downloadUrl);
                
                try {
                  const { apiFetch } = await import('../../apiFetch');
                  const response = await apiFetch(downloadUrl, { method: 'GET' });
                  
                  console.log('📡 Response Status:', response.status);
                  console.log('📡 Response OK:', response.ok);
                  
                  if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Response Error:', errorText);
                    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                  }
                  
                  const blob = await response.blob();
                  console.log('📦 Blob Size:', blob.size);
                  console.log('📦 Blob Type:', blob.type);
                  
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = row.certificate_file_name || 'certificate.pdf';
                  document.body.appendChild(link);
                  link.click();
                  
                  console.log('✅ Download initiated successfully');
                  
                  document.body.removeChild(link);
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('❌ Download error:', error);
                  alert('Failed to download file. Please try again.');
                }
              }}
              title="Download Certificate"
            >
              <i className="bi bi-download me-1"></i>
              Download
            </button>
          )}

          {/* Status indicators */}
          {row.status === 'Pending' && userRole !== 'HR' && (
            <span className="text-muted small">
              <i className="bi bi-clock me-1"></i>
              Waiting for approval
            </span>
          )}
          
          {row.status === 'Processing' && (
            <span className="text-info small">
              <i className="bi bi-gear-fill me-1"></i>
              Being processed
            </span>
          )}
        </div>
      )
    }
  ];

  // Filter requests based on search and filter
  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.user_name.toLowerCase().includes(search.toLowerCase()) ||
      request.certificate_type.toLowerCase().includes(search.toLowerCase()) ||
      request.purpose.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? request.status === filter : true;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading certificate requests...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0" style={{ color: '#1a237e' }}>
              <i className="bi bi-award me-2"></i>
              {userRole === 'HR' ? 'Staff Certificate Requests' : 'My Certificate Requests'}
            </h5>
            <div className="d-flex gap-2">
              <span className="badge bg-primary">{requests.length} Total</span>
              {userRole !== 'HR' && (
                <button
                  className="btn btn-primary"
                  onClick={() => setShowRequestForm(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Request Certificate
                </button>
              )}
            </div>
          </div>

          <GlobalSearchFilter
            search={search}
            setSearch={setSearch}
            filter={filter}
            setFilter={setFilter}
            filters={filters}
          />

          {filteredRequests.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-award display-1 text-muted mb-3"></i>
              <h6 className="text-muted">No certificate requests found</h6>
              <p className="text-muted">
                {requests.length === 0 
                  ? userRole === 'HR' 
                    ? "No staff certificate requests yet."
                    : "You haven't made any certificate requests yet."
                  : "No requests match your current search or filter criteria."
                }
              </p>
              {requests.length === 0 && userRole !== 'HR' && (
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowRequestForm(true)}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Make Your First Request
                </button>
              )}
            </div>
          ) : (
            <Table columns={columns} data={filteredRequests} />
          )}
        </div>
      </div>

      {/* Certificate Request Form for non-HR staff */}
      {userRole !== 'HR' && (
        <CertificateRequestForm
          isOpen={showRequestForm}
          onClose={() => setShowRequestForm(false)}
          onSuccess={handleRequestSuccess}
        />
      )}

      {/* Certificate Upload Modal for HR */}
      {userRole === 'HR' && (
        <CertificateUploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedRequest(null);
          }}
          certificateRequest={selectedRequest}
          onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
}
