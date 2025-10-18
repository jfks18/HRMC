                                                                    import React from 'react';
import { SearchFilterProps } from './SearchFilterProps';

export default function GlobalSearchFilter({
  search,
  setSearch,
  filter,
  setFilter,
  filters = [],
  showPeriodDropdown = false,
  showDateInput = false,
  showExportButton = false,
}: SearchFilterProps) {
  return (
    <div className="d-flex gap-2 mb-3 align-items-center">
      <input
        className="form-control"
        style={{ maxWidth: 320 }}
        placeholder="Search employees..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <select
        className="form-select"
        style={{ maxWidth: 160 }}
        value={filter}
        onChange={e => setFilter(e.target.value)}
      >
        <option value="">All Status</option>
        {filters.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      {showPeriodDropdown && (
        <select className="form-select" style={{ maxWidth: 120 }}>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      )}
      {showDateInput && (
        <input type="date" className="form-control" style={{ maxWidth: 160 }} />
      )}
      {showExportButton && (
        <button className="btn btn-dark ms-auto d-flex align-items-center gap-2">
          <i className="bi bi-download"></i> Export
        </button>
      )}
    </div>
  );
}
