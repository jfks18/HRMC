"use client";
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

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

  const exportToPDF = async () => {
    try {
      console.log('🚀 Starting Enhanced PDF export...');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPos = 20;
      
      // Colors - defined as tuples for proper TypeScript typing
      const primaryBlue: [number, number, number] = [25, 118, 210];
      const lightBlue: [number, number, number] = [144, 202, 249];
      const darkGray: [number, number, number] = [66, 66, 66];
      const lightGray: [number, number, number] = [245, 245, 245];
      const successGreen: [number, number, number] = [76, 175, 80];
      const warningOrange: [number, number, number] = [255, 152, 0];
      const errorRed: [number, number, number] = [244, 67, 54];
      
      // Header Section with Background
      pdf.setFillColor(...primaryBlue);
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Faculty Evaluation Report', 20, 18);
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      })}`, 20, 28);
      
      yPos = 50;
      
      // Teacher Info Card
      pdf.setFillColor(...lightGray);
      pdf.roundedRect(15, yPos - 5, pageWidth - 30, 25, 3, 3, 'F');
      
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Teacher Information', 20, yPos + 5);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${evaluationData.teacher_name || 'Unknown'}`, 20, yPos + 12);
      pdf.text(`Total Students Responded: ${evaluationData.total_students}`, 20, yPos + 18);
      
      // Status badge
      const status = evaluationData.status;
      const statusColor = status === 'active' ? successGreen : status === 'expired' ? errorRed : darkGray;
      pdf.setFillColor(...statusColor);
      pdf.roundedRect(120, yPos + 14, 30, 6, 2, 2, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text(status.toUpperCase(), 122, yPos + 18);
      
      yPos += 35;
      
      // Overall Rating Card
      pdf.setFillColor(...lightBlue);
      pdf.roundedRect(15, yPos - 5, pageWidth - 30, 35, 3, 3, 'F');
      
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Overall Rating', 20, yPos + 5);
      
      // Large rating number
      pdf.setFontSize(28);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(...primaryBlue);
      pdf.text(`${averageRating.toFixed(1)}`, 20, yPos + 20);
      
      pdf.setFontSize(12);
      pdf.setTextColor(...darkGray);
      pdf.text('/5.0', 35, yPos + 20);
      
      // Star rating visualization
      const starY = yPos + 25;
      for (let i = 1; i <= 5; i++) {
        if (i <= Math.round(averageRating)) {
          pdf.setTextColor(255, 193, 7); // Gold color
          pdf.text('★', 60 + (i * 8), starY);
        } else {
          pdf.setTextColor(200, 200, 200); // Gray color
          pdf.text('☆', 60 + (i * 8), starY);
        }
      }
      
      yPos += 45;
      
      // Questions Analysis Header
      pdf.setFillColor(...primaryBlue);
      pdf.rect(15, yPos - 5, pageWidth - 30, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Question Analysis', 20, yPos + 3);
      
      yPos += 15;
      
      // Questions
      questionsForDisplay.forEach((question, index) => {
        // Check if we need a new page
        if (yPos > pageHeight - 60) {
          pdf.addPage();
          yPos = 20;
        }
        
        // Question card background
        pdf.setFillColor(250, 250, 250);
        pdf.roundedRect(15, yPos - 3, pageWidth - 30, 45, 2, 2, 'F');
        
        // Question number circle
        const avgRating = Number(question.average_rating ?? 0);
        const circleColor = avgRating >= 4 ? successGreen : avgRating >= 3 ? warningOrange : errorRed;
        pdf.setFillColor(...circleColor);
        pdf.circle(25, yPos + 8, 8, 'F');
        
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}`, 22, yPos + 10);
        
        // Question text
        pdf.setTextColor(...darkGray);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        const questionLines = pdf.splitTextToSize(question.question_text, pageWidth - 70);
        pdf.text(questionLines, 40, yPos + 5);
        
        // Rating display
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(...primaryBlue);
        pdf.text(`${avgRating.toFixed(1)}`, 40, yPos + 20);
        
        pdf.setFontSize(10);
        pdf.setTextColor(...darkGray);
        pdf.text('/5.0', 52, yPos + 20);
        
        // Response count
        pdf.setFontSize(9);
        pdf.text(`(${question.total_responses} responses)`, 40, yPos + 25);
        
        // Rating breakdown bars
        if (question.ratings_breakdown) {
          let barX = 40;
          const barWidth = (pageWidth - 80) / 5;
          const maxCount = Math.max(...Object.values(question.ratings_breakdown as any).map(Number));
          
          [5, 4, 3, 2, 1].forEach(rating => {
            const count = (question.ratings_breakdown as any)[rating] || 0;
            const percentage = question.total_responses > 0 ? (count / question.total_responses * 100) : 0;
            const barHeight = maxCount > 0 ? (count / maxCount) * 10 : 0;
            
            // Bar color based on rating
            const barColor = rating >= 4 ? successGreen : rating >= 3 ? warningOrange : errorRed;
            pdf.setFillColor(...barColor);
            
            if (barHeight > 0) {
              pdf.rect(barX, yPos + 35 - barHeight, barWidth - 2, barHeight, 'F');
            }
            
            // Rating label
            pdf.setTextColor(...darkGray);
            pdf.setFontSize(8);
            pdf.text(`${rating}★`, barX + 2, yPos + 38);
            pdf.text(`${count}`, barX + 2, yPos + 42);
            
            barX += barWidth;
          });
        }
        
        yPos += 50;
      });
      
      // Footer
      pdf.setFillColor(...lightGray);
      pdf.rect(0, pageHeight - 15, pageWidth, 15, 'F');
      pdf.setTextColor(...darkGray);
      pdf.setFontSize(8);
      pdf.text('Generated by HRMS - Faculty Evaluation System', 20, pageHeight - 8);
      pdf.text(`Page 1 of ${pdf.internal.pages.length - 1}`, pageWidth - 40, pageHeight - 8);
      
      const filename = `evaluation_report_${evaluationData.teacher_name || 'teacher'}_${Date.now()}.pdf`;
      pdf.save(filename);
      console.log('✅ Enhanced PDF export completed!');
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error?.message || 'Unknown error'}`);
    }
  };

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
                  <>Teacher: {evaluationData.teacher_name}</>
                ) : (
                  <>Teacher: {teacherId}</>
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
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => {
                  console.log('🔴 Admin PDF Export clicked!');
                  exportToPDF();
                }}
                title="Export as PDF Report"
              >
                <i className="bi bi-file-earmark-pdf me-2"></i>
                📄 Export PDF
              </button>
              <button 
                type="button" 
                className="btn btn-warning"
                onClick={() => {
                  console.log('🟡 Admin JSON Export clicked!');
                  
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
                title="Export as JSON Data"
              >
                <i className="bi bi-code me-2"></i>
                📊 Export JSON
              </button>
            </div>
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
