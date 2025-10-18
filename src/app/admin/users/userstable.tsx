import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../apiFetch';

interface User {
  id: string;
  name: string;
  email: string;
  roleName: string;
  department: number;
}

export default function UsersTable({ filters, usersProp }: { filters?: { query?: string; role?: string; department?: string }, usersProp?: any[] }) {
  const [users, setUsers] = useState<User[]>(usersProp ?? []);
  const handleDelete = async (user: User) => {
    console.log('Attempting to delete user:', user);
    if (!window.confirm(`Are you sure you want to delete user '${user.name}'?`)) return;
    try {
      const res = await apiFetch(`/api/proxy/users/${user.id}`, {
        method: 'DELETE'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete user.');
        return;
      }
      setUsers(users => users.filter(u => u.id !== user.id));
    } catch (err) {
      alert('Failed to delete user.');
    }
  };
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDept, setSelectedDept] = useState<number | ''>('');
  // Departments with id and name, fetched from backend
  const [departments, setDepartments] = useState<{ id: number, name: string }[]>([]);
  useEffect(() => {
    // If usersProp provided, use it; otherwise fetch
    if (usersProp) {
      setUsers(usersProp);
    } else {
      apiFetch('/api/proxy/users')
        .then(res => res.json())
        .then(data => setUsers(data));
    }
    apiFetch('/api/proxy/departments')
      .then(res => res.json())
      .then(data => setDepartments(data));
  }, [usersProp]);

  const filteredUsers = users.filter(u => {
    if (!filters) return true;
    const { query, role, department } = filters;
    if (query) {
      const q = String(query).toLowerCase();
      if (!(String(u.name).toLowerCase().includes(q) || String(u.email).toLowerCase().includes(q) || String(u.roleName).toLowerCase().includes(q))) return false;
    }
    if (role) {
      if (String(u.roleName) !== String(role)) return false;
    }
    if (department) {
      if (String(u.department) !== String(department)) return false;
    }
    return true;
  });

  // Assign department handler
  const handleAssignDepartment = async () => {
    if (!selectedUser || !selectedDept) return;
    // Find department object
    const deptObj = departments.find(d => d.id === Number(selectedDept));
    if (!deptObj) return;
    try {
      const res = await apiFetch(`/api/proxy/users/${selectedUser.id}/department`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ department_id: deptObj.id })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to assign department.');
        return;
      }
      setUsers(users => users.map(u => u.id === selectedUser.id ? { ...u, department: deptObj.id } : u));
      setShowModal(false);
    } catch (err) {
      alert('Failed to assign department.');
    }
  };

  return (
    <>
      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.roleName}</td>
                <td>{Array.isArray(departments) ? departments.find(d => d.id === user.department)?.name || '' : ''}</td>
                <td>
                  <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-warning" onClick={() => {
                              setSelectedUser(user);
                              // Find department id by name
                              setSelectedUser(user);
                              setSelectedDept(user.department || '');
                              setShowModal(true);
                            }}>Assign Department</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.3)' }} tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Department</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Department</label>
                          <select className="form-select" value={selectedDept} onChange={e => setSelectedDept(e.target.value === '' ? '' : Number(e.target.value))}>
                            <option value="">Select department</option>
                            {departments.map(dept => (
                              <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                          </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" disabled={!selectedDept} onClick={handleAssignDepartment}>
                  Assign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
