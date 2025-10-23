"use client";
import React, { useState } from 'react';
import { apiFetch } from '../../apiFetch';
import TopBar from '../../components/TopBar';
import SideNav from '../../components/SideNav';
import { BsPeople, BsEye, BsShield, BsPersonLinesFill } from 'react-icons/bs';
import UsersTable from './userstable';
import GlobalModal, { GlobalModalField } from '../../components/GlobalModal';

const userStats = [
  { label: 'Total Users', value: 5, icon: <BsPeople size={24} color="#1a237e" /> },
  { label: 'Active Users', value: 4, icon: <BsEye size={24} color="#388e3c" /> },
  { label: 'Faculty', value: 1, icon: <BsShield size={24} color="#7c3aed" /> },
  { label: 'Staff', value: 1, icon: <BsPersonLinesFill size={24} color="#ff6f00" /> },
];

export default function UserManagement() {
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filters, setFilters] = useState<{ query?: string; role?: string; department?: string }>({});
  const userFields: GlobalModalField[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'role_id', label: 'Role', type: 'select', options: roles.map(r => ({ value: String(r.id), label: r.name })) },
    { key: 'password', label: 'Password', type: 'password' },
  { key: 'department_id', label: 'Department', type: 'select', options: departments.map(d => ({ value: String(d.id), label: d.name })) },
    { key: 'code', label: 'Timekeeper Code' }
  ];

  // Fetch roles and departments for dropdowns
  React.useEffect(() => {
    apiFetch('/api/proxy/roles')
      .then(r => r.json())
      .then(data => setRoles(data))
      .catch(() => setRoles([]));
    apiFetch('/api/proxy/departments')
      .then(r => r.json())
      .then(data => setDepartments(data))
      .catch(() => setDepartments([]));
    // fetch users to compute filter options and pass to table
    apiFetch('/api/proxy/users')
      .then(r => r.json())
      .then(data => setUsers(data))
      .catch(() => setUsers([]));
  }, []);

  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav/>
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <h1 className="fw-bold mb-1" style={{ color: '#1a237e' }}>User Management</h1>
          <div className="text-muted mb-4">Manage system users, roles, and permissions</div>
          <div className="d-flex gap-2 mb-3">
            <input className="form-control" style={{ maxWidth: 320 }} placeholder="Search users..." value={filters.query || ''} onChange={e => setFilters(f => ({ ...f, query: e.target.value }))} />
            <select className="form-select" style={{ maxWidth: 160 }} value={filters.role || ''} onChange={e => setFilters(f => ({ ...f, role: e.target.value }))}>
              <option value="">All Roles</option>
              {Array.from(new Set(users.map(u => u.roleName))).map(rn => (
                rn && <option key={rn} value={rn}>{rn}</option>
              ))}
            </select>
            <select
              className="form-select"
              style={{ maxWidth: 200 }}
              value={filters.department || ''}
              onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
            >
              <option value="">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={String(d.id)}>{d.name}</option>
              ))}
            </select>
            <div className="ms-auto">
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add User</button>
            </div>
          </div>
          <div className="row g-3 mb-4">
            {userStats.map(stat => (
              <div className="col-md-3" key={stat.label}>
                <div className="card border-0 shadow-sm d-flex flex-row align-items-center gap-3 p-3" style={{ background: '#fff' }}>
                  <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="fw-semibold" style={{ color: '#1a237e' }}>{stat.label}</div>
                    <div className="fs-5 fw-bold">{stat.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="fw-bold mb-3" style={{ color: '#1a237e' }}>System Users</h5>
              <UsersTable filters={filters} usersProp={users} />
            </div>
          </div>
          <GlobalModal
            show={showModal}
            title="Add User"
            fields={userFields}
            onClose={() => setShowModal(false)}
            onSubmit={async data => {
              // Build payload expected by backend
              const payload: any = {
                name: data.name,
                email: data.email,
                password: data.password,
                role_id: data.role_id ? Number(data.role_id) : null,
                department_id: data.department_id ? Number(data.department_id) : null,
                code: data.code || null
              };
              try {
                const res = await apiFetch('/api/proxy/users', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                if (!res.ok) {
                  const err = await res.json().catch(() => ({}));
                  alert(err.error || 'Failed to create user');
                  return;
                }
                // Success - close modal and reload users
                setShowModal(false);
                window.location.reload();
              } catch (err) {
                alert('Failed to create user');
              }
            }}
            submitText="Add User"
          />
        </main>
      </div>
    </div>
  );
}