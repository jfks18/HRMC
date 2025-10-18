import React, { useState } from 'react';
import { apiFetch } from '../../../apiFetch';
import FileUpload from '../../../components/FileUpload';

interface CertificateUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificateRequest: {
    id: number;
    user_name: string;
    certificate_type: string;
    purpose: string;
    request_date: string;
  } | null;
  onSuccess: () => void;
}

export default function CertificateUploadModal({ 
  isOpen, 
  onClose, 
  certificateRequest, 
  onSuccess 
}: CertificateUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !certificateRequest) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('certificate_file', selectedFile);
      formData.append('notes', notes);
      formData.append('approved_by', localStorage.getItem('userId') || '');

      // Use proxy endpoint so Authorization header is attached by apiFetch
      const response = await apiFetch(`/api/proxy/certificates/${certificateRequest.id}/upload`, {
        method: 'POST',
        // No Content-Type header for FormData
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Upload failed');
      }

      // Show success message using your existing toast pattern
      const event = new CustomEvent('showToast', {
        detail: { 
          message: 'Certificate uploaded and approved successfully!',
          type: 'success'
        }
      });
      window.dispatchEvent(event);

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Upload error:', error);
      const event = new CustomEvent('showToast', {
        detail: { 
          message: error instanceof Error ? error.message : 'Failed to upload certificate. Please try again.',
          type: 'error'
        }
      });
      window.dispatchEvent(event);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setNotes('');
    onClose();
  };

  if (!isOpen || !certificateRequest) return null;

  return (
    <div className="modal show d-block" tabIndex={-1}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              <i className="bi bi-cloud-upload me-2"></i>
              Upload Certificate
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              disabled={uploading}
            ></button>
          </div>
          
          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6 className="card-title text-primary mb-3">Request Details</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <strong>Employee:</strong> {certificateRequest.user_name}
                      </div>
                      <div className="col-md-6">
                        <strong>Certificate Type:</strong> {certificateRequest.certificate_type}
                      </div>
                      <div className="col-md-6 mt-2">
                        <strong>Purpose:</strong> {certificateRequest.purpose}
                      </div>
                      <div className="col-md-6 mt-2">
                        <strong>Request Date:</strong> {new Date(certificateRequest.request_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">
                <i className="bi bi-file-earmark-arrow-up me-2"></i>
                Upload Certificate File
              </label>
              <FileUpload
                onFileSelect={handleFileSelect}
                accept=".pdf,.doc,.docx"
                maxSizeMB={10}
                disabled={uploading}
              />
              {selectedFile && (
                <div className="alert alert-success mt-2 py-2">
                  <i className="bi bi-check-circle me-2"></i>
                  Selected: <strong>{selectedFile.name}</strong> 
                  ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>

            <div className="mb-4">
              <label htmlFor="notes" className="form-label fw-semibold">
                <i className="bi bi-chat-text me-2"></i>
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                className="form-control"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this certificate..."
                disabled={uploading}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <i className="bi bi-cloud-upload me-2"></i>
                  Upload & Approve
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
