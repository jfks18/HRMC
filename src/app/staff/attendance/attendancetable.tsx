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
  { key: 'date', header: 'Date', render: (value) => formatDateToWords(value) },
  { key: 'time_in', header: 'Time In', render: (value) => formatTo12Hour(value) },
  { key: 'time_out', header: 'Time Out', render: (value) => formatTo12Hour(value) },
  { key: 'status', header: 'Status' },
  { key: 'late_minutes', header: 'Late Minutes' },
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
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const filters = ['Present', 'Absent', 'Late', 'On Leave'];

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      apiFetch('/api/proxy/attendance')
        .then(res => res.json())
        .then(data => {
          // Filter records to show only the logged-in user's attendance
          const userRecords = data.filter((record: AttendanceRecord) => 
            record.user_id.toString() === userId
          );
          setRecords(userRecords);
        })
        .catch(error => {
          console.error('Error fetching attendance data:', error);
          setRecords([]);
        });
    }
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.date.toLowerCase().includes(search.toLowerCase()) ||
      record.status.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? record.status === filter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="card">
      <div className="card-body">
        <GlobalSearchFilter
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filters={filters}
        />
        <Table columns={columns} data={filteredRecords} />
      </div>
    </div>
  );
}
