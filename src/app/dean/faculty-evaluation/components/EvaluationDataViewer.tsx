"use client";
import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  average_rating: number;
  total_responses: number;
  ratings_breakdown: { [rating: number]: number };
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
  overall_average: number;
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
  if (questions.length === 0) return 0;
  const sum = questions.reduce((total, question) => total + question.average_rating, 0);
  return parseFloat((sum / questions.length).toFixed(1));
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
  console.log('🔥🔥🔥 EvaluationDataViewer COMPONENT RENDERING! 🔥🔥🔥');
  console.log('🔥 Props received:', { evaluationId, teacherId, studentId });
  
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log('EvaluationDataViewer component mounted with:', { evaluationId, teacherId, studentId });

  // Add a simple early return to test if component is rendering
  if (!evaluationId) {
    console.log('EvaluationDataViewer: No evaluation ID provided');
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-body text-center py-3">
              <p>No evaluation ID provided</p>
              <button className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    console.log('EvaluationDataViewer useEffect triggered');
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

  if (loading) {
    console.log('EvaluationDataViewer: Showing loading state');
    return (
      <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-3">Loading evaluation data...</div>
              <button className="btn btn-secondary mt-3" onClick={onClose}>Close</button>
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

  const averageRating = evaluationData.overall_average || calculateAverageRating(evaluationData.questions);

  const exportToPDF = async () => {
    try {
      console.log('🚀 Starting Simple PDF export...');
      console.log('📊 Evaluation data:', evaluationData);
      
      // Validate data before proceeding
      if (!evaluationData) {
        throw new Error('No evaluation data available');
      }
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      let yPos = 20;
      
      // Simple header
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Faculty Evaluation Report - Dean View', 20, yPos);
      yPos += 10;
      
      // Teacher info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Teacher: ${evaluationData.teacher_name || 'Unknown'}`, 20, yPos);
      yPos += 8;
      pdf.text(`Total Responses: ${evaluationData.total_students || 0}`, 20, yPos);
      yPos += 8;
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 15;
      
      // Questions and Response Breakdown
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Questions and Response Breakdown:', 20, yPos);
      yPos += 10;
      
      const safeQuestions = evaluationData.questions || [];
      safeQuestions.forEach((question, index) => {
        // Check if we need a new page
        if (yPos > 240) {
          pdf.addPage();
          yPos = 20;
        }
        
        // Question number and text
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${index + 1}. ${question.question_text || 'Question not available'}`, 20, yPos);
        yPos += 8;
        
        // Total responses
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Total Responses: ${question.total_responses || 0}`, 25, yPos);
        yPos += 6;
        
        // Rating breakdown - how many respondents chose each rating
        if (question.ratings_breakdown) {
          const breakdown = question.ratings_breakdown as any;
          pdf.text(`5 (Excellent): ${breakdown[5] || 0} respondents`, 25, yPos);
          yPos += 4;
          pdf.text(`4 (Very Good): ${breakdown[4] || 0} respondents`, 25, yPos);
          yPos += 4;
          pdf.text(`3 (Good): ${breakdown[3] || 0} respondents`, 25, yPos);
          yPos += 4;
          pdf.text(`2 (Fair): ${breakdown[2] || 0} respondents`, 25, yPos);
          yPos += 4;
          pdf.text(`1 (Poor): ${breakdown[1] || 0} respondents`, 25, yPos);
          yPos += 8;
        } else {
          yPos += 6;
        }
      });
      
      const filename = `dean_evaluation_report_${evaluationData.teacher_name || 'teacher'}_${Date.now()}.pdf`;
      pdf.save(filename);
      console.log('✅ Simple PDF export completed!');
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error?.message || 'Unknown error'}. Please check the console for more details.`);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header" style={{ background: 'linear-gradient(90deg, #1976d2 0%, #90caf9 100%)' }}>
            <div>
              <h5 className="modal-title text-white fw-bold mb-1">Evaluation Data Viewer - Dean View</h5>
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
                  {evaluationData.questions.map((question, index) => (
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
                              {renderStars(Math.round(question.average_rating))}
                              <div className="fw-bold text-primary mt-1">
                                {question.average_rating.toFixed(1)}/5.0
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Rating Breakdown */}
                        <div className="mt-3">
                          <small className="text-muted fw-bold">Rating Distribution:</small>
                          <div className="d-flex gap-2 mt-1 flex-wrap">
                            {[5, 4, 3, 2, 1].map(rating => {
                              const count = question.ratings_breakdown[rating] || 0;
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
            <div className="d-flex gap-2">
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => {
                  console.log('🔴 PDF Export button clicked!');
                  console.log('Evaluation data:', evaluationData);
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
                  console.log('🟡 JSON Export button clicked!');
                  
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
                  link.download = `evaluation_${evaluationData.evaluation_id}_dean_summary.json`;
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
    </div>
  );
}
