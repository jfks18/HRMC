"use client";
import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../components/SideNav';
import LeaveTable from './leavetable';
import LeaveCreditCard from '../../components/LeaveCreditCard';
import GlobalModal, { GlobalModalField } from '../../components/GlobalModal';

export default function FacultyLeaveManagementPage() {
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<Array<{id: number, type: string, credits: number}>>([]);

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
        const { apiFetch } = await import('../../apiFetch');
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

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // Define the leave application form fields based on the API
  const leaveFields: GlobalModalField[] = [
    {
      key: 'type',
      label: 'Leave Type',
      type: 'select',
      options: leaveTypes.map(type => ({
        value: type.type,
        label: `${type.type.charAt(0).toUpperCase() + type.type.slice(1)} Leave (${type.credits} days)`
      }))
    },
    {
      key: 'start_date',
      label: 'Start Date',
      type: 'date'
    },
    {
      key: 'end_date',
      label: 'End Date',
      type: 'date'
    },
    {
      key: 'reason',
      label: 'Reason',
      type: 'textarea'
    }
  ];

  const handleLeaveSubmit = async (formData: Record<string, any>) => {
    try {
      if (!userId) {
        throw new Error('User not logged in. Please login first.');
      }

      // Calculate days between start and end date
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      if (!formData.start_date || !formData.end_date) {
        throw new Error('Please select both start and end dates.');
      }
      if (endDate < startDate) {
        throw new Error('End date cannot be earlier than start date.');
      }
      const timeDifference = endDate.getTime() - startDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

      const { apiFetch } = await import('../../apiFetch');
      
      // Validate leave balance before submission
      const balanceResponse = await apiFetch(`/api/proxy/leave_balance/${userId}`);
      
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        const leaveType = balanceData.leave_balance?.find((lb: any) => lb.type === formData.type);
        
        if (leaveType && leaveType.remaining_days < daysDifference) {
          throw new Error(`Insufficient ${formData.type} leave balance. You have ${leaveType.remaining_days} days remaining, but requested ${daysDifference} days.`);
        }
      }

      const leaveData = {
        user_id: userId,
        type: formData.type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason
      };

      console.log('Submitting leave request:', leaveData);

      const response = await apiFetch('/api/proxy/leave_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to submit leave request`);
      }

      const result = await response.json();
      console.log('Leave request submitted successfully:', result);
      
  // Close modal and show success toast
      setShowLeaveModal(false);
  setShowSuccessToast(true);
      
      // Optionally refresh the leave table here
      window.location.reload();

    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      // Let GlobalModal show the toast via errorMessage
      throw error;
    }
  };

  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fw-bold mb-1" style={{ color: '#1a237e' }}>Leave Management</h1>
              <div className="text-muted">View and manage your leave requests</div>
            </div>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowLeaveModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Leave Application
            </button>
          </div>
          
          <div className="row mb-4">
            <div className="col-md-4">
              <LeaveCreditCard userId={userId || undefined} />
            </div>
          </div>
          
          {/* Add leave search/filter and table here */}
          <LeaveTable/>
        </main>
      </div>

      {/* Leave Application Modal */}
      <GlobalModal
        show={showLeaveModal}
        title="Submit Leave Application"
        fields={leaveFields}
        onClose={() => setShowLeaveModal(false)}
        onSubmit={handleLeaveSubmit}
        submitText="Submit Leave Request"
        cancelText="Cancel"
        successMessage="Leave request submitted successfully!"
        errorMessage="Failed to submit leave request"
      />

      {/* Success Toast Notification (legacy UI fade-out) */}
      {showSuccessToast && (
        <div 
          className="toast-container position-fixed top-0 end-0 p-3"
          style={{ zIndex: 9999 }}
        >
          <div className="toast show" role="alert">
            <div className="toast-header bg-success text-white">
              <i className="bi bi-check-circle-fill me-2"></i>
              <strong className="me-auto">Success</strong>
              <button 
                type="button" 
                className="btn-close btn-close-white" 
                onClick={() => setShowSuccessToast(false)}
              ></button>
            </div>
            <div className="toast-body">
              <i className="bi bi-check-circle text-success me-2"></i>
              Leave request submitted successfully!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
