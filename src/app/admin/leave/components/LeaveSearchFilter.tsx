import React from 'react';

export default function LeaveSearchFilter() {
  return (
    <div className="d-flex gap-2 mb-3">
      <input className="form-control" style={{ maxWidth: 420 }} placeholder="Search employees..." />
      <select className="form-select" style={{ maxWidth: 160 }}>
        <option>All Status</option>
      </select>
      <select className="form-select" style={{ maxWidth: 160 }}>
        <option>All Types</option>
      </select>
    </div>
  );
}
