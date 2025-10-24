import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../../apiFetch';

interface User {
  id: string;
  name: string;
  email: string;
  roleName: string;
  // From backend: department_id is stringified; include department_name for display
  department_id: string | null;
  department_name?: string | null;
  code?: string;
}

export default function UsersTable({ 
  filters, 
  usersProp, 
  onStatsChange
}: { 
  filters?: { query?: string; role?: string; department?: string }, 
  usersProp?: any[],
  onStatsChange?: (stats: { visible: number; byRole: Record<string, number> }) => void
}) {
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

  // Memoize filtering to keep reference stable across parent re-renders
  const filteredUsers = useMemo(() => users.filter(u => {
    if (!filters) return true;
    const { query, role, department } = filters;
    if (query) {
      const q = String(query).toLowerCase();
      const inName = String(u.name).toLowerCase().includes(q);
      const inEmail = String(u.email).toLowerCase().includes(q);
      const inRole = String(u.roleName).toLowerCase().includes(q);
      const inDeptName = String(u.department_name || '').toLowerCase().includes(q);
      const inCode = String(u.code || '').toLowerCase().includes(q);
      if (!(inName || inEmail || inRole || inDeptName || inCode)) return false;
    }
    if (role) {
      if (String(u.roleName) !== String(role)) return false;
    }
    if (department !== undefined && department !== null) {
      const depVal = String(department).trim().toLowerCase();
      // Treat common "all" options as no filter
      const isAll = depVal === '' || depVal === 'all' || depVal === 'all department' || depVal === 'all departments';
      if (!isAll) {
        const isNumericId = /^\d+$/.test(depVal);
        if (isNumericId) {
          if (String(u.department_id ?? '').toLowerCase() !== depVal) return false;
        } else {
          if (String(u.department_name || '').toLowerCase() !== depVal) return false;
        }
      }
    }
    return true;
  }), [users, filters]);

  // Emit stats upward so the page can render accurate stat cards based on the table
  const lastStatsKeyRef = useRef<string>('');
  useEffect(() => {
    if (!onStatsChange) return;
    const byRole: Record<string, number> = {};
    for (const u of filteredUsers) {
      const key = String(u.roleName || '').trim() || 'No Role';
      byRole[key] = (byRole[key] || 0) + 1;
    }
    const payload = { visible: filteredUsers.length, byRole };
    const key = JSON.stringify(payload);
    if (key === lastStatsKeyRef.current) return; // avoid update loops on identical stats
    lastStatsKeyRef.current = key;
    onStatsChange(payload);
  }, [onStatsChange, filteredUsers]);

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
      setUsers(users => users.map(u =>
        u.id === selectedUser.id
          ? { ...u, department_id: String(deptObj.id), department_name: deptObj.name }
          : u
      ));
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
                <td>{user.department_name || ''}</td>
                <td>
                  <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-warning" onClick={() => {
                              setSelectedUser(user);
                              // Initialize selected dept from user's department_id
                              const parsed = user.department_id ? Number(user.department_id) : NaN;
                              setSelectedDept(Number.isFinite(parsed) ? parsed : '');
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
