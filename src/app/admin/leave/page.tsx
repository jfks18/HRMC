"use client";
import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../../components/SideNav';
import LeaveTable from './components/LeaveTable';
import LeaveSummaryCard from '../../components/LeaveSummaryCard';
import GlobalModal, { GlobalModalField } from '../../components/GlobalModal';

export default function LeavePage() {
  const [showModal, setShowModal] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<Array<{id: number, type: string, credits: number}>>([]);

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

  const leaveFields: GlobalModalField[] = [
    { 
      key: 'type', 
      label: 'Leave Type', 
      type: 'select', 
      options: leaveTypes.map(type => ({
        value: type.type,
        label: `${type.type.charAt(0).toUpperCase() + type.type.slice(1)} Leave (${type.credits})`
      }))
    },
    { 
      key: 'start_date', 
      label: 'Start Date', 
      type: 'date'
    },
    { 
      key: 'end_date', 
      label: 'End Date (Auto-calculated for Maternity Leave)', 
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

      // Auto-calculate end date for maternity leave (105 days)
      let endDateValue = formData.end_date;
      if (formData.type === 'maternity' && formData.start_date) {
        const startDate = new Date(formData.start_date);
        const calculatedEndDate = new Date(startDate);
        calculatedEndDate.setDate(startDate.getDate() + 104); // 105 days total (start day + 104 additional days)
        endDateValue = calculatedEndDate.toISOString().split('T')[0];
      }

      // Calculate days between start and end date
      const startDate = new Date(formData.start_date);
      const endDate = new Date(endDateValue);
      if (!formData.start_date || !endDateValue) {
        throw new Error('Please select both start and end dates.');
      }
      if (endDate < startDate) {
        throw new Error('End date cannot be earlier than start date.');
      }
      const timeDifference = endDate.getTime() - startDate.getTime();
      const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24)) + 1;

      // Import apiFetch only when needed
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

      // Build payload
      const leaveData = {
        user_id: userId,
        type: formData.type,
        start_date: formData.start_date,
        end_date: endDateValue, // Use calculated end date for maternity leave
        days: daysDifference,
        reason: formData.reason
      };

      // Submit request
      const response = await apiFetch('/api/proxy/leave_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leaveData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to submit leave request`);
      }

      // On success: close modal and refresh to reflect new entry
      setShowModal(false);
      window.location.reload();

    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      throw error; // Let GlobalModal show the error toast
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