"use client";
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../apiFetch';
import { Table, TableColumn } from '../../components/Table';
import GlobalSearchFilter from '../../components/GlobalSearchFilter';

interface User { 
  id: number;
  name: string;
  email: string;
  roleName: string;
}

const baseColumns: TableColumn<User>[] = [
  { key: 'id', header: 'ID' },
  { key: 'name', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'roleName', header: 'Role' },
];

export default function LeaveTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const filters = ['Admin', 'Dean', 'Faculty', 'Staff']; // Example filter options

  useEffect(() => {
    apiFetch('/api/proxy/users')
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const columns: TableColumn<User>[] = [
    ...baseColumns,
    {
      key: 'actions' as keyof User,
      header: 'Actions',
      render: (_value: any, row: User) => (
        <div className="d-flex gap-2">
          <button
            className="btn btn-sm btn-warning"
            onClick={() => alert(`Edit ${row.name}`)}
          >
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => alert(`Delete ${row.name}`)}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? user.roleName === filter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="card">
      <div className="card-body">
        <GlobalSearchFilter
          search={search}
          setSearch={setSearch}
          filter={filter}
          setFilter={setFilter}
          filters={filters}
        />
        <Table columns={columns} data={filteredUsers} />
      </div>
    </div>
  );
}
