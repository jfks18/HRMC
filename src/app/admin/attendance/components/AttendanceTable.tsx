"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../apiFetch';
import { Table, TableColumn } from '../../../components/Table';
import GlobalSearchFilter from '../../../components/GlobalSearchFilter';

interface AttendanceRecord {
  id: number;
  user_id: number;
  user_name?: string;
  time_in: string;
  time_out: string;
  status: string;
  late_minutes: number;
  date: string;
}

function formatTo12Hour(time: string) {
  if (!time) return '';
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
}

function formatDateToWords(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Manila',
  });
}

function getStatusBadge(status: string) {
  const statusClasses = {
    present: 'bg-success',
    absent: 'bg-danger', 
    late: 'bg-warning text-dark',
    'on leave': 'bg-info'
  };
  
  return (
    <span className={`badge ${statusClasses[status?.toLowerCase() as keyof typeof statusClasses] || 'bg-secondary'}`}>
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

const columns: TableColumn<AttendanceRecord>[] = [
  { key: 'user_name' as keyof AttendanceRecord, header: 'Employee', render: (_v, row) => (
    <div>
      <div className="fw-semibold">{row.user_name || String(row.user_id)}</div>
    </div>
  ) },
  { 
    key: 'date', 
    header: 'Date', 
    render: (value) => formatDateToWords(value) 
  },
  { 
    key: 'time_in', 
    header: 'Time In', 
    render: (value) => value ? formatTo12Hour(value) : 'N/A'
  },
  { 
    key: 'time_out', 
    header: 'Time Out', 
    render: (value) => value ? formatTo12Hour(value) : 'Not yet'
  },
  { 
    key: 'status', 
    header: 'Status',
    render: (value) => getStatusBadge(value)
  },
  { 
    key: 'late_minutes', 
    header: 'Late Minutes',
    render: (value) => value > 0 ? `${value} min` : '-'
  }
];

export default function AttendanceTable() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = ['All', 'Present', 'Absent', 'Late', 'On Leave'];

  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching attendance records');
        
        const response = await apiFetch('/api/proxy/attendance', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch attendance records`);
        }
        
        const data = await response.json();
        console.log('Fetched attendance records:', data);
        setRecords(data);
        setError('');
        
      } catch (err: any) {
        console.error('Error fetching attendance records:', err);
        setError(err.message || 'Failed to load attendance records');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAttendanceRecords();
  }, []);


  const filteredRecords = records.filter(record => {
    const s = (search || '').toString();
    const lowerS = s.toLowerCase();
    const matchesSearch =
      String(record.id).includes(s) ||
      String(record.user_id).includes(s) ||
      (String((record as any).user_name) || '').toLowerCase().includes(lowerS) ||
      String(record.date || '').toLowerCase().includes(lowerS) ||
      (String(record.status || '')).toLowerCase().includes(lowerS);
    
    const matchesFilter = 
      filter === 'All' || 
      !filter || 
      (record.status || '').toLowerCase() === filter.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
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
      <div className="card border-0 shadow-sm">
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
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0" style={{ color: '#1a237e' }}>All Attendance Records</h5>
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
          <Table
            columns={columns}
            data={filteredRecords}
          />
        )}
      </div>
    </div>
  );
}
