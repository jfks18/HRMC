"use client";
import React, { useEffect, useState } from 'react';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';
import CertificateStatusBadge from '../../components/CertificateStatusBadge';
import CertificateRequestForm from '../../components/CertificateRequestForm';

interface CertificateRequest {
  id: number;
  user_id: number;
  user_name?: string;
  certificate_type: string;
  purpose?: string;
  additional_details?: string;
  request_date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing' | string;
  approved_by?: number;
  approved_date?: string;
  rejection_reason?: string;
  certificate_file_path?: string;
  certificate_file_name?: string;
}

const baseColumns: TableColumn<CertificateRequest>[] = [
  { key: 'certificate_type', header: 'Certificate Type' },
  { key: 'purpose', header: 'Purpose' },
  { key: 'request_date', header: 'Request Date', render: (value: string) => new Date(value).toLocaleDateString() },
  { key: 'status', header: 'Status', render: (value: any, row: CertificateRequest) => (
    <div>
  <CertificateStatusBadge status={(row.status as any) as 'Pending' | 'Approved' | 'Rejected' | 'Processing'} />
      {row.status === 'Rejected' && row.rejection_reason && (
        <div className="text-muted small mt-1" title={row.rejection_reason}>
          <i className="bi bi-info-circle me-1"></i>
          Reason: {row.rejection_reason.length > 30 ? row.rejection_reason.substring(0, 30) + '...' : row.rejection_reason}
        </div>
      )}
      {row.status === 'Approved' && row.approved_date && (
        <div className="text-muted small mt-1">
          <i className="bi bi-calendar-check me-1"></i>
          Approved: {new Date(row.approved_date).toLocaleDateString()}
        </div>
      )}
    </div>
  ) }
];

export default function DeanCertificateTable() {
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const filters = ['Pending', 'Approved', 'Rejected', 'Processing'];

  useEffect(() => {
    fetchCertificateRequests();
  }, []);

  const fetchCertificateRequests = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) return setRequests([]);
      const { apiFetch } = await import('../../apiFetch');
      const response = await apiFetch(`/api/proxy/certificates/user/${userId}`, { headers: { 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        console.error('Failed to fetch dean certificate requests');
      }
    } catch (err) {
      console.error('Error fetching dean certificate requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (row: CertificateRequest) => {
    if (!row.certificate_file_path) return;
    try {
      const { apiFetch } = await import('../../apiFetch');
      const response = await apiFetch(`/api/proxy/certificates/${row.id}/download-binary`, { method: 'GET' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = row.certificate_file_name || 'certificate.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download certificate:', err);
      alert('Failed to download file. Please try again.');
    }
  };

  const handleRequestSuccess = () => {
    setShowRequestForm(false);
    fetchCertificateRequests();
  };

  const columns: TableColumn<CertificateRequest>[] = [
    ...baseColumns,
    {
      key: 'actions' as keyof CertificateRequest,
      header: 'Actions',
      render: (_value, row) => (
        <div className="d-flex gap-2">
          {row.status === 'Approved' && row.certificate_file_path && (
            <button className="btn btn-outline-primary btn-sm" onClick={() => handleDownload(row)}>
              <i className="bi bi-download me-1"></i>Download
            </button>
          )}
          {row.status === 'Pending' && (
            <span className="text-muted small"><i className="bi bi-clock me-1"></i>Waiting for approval</span>
          )}
        </div>
      )
    }
  ];

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      (request.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      request.certificate_type.toLowerCase().includes(search.toLowerCase()) ||
      (request.purpose || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? request.status === filter : true;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
          <p className="mt-2">Loading your certificate requests...</p>
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
              My Certificate Requests
            </h5>
            <div className="d-flex gap-2">
              <span className="badge bg-primary">{requests.length} Total</span>
              <button className="btn btn-primary" onClick={() => setShowRequestForm(true)}>
                <i className="bi bi-plus-circle me-2"></i>Request Certificate
              </button>
            </div>
          </div>

          <GlobalSearchFilter search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} filters={filters} />

          {filteredRequests.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-award display-1 text-muted mb-3"></i>
              <h6 className="text-muted">No certificate requests found</h6>
              <p className="text-muted">
                {requests.length === 0 ? "You haven't made any certificate requests yet." : 'No requests match your search or filter.'}
              </p>
              {requests.length === 0 && (
                <button className="btn btn-outline-primary" onClick={() => setShowRequestForm(true)}>
                  <i className="bi bi-plus-circle me-2"></i>Make Request
                </button>
              )}
            </div>
          ) : (
            <Table columns={columns} data={filteredRequests} />
          )}
        </div>
      </div>

      {/* Certificate Request Form */}
      <CertificateRequestForm isOpen={showRequestForm} onClose={() => setShowRequestForm(false)} onSuccess={handleRequestSuccess} />
    </>
  );
}
