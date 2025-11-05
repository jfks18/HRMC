import React, { useState } from 'react';
import { apiFetch } from '../apiFetch';
import GlobalModal, { GlobalModalField } from './GlobalModal';
import { showSuccessToast, showErrorToast } from '../utils/toast';

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
      showSuccessToast('Certificate request submitted successfully!', 'Request Submitted');
      
      // Call success callback and close modal
      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error submitting certificate request:', error);
      showErrorToast(error instanceof Error ? error.message : 'Failed to submit certificate request. Please try again.', 'Submission Failed');
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
