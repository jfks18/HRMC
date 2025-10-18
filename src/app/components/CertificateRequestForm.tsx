import React, { useState } from 'react';
import { apiFetch } from '../apiFetch';
import GlobalModal, { GlobalModalField } from './GlobalModal';

interface CertificateRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const certificateTypes = [
  { value: 'Certificate of Employment', label: 'Certificate of Employment' },
  { value: 'Service Record', label: 'Service Record' },
  { value: 'Performance Certificate', label: 'Performance Certificate' },
  { value: 'Salary Certificate', label: 'Salary Certificate' },
  { value: 'Training Certificate', label: 'Training Certificate' },
  { value: 'Good Standing Certificate', label: 'Good Standing Certificate' },
];

export default function CertificateRequestForm({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CertificateRequestFormProps) {
  
  const fields: GlobalModalField[] = [
    {
      key: 'certificate_type',
      label: 'Certificate Type',
      type: 'select',
      options: certificateTypes,
    },
    {
      key: 'purpose',
      label: 'Purpose/Reason',
      type: 'text',
    },
    {
      key: 'additional_details',
      label: 'Additional Details (Optional)',
      type: 'text',
    },
  ];

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

      // Remove existing toasts
      const existingContainer = document.querySelector('.toast-container');
      if (existingContainer) {
        existingContainer.remove();
      }

      // Create toast container
      const toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
      toastContainer.innerHTML = toastHtml;
      document.body.appendChild(toastContainer);

      // Show toast
      const toastElement = toastContainer.querySelector('.toast');
      if (toastElement) {
        const toast = new (window as any).bootstrap.Toast(toastElement);
        toast.show();

        // Auto-remove after showing
        setTimeout(() => {
          if (toastContainer && toastContainer.parentNode) {
            toastContainer.parentNode.removeChild(toastContainer);
          }
        }, 5000);
      }
    }
  };

  const handleSubmit = async (formData: Record<string, any>) => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not logged in');
      }

      // Use your existing API endpoint pattern
      const response = await apiFetch('/api/proxy/certificates/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          user_id: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit certificate request');
      }

      // Show success message
      showToast('Certificate request submitted successfully!', 'success');
      
      // Call success callback and close modal
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error submitting certificate request:', error);
      showToast(error instanceof Error ? error.message : 'Failed to submit certificate request. Please try again.', 'danger');
    }
  };

  return (
    <GlobalModal
      show={isOpen}
      title="Request Certificate"
      fields={fields}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText="Submit Request"
      cancelText="Cancel"
    />
  );
}
