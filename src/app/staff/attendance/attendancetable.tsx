"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../apiFetch';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';

interface AttendanceRecord {
  user_id: number;
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
  });
}

const columns: TableColumn<AttendanceRecord>[] = [
  { key: 'user_name' as keyof AttendanceRecord, header: 'Name' },
  { key: 'date', header: 'Date', render: (value) => formatDateToWords(value) },
  { key: 'time_in', header: 'Time In', render: (value) => formatTo12Hour(value) },
  { key: 'time_out', header: 'Time Out', render: (value) => formatTo12Hour(value) },
  { key: 'status', header: 'Status', render: (value) => {
    const cls = (value || '').toLowerCase();
    const badge = cls === 'present' ? 'bg-success' : cls === 'absent' ? 'bg-danger' : cls === 'late' ? 'bg-warning text-dark' : 'bg-secondary';
    return <span className={`badge ${badge}`}>{value || '-'}</span>;
  } },
  {
    key: 'actions' as keyof AttendanceRecord,
    header: 'Actions',
    render: (_value, row) => (
      <div className="d-flex gap-2">
        <button className="btn btn-sm btn-warning" onClick={() => alert(`Edit attendance for ${row.date}`)}>Edit</button>
        <button className="btn btn-sm btn-danger" onClick={() => alert(`Delete attendance for ${row.date}`)}>Delete</button>
      </div>
    )
  }
];

export default function AttendanceTable() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [usersMap, setUsersMap] = useState<Record<string,string>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const filters = ['Present', 'Absent', 'Late', 'On Leave'];

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) return;

    setLoading(true);
    apiFetch('/api/proxy/attendance')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const userRecords = data.filter((record: AttendanceRecord) => String(record.user_id) === String(userId));
        setRecords(userRecords);
        setError('');
        // fetch users for name mapping
        (async () => {
          try {
            const res = await apiFetch('/api/proxy/users', { headers: { 'Content-Type': 'application/json' } });
            if (!res.ok) return;
            const udata = await res.json();
            const map: Record<string,string> = {};
            udata.forEach((u: any) => {
              map[String(u.id)] = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || String(u.id);
            });
            setUsersMap(map);
          } catch (e) {}
        })();
      })
      .catch(error => {
        console.error('Error fetching attendance data:', error);
        setError(error.message || 'Failed to load attendance');
        setRecords([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = (record.date || '').toLowerCase().includes(search.toLowerCase()) ||
      (record.status || '').toLowerCase().includes(search.toLowerCase()) ||
      (usersMap[String(record.user_id)] || '').toLowerCase().includes(search.toLowerCase());
    const matchesFilter = !filter || (record.status === filter);
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
