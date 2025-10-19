"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../apiFetch';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';

interface AttendanceRecord {
  id?: number;
  user_id: number | string;
  time_in?: string;
  time_out?: string;
  status?: string;
  late_minutes?: number;
  date?: string;
}

function formatTo12Hour(time?: string) {
  if (!time) return '';
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

function formatDateToWords(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getStatusBadge(status?: string) {
  const statusClasses: Record<string, string> = {
    present: 'bg-success',
    absent: 'bg-danger',
    late: 'bg-warning text-dark',
    'on leave': 'bg-info'
  };
  return (
    <span className={`badge ${statusClasses[status?.toLowerCase() || ''] || 'bg-secondary'}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
}

const columns: TableColumn<AttendanceRecord>[] = [
  { key: 'user_name' as keyof AttendanceRecord, header: 'Name' },
  { key: 'date', header: 'Date', render: (value) => formatDateToWords(value) },
  { key: 'time_in', header: 'Time In', render: (value) => value ? formatTo12Hour(value) : 'N/A' },
  { key: 'time_out', header: 'Time Out', render: (value) => value ? formatTo12Hour(value) : 'Not yet' },
  { key: 'status', header: 'Status', render: (value) => getStatusBadge(value) },
  { key: 'late_minutes', header: 'Late Minutes', render: (value) => value && value > 0 ? `${value} min` : '-' }
];

export default function AttendanceTable() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = ['All', 'Present', 'Absent', 'Late', 'On Leave'];

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) {
      setRecords([]);
      setLoading(false);
      setError('User not logged in');
      return;
    }

    const fetchAttendance = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiFetch('/api/proxy/attendance', { headers: { 'Content-Type': 'application/json' } });
        if (!response.ok) throw new Error(`HTTP ${response.status}: Failed to fetch attendance`);
        const data = await response.json();
        // Filter to logged-in user's records
        const userRecords = data.filter((r: AttendanceRecord) => String(r.user_id) === String(userId));
        setRecords(userRecords);

        // backend now provides user_name in attendance rows
      } catch (err: any) {
        console.error('Error fetching attendance data:', err);
        setError(err.message || 'Failed to load attendance');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      (record.date || '').toLowerCase().includes(search.toLowerCase()) ||
      (record.status || '').toLowerCase().includes(search.toLowerCase()) ||
      (String(record.user_id) || '').includes(search) ||
      (String((record as any).user_name) || '').toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      !filter || filter === 'All' || (record.status || '').toLowerCase() === filter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading attendance records...</p>
        </div>
      </div>
    );
  }

  if (error && records.length === 0) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="alert alert-warning" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">My Attendance</h5>
          <span className="badge bg-primary">{filteredRecords.length} records</span>
        </div>

        <GlobalSearchFilter
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filters={filters}
        />

        {filteredRecords.length === 0 ? (
          <div className="text-center py-4">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="text-muted mt-2">No attendance records found</p>
          </div>
        ) : (
          <Table columns={columns} data={filteredRecords} />
        )}
      </div>
    </div>
  );
}
