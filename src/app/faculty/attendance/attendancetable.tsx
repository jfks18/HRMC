"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../apiFetch';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';

interface EvaluationRecord {
  id: number;
  teacher_id: string;
  expires_at: string;
  password: string;
}

function formatDateToWords(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

const columns: TableColumn<EvaluationRecord>[] = [
  { key: 'id', header: 'Evaluation ID' },
  { key: 'teacher_id', header: 'Teacher ID' },
  { key: 'expires_at', header: 'Expires At', render: (value) => formatDateToWords(value) },
  { key: 'password', header: 'Password' },
  {
    key: 'actions' as keyof EvaluationRecord,
    header: 'Actions',
    render: (_value, row) => (
      <div className="d-flex gap-2">
        <button 
          className="btn btn-sm btn-primary" 
          onClick={() => {
            // You can add view evaluation logic here
            console.log('View evaluation:', row.id);
          }}
        >
          View Details
        </button>
        <button 
          className="btn btn-sm btn-success" 
          onClick={() => {
            // Copy password to clipboard
            navigator.clipboard.writeText(row.password);
            alert('Password copied to clipboard!');
          }}
        >
          Copy Password
        </button>
      </div>
    )
  }
];

export default function AttendanceTable() {
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  
  // You can add filters based on your evaluation data
  const filters = ['Active', 'Expired'];

  // Get user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      console.log('Retrieved user ID from localStorage:', storedUserId);
      setUserId(storedUserId);
    }
  }, []);

  // Fetch evaluations for the logged-in user
  useEffect(() => {
    if (!userId) return;
    
    const fetchEvaluations = async () => {
      setLoading(true);
      setError('');
      
      try {
        console.log('Fetching evaluations for user ID:', userId);
        
        const response = await apiFetch(`/api/proxy/evaluation/user/${userId}`, { headers: { 'Content-Type': 'application/json' } });
        
        if (!response.ok) {
          if (response.status === 404) {
            setRecords([]);
            setError('No evaluations found for your account');
            return;
          }
          throw new Error(`HTTP ${response.status}: Failed to fetch evaluations`);
        }
        
        const data = await response.json();
        console.log('Fetched evaluations:', data);
        setRecords(data);
        setError('');
        
      } catch (err: any) {
        console.error('Error fetching evaluations:', err);
        setError(err.message || 'Failed to load evaluations');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvaluations();
  }, [userId]);

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.id.toString().includes(search) ||
      record.teacher_id.toLowerCase().includes(search.toLowerCase()) ||
      record.password.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = filter ? 
      (filter === 'Active' ? new Date(record.expires_at) > new Date() : 
       filter === 'Expired' ? new Date(record.expires_at) <= new Date() : true) : true;
    
    return matchesSearch && matchesFilter;
  });

  if (!userId) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="alert alert-warning">
            <i className="bi bi-exclamation-triangle me-2"></i>
            User not logged in. Please login to view your evaluations.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">My Evaluations</h5>
          <div className="text-muted small">
            User ID: {userId}
          </div>
        </div>
        
        {error && (
          <div className="alert alert-danger">
            <i className="bi bi-exclamation-circle me-2"></i>
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-2">Loading your evaluations...</div>
          </div>
        ) : (
          <>
            <GlobalSearchFilter
              search={search}
              setSearch={setSearch}
              filter={filter}
              setFilter={setFilter}
              filters={filters}
            />
            
            {filteredRecords.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                <div className="mt-2 text-muted">
                  {records.length === 0 ? 'No evaluations found' : 'No evaluations match your search criteria'}
                </div>
              </div>
            ) : (
              <Table columns={columns} data={filteredRecords} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
