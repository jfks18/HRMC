"use client";
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../../apiFetch';
import CertificateStatusBadge from '../../../components/CertificateStatusBadge';
import CertificateUploadModal from './CertificateUploadModal';
import CertificateRequestForm from '../../../components/CertificateRequestForm';

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

export default function CertificatesTable({ onStatsChange }: { onStatsChange?: (stats: { total: number; approved: number; pending: number; thisMonth: number }) => void }) {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CertificateRequest | null>(null);

  useEffect(() => {
    fetchCertificateRequests();
  }, []);

  // Listen for page-level requests to open the create modal
  useEffect(() => {
    const handler = () => setCreateModalOpen(true);
    window.addEventListener('openCertificateCreate', handler as EventListener);
    return () => window.removeEventListener('openCertificateCreate', handler as EventListener);
  }, []);

  const fetchCertificateRequests = async () => {
    try {
      const response = await apiFetch('/api/proxy/certificates');
      
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

  // Emit stats to parent whenever requests change
  useEffect(() => {
    if (!onStatsChange) return;
    const total = requests.length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const pending = requests.filter(r => r.status === 'Pending' || r.status === 'Processing' || r.status === null).length;
    const now = new Date();
    const thisMonth = requests.filter(r => {
      const d = new Date(r.request_date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    onStatsChange({ total, approved, pending, thisMonth });
  }, [requests, onStatsChange]);

  const handleApprove = (request: CertificateRequest) => {
    setSelectedRequest(request);
    setUploadModalOpen(true);
  };

  const handleReject = async (request: CertificateRequest) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      // Use your existing API endpoint pattern
      const response = await apiFetch(`/api/proxy/certificates/${request.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rejection_reason: reason,
          rejected_by: localStorage.getItem('userId')
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to reject request' }));
        throw new Error(errorData.error || 'Failed to reject request');
      }

      const event = new CustomEvent('showToast', {
        detail: { 
          message: 'Certificate request rejected successfully.',
          type: 'success'
        }
      });
      window.dispatchEvent(event);
      fetchCertificateRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      const event = new CustomEvent('showToast', {
        detail: { 
          message: error instanceof Error ? error.message : 'Failed to reject certificate request.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    }
  };

  const handleUploadSuccess = () => {
    fetchCertificateRequests();
  };

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
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
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold mb-0" style={{ color: '#1a237e' }}>
              <i className="bi bi-award me-2"></i>
              Certificate Requests
            </h5>
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setCreateModalOpen(true)}
                title="Create Certificate Request"
              >
                <i className="bi bi-plus-circle me-1"></i>
                New Request
              </button>
              <span className="badge bg-primary">{requests.length} Total</span>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted mb-3"></i>
              <h6 className="text-muted">No certificate requests found</h6>
              <p className="text-muted">All certificate requests will appear here.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Certificate Type</th>
                    <th>Purpose</th>
                    <th>Request Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="fw-semibold">{request.user_name}</div>
                        <div className="text-muted small">ID: {request.user_id}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">{request.certificate_type}</div>
                        {request.additional_details && (
                          <div className="text-muted small">{request.additional_details}</div>
                        )}
                      </td>
                      <td>{request.purpose}</td>
                      <td>
                        <div>{new Date(request.request_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div className="text-muted small">
                          {new Date(request.request_date).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <CertificateStatusBadge status={request.status} />
                        {request.status === 'Rejected' && request.rejection_reason && (
                          <div className="text-muted small mt-1" title={request.rejection_reason}>
                            <i className="bi bi-info-circle me-1"></i>
                            {request.rejection_reason.length > 30 
                              ? request.rejection_reason.substring(0, 30) + '...'
                              : request.rejection_reason
                            }
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2 align-items-center flex-wrap">
                          {request.status === 'Pending' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleApprove(request)}
                                title="Approve & Upload Certificate"
                              >
                                <i className="bi bi-check-circle me-1"></i>
                                Approve
                              </button>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleReject(request)}
                                title="Reject Request"
                              >
                                <i className="bi bi-x-circle me-1"></i>
                                Reject
                              </button>
                            </>
                          )}
                          
                          {request.status === 'Approved' && request.certificate_file_path && (
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={async () => {
                                console.log('🔍 Download Debug Info:');
                                console.log('Certificate Request ID:', request.id);
                                console.log('File Name:', request.certificate_file_name);
                                console.log('File Path:', request.certificate_file_path);
                                
                                const downloadUrl = `/api/proxy/certificates/${request.id}/download-binary`;
                                console.log('Download URL:', downloadUrl);
                                
                                try {
                                  console.log('📡 Starting fetch request...');
                                  const response = await apiFetch(downloadUrl, { method: 'GET' });
                                  
                                  console.log('📡 Response Status:', response.status);
                                  console.log('📡 Response Status Text:', response.statusText);
                                  console.log('📡 Response OK:', response.ok);
                                  console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));
                                  
                                  if (!response.ok) {
                                    const errorText = await response.text();
                                    console.error('❌ Response Error Body:', errorText);
                                    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
                                  }
                                  
                                  console.log('📦 Creating blob from response...');
                                  const blob = await response.blob();
                                  console.log('📦 Blob Size:', blob.size);
                                  console.log('📦 Blob Type:', blob.type);
                                  
                                  if (blob.size === 0) {
                                    console.error('❌ Blob is empty!');
                                    alert('Downloaded file is empty. Please check if the file exists on the server.');
                                    return;
                                  }
                                  
                                  console.log('🔗 Creating object URL...');
                                  const url = window.URL.createObjectURL(blob);
                                  console.log('🔗 Object URL:', url);
                                  
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = request.certificate_file_name || 'certificate.pdf';
                                  link.style.display = 'none';
                                  
                                  console.log('🔗 Link element created:', {
                                    href: link.href,
                                    download: link.download
                                  });
                                  
                                  document.body.appendChild(link);
                                  console.log('🖱️ Triggering click...');
                                  link.click();
                                  
                                  console.log('✅ Download initiated successfully');
                                  
                                  // Cleanup with delay to ensure download starts
                                  setTimeout(() => {
                                    document.body.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                    console.log('🧹 Cleanup completed');
                                  }, 1000);
                                  
                                } catch (error) {
                                  console.error('❌ Download error:', error);
                                  if (error instanceof Error) {
                                    console.error('❌ Error stack:', error.stack);
                                    alert(`Failed to download file: ${error.message}`);
                                  } else {
                                    alert('Failed to download file. Please try again.');
                                  }
                                }
                              }}
                              title="Download Certificate"
                            >
                              <i className="bi bi-download me-1"></i>
                              Download
                            </button>
                          )}

                          {request.status === 'Processing' && (
                            <span className="text-muted small">
                              <i className="bi bi-gear-fill me-1"></i>
                              Processing...
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <CertificateUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedRequest(null);
        }}
        certificateRequest={selectedRequest}
        onSuccess={handleUploadSuccess}
      />

      <CertificateRequestForm
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchCertificateRequests();
        }}
      />
    </>
  );
}
