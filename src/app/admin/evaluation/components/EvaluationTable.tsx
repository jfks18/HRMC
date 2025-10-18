import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../apiFetch';
import EvaluationDataViewer from './EvaluationDataViewer';

function renderStars(count: number) {
  return (
    <span>
      {[1,2,3,4,5].map(i => (
        <i key={i} className={`bi bi-star${i <= count ? '-fill text-warning' : ''}`}></i>
      ))}
    </span>
  );
}

function formatDateToWords(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });
  const day = date.getDate();
  const year = date.getFullYear();
  let hour = date.getHours();
  const ampm = hour >= 12 ? 'pm' : 'am';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${weekday}, ${month} ${day}, ${year} ${hour}${ampm}`;
}

export default function EvaluationTable({ filters }: { filters?: { query?: string; department?: string; status?: string } }) {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvaluation, setSelectedEvaluation] = useState<{
    id: string | number;
    teacherId: string;
    studentId: string;
  } | null>(null);

  useEffect(() => {
    apiFetch('/api/proxy/evaluation')
      .then(res => res.json())
      .then(data => {
        console.log('Evaluations data received:', data);
        setEvaluations(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load evaluations');
        setLoading(false);
      });
  }, []);

  // Apply client-side filtering
  const filteredEvaluations = evaluations.filter(ev => {
    if (!filters) return true;
    const { query, department, status } = filters;
    if (query) {
      const q = String(query).toLowerCase();
      const teacherId = String(ev.teacher_id || '').toLowerCase();
      const studentId = String(ev.student_id || '').toLowerCase();
      const teacherName = String(ev.teacher_name || '').toLowerCase();
      if (!(teacherId.includes(q) || studentId.includes(q) || teacherName.includes(q))) return false;
    }
    if (department) {
      // if evaluation has department_id, compare; otherwise skip
      if (ev.department_id && String(ev.department_id) !== String(department)) return false;
    }
    if (status) {
      if (String(ev.status) !== String(status)) return false;
    }
    return true;
  });

  const handleViewData = (evaluationId: string | number, teacherId: string, studentId: string) => {
    console.log('View Data clicked:', { evaluationId, teacherId, studentId });
    
    setSelectedEvaluation({
      id: evaluationId,
      teacherId,
      studentId: studentId || '' // Ensure studentId is never undefined
    });
  };

  const handleCloseViewer = () => {
    setSelectedEvaluation(null);
  };

  return (
    <>
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <h5 className="fw-bold mb-3" style={{ color: '#1a237e' }}>Evaluation Records</h5>
          {loading && <div>Loading...</div>}
          {error && <div style={{ color: '#e53935', fontWeight: 700 }}>{error}</div>}
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Teacher ID</th>
                  <th>Student ID</th>
                  <th>Expires At</th>
                  <th>Password</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvaluations.map(ev => (
                  <tr key={ev.id || `${ev.teacher_id}-${ev.created_at}`}>
                    <td>{ev.teacher_id}</td>
                    <td>{ev.student_id}</td>
                    <td>{formatDateToWords(ev.expires_at)}</td>
                    <td>{ev.password}</td>
                    <td>
                      <span className={`badge ${ev.status === 'active' ? 'bg-success' : ev.status === 'expired' ? 'bg-danger' : 'bg-secondary'}`}>
                        {ev.status}
                      </span>
                    </td>
                    <td>{formatDateToWords(ev.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleViewData(ev.id, ev.teacher_id, ev.student_id)}
                        style={{
                          backgroundColor: '#1976d2',
                          borderColor: '#1976d2',
                          fontSize: '0.85rem',
                          padding: '0.375rem 0.75rem'
                        }}
                      >
                        <i className="bi bi-eye me-1"></i>
                        View Data
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Evaluation Data Viewer Modal */}
      {selectedEvaluation && (
        <EvaluationDataViewer
          evaluationId={selectedEvaluation.id}
          teacherId={selectedEvaluation.teacherId}
          studentId={selectedEvaluation.studentId}
          onClose={handleCloseViewer}
        />
      )}
    </>
  );
}
