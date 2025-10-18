import React from 'react';

export default function CertificatesSearchFilter() {
  return (
    <div className="d-flex gap-2 mb-3">
      <input className="form-control" style={{ maxWidth: 420 }} placeholder="Search certificates..." />
      <select className="form-select" style={{ maxWidth: 160 }}>
        <option>All Status</option>
      </select>
    </div>
  );
}
