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
  const bachelorYearOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const associateYearOptions = ['1st Year', '2nd Year'];
  const courseOptions = [
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Education',
    'Associate in Computer Science',
  ];
  const degreeOptions = ['Bachelor', 'Associate'];

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [filterDegree, setFilterDegree] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStudent, setNewStudent] = useState({ id: '', name: '', year: '', course: '', degree: 'Bachelor' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
   // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);

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
    const matchesDegree = !filterDegree || (student.course === 'Associate in Computer Science' ? 'Associate' : 'Bachelor') === filterDegree;
    return matchesSearch && matchesYear && matchesCourse && matchesDegree;
  });

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newStudent.id.trim() || !newStudent.name.trim() || !newStudent.year || !newStudent.course || !newStudent.degree) {
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
        setNewStudent({ id: '', name: '', year: '', course: '', degree: 'Bachelor' });
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

   // Edit student logic
  const handleEditClick = (student: Student) => {
    setEditStudent(student);
    setShowEditModal(true);
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setError('');
    setSuccess('');
    setIsEditSubmitting(true);
    try {
      const response = await apiFetch(`/api/proxy/students/${editStudent.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editStudent.name, year: editStudent.year, course: editStudent.course }),
      });
      if (response.ok) {
        setSuccess('Student updated successfully!');
        setShowEditModal(false);
        setEditStudent(null);
        fetchStudents();
      } else {
        setError('Failed to update student');
      }
    } catch (err) {
      setError('Error updating student');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete student logic
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const handleDeleteStudent = async () => {
    if (!deleteId) return;
    setError('');
    setSuccess('');
    setIsDeleteSubmitting(true);
    try {
      const response = await apiFetch(`/api/proxy/students/${deleteId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setSuccess('Student deleted successfully!');
        setDeleteId(null);
        fetchStudents();
      } else {
        setError('Failed to delete student');
      }
    } catch (err) {
      setError('Error deleting student');
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  // Choose year options based on degree
  const yearOptions = newStudent.degree === 'Associate' ? associateYearOptions : bachelorYearOptions;
  const filterYearOptions = filterDegree === 'Associate' ? associateYearOptions : bachelorYearOptions;

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
        <div className="col-md-3">
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
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
          >
            <option value="">All Years</option>
            {filterYearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
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
        {/* <div className="col-md-3">
          <select
            className="form-select"
            value={filterDegree}
            onChange={(e) => setFilterDegree(e.target.value)}
          >
            <option value="">All Degrees</option>
            {degreeOptions.map(degree => (
              <option key={degree} value={degree}>{degree}</option>
            ))}
          </select>
        </div> */}
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
                    <th>Actions</th>
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
                      <td>
                        <button className="btn btn-sm btn-warning me-2" title="Edit" onClick={() => handleEditClick(student)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-danger" title="Delete" onClick={() => handleDeleteClick(student.id)}>
                          <i className="bi bi-trash"></i>
                        </button>
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
                    <label htmlFor="studentDegree" className="form-label">Degree Type *</label>
                    <select
                      className="form-select"
                      id="studentDegree"
                      value={newStudent.degree}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, degree: e.target.value, course: e.target.value === 'Associate' ? 'Associate in Computer Science' : '' }))}
                      required
                    >
                      <option value="">Select Degree Type</option>
                      {degreeOptions.map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
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
                      disabled={newStudent.degree === 'Associate'}
                    >
                      <option value="">Select Course</option>
                      {courseOptions.filter(course => newStudent.degree === 'Associate' ? course === 'Associate in Computer Science' : course !== 'Associate in Computer Science').map(course => (
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

        {/* Edit Student Modal */}
      {showEditModal && editStudent && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="bi bi-pencil me-2"></i>Edit Student
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowEditModal(false); setEditStudent(null); }}></button>
              </div>
              <form onSubmit={handleEditStudent}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Student ID</label>
                    <input type="text" className="form-control" value={editStudent.id} disabled />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Full Name *</label>
                    <input type="text" className="form-control" value={editStudent.name} onChange={e => setEditStudent(s => s ? { ...s, name: e.target.value } : s)} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Course *</label>
                    <select className="form-select" value={editStudent.course} onChange={e => setEditStudent(s => s ? { ...s, course: e.target.value } : s)} required>
                      <option value="">Select Course</option>
                      {courseOptions.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Year Level *</label>
                    <select className="form-select" value={editStudent.year} onChange={e => setEditStudent(s => s ? { ...s, year: e.target.value } : s)} required>
                      <option value="">Select Year Level</option>
                      {(editStudent.course === 'Associate in Computer Science' ? associateYearOptions : bachelorYearOptions).map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowEditModal(false); setEditStudent(null); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warning" disabled={isEditSubmitting}>
                    {isEditSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-pencil me-2"></i>Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-trash me-2"></i>Delete Student
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setDeleteId(null)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this student?</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" disabled={isDeleteSubmitting} onClick={handleDeleteStudent}>
                  {isDeleteSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-trash me-2"></i>Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    
  );

  
}
