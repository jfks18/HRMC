"use client";
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../apiFetch';

interface Student {
  id: string;
  name: string;
  year: string;
  course: string;
}

interface NewStudent {
  name: string;
  year: string;
  course: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: '',
    year: '',
    course: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCourse, setFilterCourse] = useState('');

  // Common year and course options
  const yearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const courseOptions = [
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Computer Science', 
    'Bachelor of Science in Business Administration',
    'Bachelor of Arts in Communication',
    'Bachelor of Science in Education',
    'Bachelor of Science in Engineering',
    'Bachelor of Science in Nursing'
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

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!newStudent.name.trim() || !newStudent.year || !newStudent.course) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch('/api/proxy/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent),
      });

      if (response.ok) {
        setSuccess('Student created successfully!');
        setNewStudent({ name: '', year: '', course: '' });
        setShowCreateModal(false);
        fetchStudents();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to create student');
      }
    } catch (err) {
      setError('Error creating student');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    setError('');
    setSuccess('');
    
    if (!editingStudent.name.trim() || !editingStudent.year || !editingStudent.course) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiFetch(`/api/proxy/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingStudent.name,
          year: editingStudent.year,
          course: editingStudent.course,
        }),
      });

      if (response.ok) {
        setSuccess('Student updated successfully!');
        setShowEditModal(false);
        setEditingStudent(null);
        fetchStudents();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update student');
      }
    } catch (err) {
      setError('Error updating student');
      console.error('Error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student?')) {
      return;
    }

    try {
      const response = await apiFetch(`/api/proxy/students/${studentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Student deleted successfully!');
        fetchStudents();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to delete student');
      }
    } catch (err) {
      setError('Error deleting student');
      console.error('Error:', err);
    }
  };

  const openEditModal = (student: Student) => {
    setEditingStudent({ ...student });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingStudent(null);
    setNewStudent({ name: '', year: '', course: '' });
    setError('');
    setSuccess('');
  };

  // Filter students based on search and filters
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = !filterYear || student.year === filterYear;
    const matchesCourse = !filterCourse || student.course === filterCourse;
    
    return matchesSearch && matchesYear && matchesCourse;
  });

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="fw-bold text-primary mb-0">
            <i className="bi bi-people me-2"></i>Student Management
          </h2>
          <p className="text-muted">Manage student records and information</p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>Add New Student
          </button>
        </div>
      </div>

      {/* Filters */}
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
              <option key={course} value={course}>
                {course.length > 50 ? course.substring(0, 47) + '...' : course}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success/Error Messages */}
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

      {/* Students Table */}
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
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Year</th>
                    <th>Course</th>
                    <th style={{ width: '120px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">{student.id}</code>
                      </td>
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
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => openEditModal(student)}
                            title="Edit Student"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={() => handleDeleteStudent(student.id)}
                            title="Delete Student"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
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
                <button type="button" className="btn-close btn-close-white" onClick={closeModals}></button>
              </div>
              <form onSubmit={handleCreateStudent}>
                <div className="modal-body">
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
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModals}>
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

      {/* Edit Student Modal */}
      {showEditModal && editingStudent && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="bi bi-pencil me-2"></i>Edit Student
                </h5>
                <button type="button" className="btn-close" onClick={closeModals}></button>
              </div>
              <form onSubmit={handleEditStudent}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Student ID</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editingStudent.id}
                      disabled
                    />
                    <small className="text-muted">Student ID cannot be changed</small>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editStudentName" className="form-label">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editStudentName"
                      value={editingStudent.name}
                      onChange={(e) => setEditingStudent(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editStudentYear" className="form-label">Year Level *</label>
                    <select
                      className="form-select"
                      id="editStudentYear"
                      value={editingStudent.year}
                      onChange={(e) => setEditingStudent(prev => prev ? ({ ...prev, year: e.target.value }) : null)}
                      required
                    >
                      <option value="">Select Year Level</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editStudentCourse" className="form-label">Course *</label>
                    <select
                      className="form-select"
                      id="editStudentCourse"
                      value={editingStudent.course}
                      onChange={(e) => setEditingStudent(prev => prev ? ({ ...prev, course: e.target.value }) : null)}
                      required
                    >
                      <option value="">Select Course</option>
                      {courseOptions.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModals}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>Update Student
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