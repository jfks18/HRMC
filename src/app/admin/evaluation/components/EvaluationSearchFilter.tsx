import React from 'react';

type Props = {
  query?: string;
  department?: string;
  status?: string;
  onChange?: (filters: { query?: string; department?: string; status?: string }) => void;
}

export default function EvaluationSearchFilter({ query = '', department = '', status = '', onChange }: Props) {
  return (
    <div className="d-flex gap-2 mb-3">
      <input className="form-control" style={{ maxWidth: 320 }} placeholder="Search faculty..." value={query} onChange={e => onChange?.({ query: e.target.value, department, status })} />
      <select className="form-select" style={{ maxWidth: 160 }} value={department} onChange={e => onChange?.({ query, department: e.target.value, status })}>
        <option value="">All Departments</option>
        <option value="it">IT</option>
        <option value="hr">HR</option>
      </select>
      <select className="form-select" style={{ maxWidth: 160 }} value={status} onChange={e => onChange?.({ query, department, status: e.target.value })}>
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="expired">Expired</option>
      </select>
    </div>
  );
}
