"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';
import EvaluationDataViewer from './components/EvaluationDataViewer';

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

export default function FacultyEvaluationTable() {
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [teacherNames, setTeacherNames] = useState<Record<string, string>>({});
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | number | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  
  
  // Define columns using useMemo to ensure proper scope
  const columns = useMemo((): TableColumn<EvaluationRecord>[] => [
    { key: 'id', header: 'Evaluation ID' },
    {
      key: 'teacher_id',
      header: 'Teacher Name',
      render: (value) => teacherNames[value] || value
    },
    { key: 'expires_at', header: 'Expires At', render: (value) => formatDateToWords(value) },
    { key: 'password', header: 'Password' },
    {
      key: 'actions' as keyof EvaluationRecord,
      header: 'Actions',
      render: (_value, row) => {
        const handleViewData = () => {
          // Only allow opening the viewer for evaluations owned by the logged-in user
          if (String(row.teacher_id) !== String(userId)) {
            console.warn('Attempt to view evaluation not owned by current user:', row.teacher_id, userId);
            return;
          }
          setSelectedEvaluationId(row.id);
          setSelectedTeacherId(row.teacher_id);
        };

        const handleCopyPassword = () => {
          navigator.clipboard.writeText(row.password);
        };

        return (
          <div className="d-flex gap-2">
            <button 
              className="btn btn-sm btn-primary" 
              onClick={handleViewData}
            >
              <i className="bi bi-eye me-1"></i>
              View Data
            </button>
            <button 
              className="btn btn-sm btn-success" 
              onClick={handleCopyPassword}
            >
              <i className="bi bi-clipboard me-1"></i>
              Copy Password
            </button>
          </div>
        );
      }
    }
  ], [setSelectedEvaluationId, setSelectedTeacherId, teacherNames]);
  
  // Filter options based on evaluation status
  const filters = ['Active', 'Expired'];

  // Get user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      console.log('Retrieved user ID from localStorage:', storedUserId);
      setUserId(storedUserId);
    }
  }, []);

  // Fetch evaluations for the logged-in user and teacher names
  useEffect(() => {
    if (!userId) return;

    const fetchEvaluations = async () => {
      setLoading(true);
      setError('');

      try {
        const { apiFetch } = await import('../../apiFetch');
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
    // Filter server response to only include evaluations that belong to this logged-in teacher
    const onlyMine = Array.isArray(data) ? data.filter((rec: EvaluationRecord) => String(rec.teacher_id) === String(userId)) : [];
    setRecords(onlyMine);

    // Fetch teacher names for all unique teacher_ids (use filtered set)
  const uniqueTeacherIds: string[] = Array.from(new Set((onlyMine).map((rec: EvaluationRecord) => rec.teacher_id)));
        const names: Record<string, string> = {};
        await Promise.all(uniqueTeacherIds.map(async (tid: string) => {
          try {
            const res = await apiFetch(`/api/proxy/users/${tid}/name`, { headers: { 'Content-Type': 'application/json' } });
            if (res.ok) {
              const teacher = await res.json();
              names[tid] = teacher.name || tid;
            } else {
              names[tid] = tid;
            }
          } catch {
            names[tid] = tid;
          }
        }));
        setTeacherNames(names);

        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to load evaluations');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [userId]);

  const handleCloseViewer = () => {
    setSelectedEvaluationId(null);
    setSelectedTeacherId(null);
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.id.toString().includes(search) ||
      (teacherNames[record.teacher_id] || record.teacher_id).toLowerCase().includes(search.toLowerCase()) ||
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
    <>
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Faculty Evaluations</h5>
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

      {/* Evaluation Data Viewer Modal */}
      {selectedEvaluationId && selectedTeacherId && (
        <>
          {console.log('🔥 Rendering EvaluationDataViewer with:', { id: selectedEvaluationId, teacherId: selectedTeacherId })}
          <EvaluationDataViewer
            evaluationId={selectedEvaluationId}
            teacherId={selectedTeacherId}
            onClose={handleCloseViewer}
          />
        </>
      )}
      {console.log('🔥 Current selected state:', { selectedEvaluationId, selectedTeacherId })}
    </>
  );
}
