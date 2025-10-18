import React from 'react';

export default function AttendanceSearchFilter() {
  return (
    <div className="d-flex gap-2 mb-3">
      <input className="form-control" style={{ maxWidth: 320 }} placeholder="Search employees..." />
      <select className="form-select" style={{ maxWidth: 160 }}>
        <option>All Status</option>
      </select>
      <select className="form-select" style={{ maxWidth: 120 }}>
        <option>Daily</option>
      </select>
      <input type="date" className="form-control" style={{ maxWidth: 160 }} />
      <button className="btn btn-dark ms-auto d-flex align-items-center gap-2"><i className="bi bi-download"></i> Export</button>
    </div>
  );
}
