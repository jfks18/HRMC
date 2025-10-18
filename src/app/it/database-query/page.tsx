"use client";
import React, { useState } from 'react';
import { APP_LINKS, apiFetch } from '../../apiFetch';

interface QueryResult {
  columns: string[];
  rows: any[][];
  rowCount: number;
  executionTime: number;
}

interface PresetQuery {
  name: string;
  query: string;
  description: string;
  category: string;
}

const presetQueries: PresetQuery[] = [
  {
    name: 'All Users',
    query: 'SELECT id, name, email, role FROM users ORDER BY id',
    description: 'List all users with their basic information',
    category: 'Users'
  },
  {
    name: 'Leave Requests',
    query: 'SELECT lr.id, u.name as user_name, lr.type, lr.start_date, lr.end_date, lr.days, lr.is_approve FROM leave_request lr JOIN users u ON lr.user_id = u.id ORDER BY lr.id DESC LIMIT 50',
    description: 'Recent leave requests with user names',
    category: 'Leave Management'
  },
  {
    name: 'Certificate Requests',
    query: 'SELECT cr.id, u.name as user_name, cr.certificate_type, cr.status, cr.request_date FROM certificate_requests cr JOIN users u ON cr.user_id = u.id ORDER BY cr.id DESC LIMIT 50',
    description: 'Recent certificate requests',
    category: 'Certificates'
  },
  {
    name: 'User Activity Summary',
    query: 'SELECT role, COUNT(*) as user_count FROM users GROUP BY role ORDER BY user_count DESC',
    description: 'Count of users by role',
    category: 'Analytics'
  },
  {
    name: 'Pending Approvals',
    query: 'SELECT lr.id, u.name, lr.type, lr.start_date, lr.days FROM leave_request lr JOIN users u ON lr.user_id = u.id WHERE lr.is_approve IS NULL ORDER BY lr.created_at ASC',
    description: 'All pending leave requests waiting for approval',
    category: 'Leave Management'
  }
];

export default function DatabaseQuery() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(presetQueries.map(q => q.category)))];

  const filteredQueries = selectedCategory === 'All' 
    ? presetQueries 
    : presetQueries.filter(q => q.category === selectedCategory);

  const executeQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    const startTime = Date.now();

    try {
      console.log('🔍 Executing query:', query);
      
      const response = await apiFetch('/api/proxy/it/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          query: query.trim(),
          user_id: localStorage.getItem('userId') // For logging purposes
        })
      });

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Query execution failed`);
      }

      const data = await response.json();
      console.log('✅ Query result:', data);
      
      setResult({
        columns: data.columns || [],
        rows: data.rows || [],
        rowCount: data.rowCount || 0,
        executionTime
      });

    } catch (err: any) {
      console.error('❌ Query error:', err);
      setError(err.message || 'Failed to execute query');
    } finally {
      setLoading(false);
    }
  };

  const loadPresetQuery = (preset: PresetQuery) => {
    setQuery(preset.query);
    setError('');
    setResult(null);
  };

  const clearQuery = () => {
    setQuery('');
    setResult(null);
    setError('');
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold text-dark mb-1">
            <i className="bi bi-database me-2"></i>
            Database Query Tool
          </h2>
          <p className="text-muted">Execute SQL queries and analyze database data</p>
        </div>
      </div>

      <div className="row">
        {/* Query Input Section */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-code-square me-2"></i>
                SQL Query Editor
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <textarea
                  className="form-control font-monospace"
                  rows={8}
                  placeholder="Enter your SQL query here...&#10;&#10;Example:&#10;SELECT * FROM users LIMIT 10;"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ fontSize: '14px' }}
                />
              </div>
              
              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-success"
                  onClick={executeQuery}
                  disabled={loading || !query.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Executing...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-play-fill me-1"></i>
                      Execute Query
                    </>
                  )}
                </button>
                
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearQuery}
                  disabled={loading}
                >
                  <i className="bi bi-trash me-1"></i>
                  Clear
                </button>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-table me-2"></i>
                  Query Results
                </h5>
                <span className="badge bg-light text-dark">
                  {result.rowCount} rows • {result.executionTime}ms
                </span>
              </div>
              <div className="card-body p-0">
                {result.rowCount === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-info-circle display-4 mb-3"></i>
                    <p>Query executed successfully but returned no results.</p>
                  </div>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: '500px' }}>
                    <table className="table table-striped table-hover mb-0">
                      <thead className="table-dark sticky-top">
                        <tr>
                          {result.columns.map((column, index) => (
                            <th key={index} className="fw-semibold">{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} style={{ fontSize: '13px' }}>
                                {cell === null ? (
                                  <span className="text-muted fst-italic">NULL</span>
                                ) : (
                                  String(cell)
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Preset Queries Section */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="bi bi-bookmark me-2"></i>
                Preset Queries
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'All' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="list-group list-group-flush">
                {filteredQueries.map((preset, index) => (
                  <div
                    key={index}
                    className="list-group-item list-group-item-action p-3 border-0 mb-2 rounded"
                    style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
                    onClick={() => loadPresetQuery(preset)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <h6 className="mb-1 fw-semibold text-primary">
                          {preset.name}
                        </h6>
                        <p className="mb-1 small text-muted">
                          {preset.description}
                        </p>
                        <small className="text-info">
                          <i className="bi bi-tag me-1"></i>
                          {preset.category}
                        </small>
                      </div>
                      <i className="bi bi-chevron-right text-muted"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Query Tips */}
          <div className="card border-0 shadow-sm mt-4">
            <div className="card-header bg-warning">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Query Tips
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled small mb-0">
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  Use <code>LIMIT</code> to restrict large result sets
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle text-success me-2"></i>
                  JOIN tables to get related data
                </li>
                <li className="mb-2">
                  <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                  Be careful with UPDATE/DELETE queries
                </li>
                <li>
                  <i className="bi bi-info-circle text-info me-2"></i>
                  All queries are logged for security
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
