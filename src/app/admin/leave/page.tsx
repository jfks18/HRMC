"use client";
import React, { useState } from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../../components/SideNav';
import LeaveTable from './components/LeaveTable';
import LeaveSummaryCard from '../../components/LeaveSummaryCard';
import GlobalModal, { GlobalModalField } from '../../components/GlobalModal';

export default function LeavePage() {
  const [showModal, setShowModal] = useState(false);

  const leaveFields: GlobalModalField[] = [
    { 
      key: 'type', 
      label: 'Leave Type', 
      type: 'select', 
      options: [
        { value: 'sick', label: 'Sick Leave' },
        { value: 'vacation', label: 'Vacation' },
        { value: 'personal', label: 'Personal Leave' },
        { value: 'emergency', label: 'Emergency Leave' },
        { value: 'maternity', label: 'Maternity Leave' },
        { value: 'paternity', label: 'Paternity Leave' }
      ]
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

  const handleLeaveSubmit = async (formData: any) => {
    try {
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
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

      // Import apiFetch once at the top
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

        const toastHtml = `
          <div class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">
                Your leave request has been submitted successfully!
              </div>
      // Close modal and refresh the page to show new request
      setShowModal(false);
      window.location.reload();

    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      
      // Show error toast
      if (typeof window !== 'undefined' && (window as any).bootstrap) {
        const toastHtml = `
          <div class="toast align-items-center text-bg-danger border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body">
                Failed to submit leave request: ${error.message}
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
      
      throw error; // Re-throw to be handled by GlobalModal
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
              <div className="text-muted">Manage all employee leave requests and approvals (including dean requests)</div>
            </div>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Leave Application
            </button>
          </div>
          
          <div className="row mb-4">
            <div className="col-12">
              <LeaveSummaryCard />
            </div>
          </div>
          
          <LeaveTable />

          <GlobalModal
            show={showModal}
            title="Submit Leave Request"
            fields={leaveFields}
            onClose={() => setShowModal(false)}
            onSubmit={handleLeaveSubmit}
            submitText="Submit Request"
            cancelText="Cancel"
            successMessage="Leave request submitted successfully!"
            errorMessage="Failed to submit leave request"
          />
        </main>
      </div>
    </div>
  );
}