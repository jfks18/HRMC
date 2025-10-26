"use client";
import React, { useState, useEffect } from 'react';

interface EvaluationAnswer {
  id: number;
  question_id: number;
  question_text: string;
  rating: number;
  student_id: string;
}

interface QuestionSummary {
  question_id: number;
  question_text: string;
  average_rating: number | null; // can be null from API
  total_responses: number;
  ratings_breakdown?: { [rating: number]: number } | null;
}

interface EvaluationData {
  evaluation_id: string | number;
  teacher_id: string;
  teacher_name?: string;
  created_at: string;
  expires_at: string;
  status: string;
  questions: QuestionSummary[];
  total_students: number;
  overall_average: number | null; // can be null from API
}

interface EvaluationDataViewerProps {
  evaluationId: string | number;
  teacherId: string;
  studentId?: string; // Make this optional since we're showing aggregate data
  onClose: () => void;
}

function renderStars(rating: number) {
  return (
    <div className="d-flex align-items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <i 
          key={i} 
          className={`bi bi-star${i <= rating ? '-fill text-warning' : ' text-muted'}`}
          style={{ fontSize: '1.1rem' }}
        />
      ))}
      <span className="ms-2 fw-bold text-primary">{rating}/5</span>
    </div>
  );
}

function calculateAverageRating(questions: QuestionSummary[]): number {
  if (!questions || questions.length === 0) return 0;
  const nums = questions.map(q => Number(q.average_rating ?? 0));
  const sum = nums.reduce((total, n) => total + (Number.isFinite(n) ? n : 0), 0);
  const avg = nums.length ? sum / nums.length : 0;
  return parseFloat(avg.toFixed(1));
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function EvaluationDataViewer({ 
  evaluationId, 
  teacherId, 
  studentId,
  onClose 
}: EvaluationDataViewerProps) {
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [comments, setComments] = useState<Array<{ id: number; student_id: string; question_id: number; remarks: string }>>([]);

  useEffect(() => {
    fetchEvaluationData();
  }, [evaluationId]);

  const fetchEvaluationData = async () => {
    setLoading(true);
    setError("");
    
    try {
      console.log(`Fetching evaluation data for ID: ${evaluationId}`);
      
      // Check if required parameters are available
      if (!evaluationId) {
        throw new Error('Evaluation ID is required');
      }
      
      // Use the new API endpoint that gets all answers for an evaluation and calculates averages
      const apiUrl = `/api/proxy/evaluation/${evaluationId}/summary`;
      console.log('API URL:', apiUrl);
      const { apiFetch } = await import('../../../apiFetch');
      // Fetch evaluation summary with question averages
      const response = await apiFetch(apiUrl, { headers: { 'Content-Type': 'application/json' } });
      
      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Evaluation not found or no responses available');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch evaluation data`);
      }
      
      const data = await response.json();
      console.log('Fetched evaluation data:', data);
      
      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      if (!data.questions || !Array.isArray(data.questions)) {
        throw new Error('No evaluation questions found');
      }
      
      setEvaluationData(data);
    } catch (err: any) {
      console.error('Error fetching evaluation data:', err);
      setError(err.message || 'Failed to load evaluation data');
    } finally {
      setLoading(false);
    }
  };

  const openComments = async () => {
    setCommentsLoading(true);
    setCommentsError("");
    setShowComments(true);
    try {
      const { apiFetch } = await import('../../../apiFetch');
      const res = await apiFetch(`/api/proxy/evaluation_answers/${evaluationId}`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to fetch comments' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const rows = await res.json();
      const filtered = (Array.isArray(rows) ? rows : [])
        .filter((r: any) => [21,22,23].includes(Number(r.question_id)) && typeof r.remarks === 'string' && r.remarks.trim() !== '')
        .map((r: any) => ({ id: r.id, student_id: String(r.student_id), question_id: Number(r.question_id), remarks: String(r.remarks) }));
      setComments(filtered);
    } catch (err: any) {
      setCommentsError(err.message || 'Failed to load comments');
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-3">Loading evaluation data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title text-danger">Error</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center py-5">
              <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '3rem' }}></i>
              <div className="mt-3 text-danger fw-bold">{error}</div>
              <button className="btn btn-primary mt-3" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!evaluationData || !evaluationData.questions) {
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">No Data Found</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
              <div className="mt-3 text-muted">No evaluation responses found for this record.</div>
              <button className="btn btn-primary mt-3" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Exclude free-text Comments question (ID 21) from rated display/averages
  const questionsForDisplay = (evaluationData.questions || []).filter(q => q.question_id !== 21);
  const averageRating = Number(
    (evaluationData.overall_average ?? calculateAverageRating(questionsForDisplay))
  );

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header" style={{ background: 'linear-gradient(90deg, #1976d2 0%, #90caf9 100%)' }}>
            <div>
              <h5 className="modal-title text-white fw-bold mb-1">Evaluation Data Viewer</h5>
              <div className="text-white-50">
                {evaluationData.teacher_name ? (
                  <>Teacher: {evaluationData.teacher_name} (ID: {teacherId})</>
                ) : (
                  <>Teacher ID: {teacherId}</>
                )} | Total Students: {evaluationData.total_students}
              </div>
            </div>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onClose}
            ></button>
          </div>

          {/* Summary Section */}
          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center">
                    <h6 className="text-muted mb-2">Overall Rating</h6>
                    <div className="display-4 fw-bold text-primary mb-2">{averageRating}</div>
                    {renderStars(Math.round(averageRating))}
                    <div className="text-muted mt-2">Based on {evaluationData.total_students} student{evaluationData.total_students !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body">
                    <h6 className="text-muted mb-3">Evaluation Details</h6>
                    <div className="row g-2">
                      <div className="col-12">
                        <small className="text-muted">Evaluation ID:</small>
                        <div className="fw-medium">{evaluationData.evaluation_id}</div>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Status:</small>
                        <div>
                          <span className={`badge ${evaluationData.status === 'active' ? 'bg-success' : evaluationData.status === 'expired' ? 'bg-danger' : 'bg-secondary'}`}>
                            {evaluationData.status}
                          </span>
                        </div>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Submitted:</small>
                        <div className="fw-medium">{formatDate(evaluationData.created_at)}</div>
                      </div>
                      <div className="col-12">
                        <small className="text-muted">Expires:</small>
                        <div className="fw-medium">{formatDate(evaluationData.expires_at)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Averages */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0 fw-bold" style={{ color: '#1976d2' }}>Question Averages</h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {questionsForDisplay.map((question, index) => (
                    <div key={question.question_id} className="col-12">
                      <div className="border rounded p-3 bg-light">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <div className="fw-medium text-dark mb-2">
                              {index + 1}. {question.question_text}
                            </div>
                            <div className="small text-muted">
                              {question.total_responses} response{question.total_responses !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="d-flex flex-column align-items-end">
                              {renderStars(Math.round(Number(question.average_rating ?? 0)))}
                              <div className="fw-bold text-primary mt-1">
                                {Number(Number(question.average_rating ?? 0).toFixed(1))}/5.0
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Rating Breakdown */}
                        <div className="mt-3">
                          <small className="text-muted fw-bold">Rating Distribution:</small>
                          <div className="d-flex gap-2 mt-1 flex-wrap">
                            {[5, 4, 3, 2, 1].map(rating => {
                              const breakdown = question.ratings_breakdown || {};
                              const count = (breakdown as any)[rating] || 0;
                              const percentage = question.total_responses > 0 ? (count / question.total_responses * 100).toFixed(0) : 0;
                              return (
                                <div key={rating} className="text-center">
                                  <div className="small fw-bold" style={{ color: '#1976d2' }}>
                                    {rating}⭐
                                  </div>
                                  <div className="small text-muted">
                                    {count} ({percentage}%)
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 bg-light">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={openComments}
            >
              <i className="bi bi-chat-dots me-2"></i>
              View Comments
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => {
                // Export evaluation data as JSON
                const exportData = {
                  evaluation_id: evaluationData.evaluation_id,
                  teacher_id: evaluationData.teacher_id,
                  teacher_name: evaluationData.teacher_name,
                  created_at: evaluationData.created_at,
                  expires_at: evaluationData.expires_at,
                  status: evaluationData.status,
                  overall_average: evaluationData.overall_average,
                  total_students: evaluationData.total_students,
                  total_questions: evaluationData.questions.length,
                  questions: evaluationData.questions.map(question => ({
                    question_id: question.question_id,
                    question: question.question_text,
                    average_rating: question.average_rating,
                    total_responses: question.total_responses,
                    ratings_breakdown: question.ratings_breakdown
                  }))
                };
                
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `evaluation_${evaluationData.evaluation_id}_summary.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
            >
              <i className="bi bi-download me-2"></i>
              Export Data
            </button>
          </div>
        </div>
      </div>
      {/* Comments modal mount */}
      <CommentsModal open={showComments} onClose={() => setShowComments(false)} loading={commentsLoading} error={commentsError} comments={comments} />
    </div>
  );
}

// Comments Modal
function CommentsModal({ open, onClose, loading, error, comments }: { open: boolean; onClose: () => void; loading: boolean; error: string; comments: Array<{ id: number; student_id: string; question_id: number; remarks: string }>; }) {
  if (!open) return null;
  const labelFor = (qid: number) => (qid === 21 ? 'Comments' : 'Remarks');
  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title"><i className="bi bi-chat-dots me-2"></i>Evaluator Comments</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                <div className="mt-2">Loading comments...</div>
              </div>
            ) : error ? (
              <div className="alert alert-danger"><i className="bi bi-exclamation-triangle me-2"></i>{error}</div>
            ) : comments.length === 0 ? (
              <div className="text-center text-muted py-4"><i className="bi bi-inbox me-2"></i>No comments found.</div>
            ) : (
              <div className="list-group">
                {comments.map(c => (
                  <div key={c.id} className="list-group-item list-group-item-action">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="small text-muted fw-bold">{labelFor(c.question_id)} • Student: {c.student_id}</div>
                        <div className="mt-1" style={{ whiteSpace: 'pre-wrap' }}>{c.remarks}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
