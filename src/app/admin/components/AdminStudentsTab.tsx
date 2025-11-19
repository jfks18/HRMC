"use client";
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../apiFetch';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

interface Student {
  id: string;
  name: string;
  year: string;
  course: string;
}

export default function AdminStudentsTab() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ id: '', name: '', year: '', course: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  // Common year and course options
  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const courseOptions = [
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Computer Science', 
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Education',
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/proxy/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      setError('Error fetching students');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !filterYear || student.year === filterYear;
    const matchesCourse = !filterCourse || student.course === filterCourse;
    return matchesSearch && matchesYear && matchesCourse;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newStudent.id.trim() || !newStudent.name.trim() || !newStudent.year || !newStudent.course) {
      setError('All fields are required');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await apiFetch('/api/proxy/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newStudent, id: newStudent.id.trim(), name: newStudent.name.trim() }),
      });
      if (response.ok) {
        setSuccess('Student created successfully!');
        setNewStudent({ id: '', name: '', year: '', course: '' });
        setShowCreateModal(false);
        fetchStudents();
      } else {
        setError('Failed to create student');
      }
    } catch (err) {
      setError('Error creating student');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold text-primary mb-0">
          <i className="bi bi-people me-2"></i>Student Management
        </h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="bi bi-plus-circle me-2"></i>Add New Student
        </button>
      </div>
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="col-md-5">
          <select
            className="form-select"
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Courses</option>
            {courseOptions.map(course => (
              <option key={course} value={course}>{course.length > 50 ? course.substring(0, 47) + '...' : course}</option>
            ))}
          </select>
        </div>
      </div>
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle me-2"></i>{success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-people display-4 text-muted"></i>
              <h5 className="mt-3 text-muted">No students found</h5>
              <p className="text-muted">
                {students.length === 0 
                  ? 'No students have been added yet.' 
                  : 'No students match your search criteria.'
                }
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Course</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td className="fw-semibold">{student.name}</td>
                      <td>
                        <span className="badge bg-info text-dark">{student.year}</span>
                      </td>
                      <td className="text-muted small">
                        {student.course.length > 40 
                          ? student.course.substring(0, 37) + '...' 
                          : student.course
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  Showing {filteredStudents.length} of {students.length} students
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Create Student Modal */}
      {showCreateModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>Add New Student
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateStudent}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="studentId" className="form-label">Student ID *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="studentId"
                      value={newStudent.id}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, id: e.target.value }))}
                      required
                      placeholder="Enter unique student ID (e.g., 2024001, STU001)"
                      minLength={3}
                      maxLength={20}
                    />
                    <small className="text-muted">Must be unique and between 3-20 characters</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="studentName" className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="studentName"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="Enter student's full name"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="studentCourse" className="form-label">Course *</label>
                    <select
                      className="form-select"
                      id="studentCourse"
                      value={newStudent.course}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, course: e.target.value }))}
                      required
                    >
                      <option value="">Select Course</option>
                      {courseOptions.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                   <div className="mb-3">
                    <label htmlFor="studentYear" className="form-label">Year Level *</label>
                    <select
                      className="form-select"
                      id="studentYear"
                      value={newStudent.year}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, year: e.target.value }))}
                      required
                    >
                      <option value="">Select Year Level</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-plus-circle me-2"></i>Create Student
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
