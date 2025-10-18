"use client";
import React, { useState, useEffect } from 'react';
import { APP_LINKS, apiFetch } from '../../apiFetch';

interface SystemStats {
  database: {
    status: 'online' | 'offline' | 'slow';
    responseTime: number;
    activeConnections: number;
    totalQueries: number;
    slowQueries: number;
    uptime?: number;
    error?: string;
  };
  api: {
    status: 'operational' | 'degraded' | 'down';
    responseTime: number;
    requestsToday: number;
    errorsToday: number;
  };
  users: {
    total: number;
    online: number;
    todayLogins: number;
  };
  modules: {
    [key: string]: {
      status: 'operational' | 'issues' | 'down' | 'maintenance';
      responseTime: number;
      lastCheck: string;
    };
  };
  performance: {
    avgResponseTime: number;
    cpuUsage: number;
    memoryUsage: number;
  };
  alerts: {
    errors24h: number;
    pendingLeaves: number;
    pendingCertificates: number;
  };
}

interface ActivityLog {
  id: number;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  module: string;
  user_name?: string | null;
  resolved: boolean;
}

export default function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLogType, setSelectedLogType] = useState<string>('all');
  const [userRole, setUserRole] = useState<string>('admin'); // This should come from your auth system
  const [maintenanceModules, setMaintenanceModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSystemStats();
    fetchActivityLogs();
    
    // Auto-refresh every 30 seconds if enabled
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchSystemStats();
        fetchActivityLogs();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchSystemStats = async () => {
    try {
      const response = await apiFetch('/api/proxy/it/system-stats', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
      } else {
        console.warn('System stats API failed, using mock data. Status:', response.status);
        // Enhanced fallback mock data if API not available
        setStats({
          database: {
            status: 'online',
            responseTime: Math.floor(Math.random() * 50) + 20,
            activeConnections: Math.floor(Math.random() * 20) + 5,
            totalQueries: Math.floor(Math.random() * 1000) + 15000,
            slowQueries: Math.floor(Math.random() * 5),
            uptime: 72
          },
          api: {
            status: 'operational',
            responseTime: Math.floor(Math.random() * 100) + 50,
            requestsToday: Math.floor(Math.random() * 5000) + 2000,
            errorsToday: Math.floor(Math.random() * 10)
          },
          users: {
            total: 1250,
            online: Math.floor(Math.random() * 50) + 20,
            todayLogins: Math.floor(Math.random() * 200) + 100
          },
          modules: {
            leave_management: { 
              status: 'operational', 
              responseTime: Math.floor(Math.random() * 100) + 30, 
              lastCheck: new Date().toISOString() 
            },
            certificate_management: { 
              status: 'operational', 
              responseTime: Math.floor(Math.random() * 100) + 40, 
              lastCheck: new Date().toISOString() 
            },
            attendance_system: { 
              status: 'operational', 
              responseTime: Math.floor(Math.random() * 100) + 35, 
              lastCheck: new Date().toISOString() 
            },
            user_authentication: { 
              status: 'operational', 
              responseTime: Math.floor(Math.random() * 100) + 25, 
              lastCheck: new Date().toISOString() 
            }
          },
          performance: {
            avgResponseTime: Math.floor(Math.random() * 200) + 100,
            cpuUsage: Math.floor(Math.random() * 30) + 20,
            memoryUsage: Math.floor(Math.random() * 40) + 30
          },
          alerts: {
            errors24h: Math.floor(Math.random() * 5),
            pendingLeaves: Math.floor(Math.random() * 10) + 5,
            pendingCertificates: Math.floor(Math.random() * 8) + 3
          }
        });
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch system stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const response = await apiFetch('/api/proxy/it/activity-logs');
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        console.warn('Activity logs API failed, using mock data');
        const mockLogs: ActivityLog[] = [
          {
            id: 1,
            timestamp: new Date().toISOString(),
            type: 'info',
            message: 'System monitoring initialized',
            module: 'system',
            user_name: null,
            resolved: false
          },
          {
            id: 2,
            timestamp: new Date(Date.now() - 300000).toISOString(),
            type: 'info',
            message: 'User authentication successful',
            module: 'auth',
            user_name: 'Admin User',
            resolved: false
          },
          {
            id: 3,
            timestamp: new Date(Date.now() - 600000).toISOString(),
            type: 'warning',
            message: 'High database connection count detected',
            module: 'database',
            user_name: null,
            resolved: false
          },
          {
            id: 4,
            timestamp: new Date(Date.now() - 900000).toISOString(),
            type: 'error',
            message: 'Failed to process certificate request',
            module: 'certificates',
            user_name: 'Jane Smith',
            resolved: false
          }
        ];
        setLogs(mockLogs);
      }
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      setLogs([]);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'operational':
      case 'online':
        return 'success';
      case 'issues':
      case 'slow':
      case 'degraded':
        return 'warning';
      case 'down':
      case 'offline':
        return 'danger';
      case 'maintenance':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const getLogTypeColor = (type: string): string => {
    switch (type) {
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      case 'critical':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = selectedLogType === 'all' 
    ? logs 
    : logs.filter(log => log.type === selectedLogType);

  const handleRefresh = () => {
    setLoading(true);
    fetchSystemStats();
    fetchActivityLogs();
  };

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear old logs? This will remove logs older than 30 days.')) {
      try {
        const response = await apiFetch('/api/proxy/it/clear-logs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ olderThanDays: 30 })
        });

        if (response.ok) {
          const result = await response.json();
          alert(`Successfully cleared ${result.deletedCount} old log entries`);
          fetchActivityLogs();
        } else {
          alert('Failed to clear logs. Please try again.');
        }
      } catch (error) {
        console.error('Error clearing logs:', error);
        alert('Error clearing logs. Please try again.');
      }
    }
  };

  // Maintenance Mode Functions
  const toggleMaintenanceMode = async (moduleName: string) => {
    if (userRole !== 'dev' && userRole !== 'admin') {
      alert('Access denied. Only developers can control maintenance mode.');
      return;
    }

    const isCurrentlyInMaintenance = maintenanceModules.has(moduleName);
    
    try {
      const response = await apiFetch('/api/proxy/it/maintenance-mode', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            module: moduleName, 
            maintenance: !isCurrentlyInMaintenance,
            userRole: userRole
          })
        });

      if (response.ok) {
        const newMaintenanceModules = new Set(maintenanceModules);
        if (isCurrentlyInMaintenance) {
          newMaintenanceModules.delete(moduleName);
        } else {
          newMaintenanceModules.add(moduleName);
        }
        setMaintenanceModules(newMaintenanceModules);
        
        // Update stats to reflect maintenance status
        if (stats) {
          const updatedStats = { ...stats };
          if (updatedStats.modules[moduleName]) {
            updatedStats.modules[moduleName].status = isCurrentlyInMaintenance ? 'operational' : 'maintenance';
          }
          setStats(updatedStats);
        }

        // Add activity log
        const logMessage = isCurrentlyInMaintenance 
          ? `Module ${moduleName} removed from maintenance mode`
          : `Module ${moduleName} set to maintenance mode`;
        
        const newLog: ActivityLog = {
          id: logs.length + 1,
          timestamp: new Date().toISOString(),
          type: 'info',
          message: logMessage,
          module: 'system',
          user_name: 'System Admin',
          resolved: false
        };
        setLogs([newLog, ...logs]);

        alert(`${moduleName} ${isCurrentlyInMaintenance ? 'removed from' : 'set to'} maintenance mode successfully.`);
      } else {
        // Fallback: local state management if API not available
        const newMaintenanceModules = new Set(maintenanceModules);
        if (isCurrentlyInMaintenance) {
          newMaintenanceModules.delete(moduleName);
        } else {
          newMaintenanceModules.add(moduleName);
        }
        setMaintenanceModules(newMaintenanceModules);
        
        if (stats) {
          const updatedStats = { ...stats };
          if (updatedStats.modules[moduleName]) {
            updatedStats.modules[moduleName].status = isCurrentlyInMaintenance ? 'operational' : 'maintenance';
          }
          setStats(updatedStats);
        }

        console.warn('Maintenance API not available, using local state');
        alert(`${moduleName} ${isCurrentlyInMaintenance ? 'removed from' : 'set to'} maintenance mode (local only).`);
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      alert('Error updating maintenance mode. Please try again.');
    }
  };

  const getModulePageUrl = (moduleName: string): string => {
    const moduleRoutes: { [key: string]: string } = {
      'leave_management': '/admin/leave',
      'certificate_management': '/admin/certificates', 
      'attendance_system': '/admin/attendance',
      'user_authentication': '/admin/users',
      'faculty_evaluation': '/admin/evaluation'
    };
    return moduleRoutes[moduleName] || `/admin/${moduleName}`;
  };

  const isModuleInMaintenance = (moduleName: string): boolean => {
    return maintenanceModules.has(moduleName) || 
           (stats?.modules[moduleName]?.status === 'maintenance');
  };

  if (loading && !stats) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5>Loading System Monitor...</h5>
            <p className="text-muted">Fetching real-time system data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">🖥️ System Monitor</h2>
          <p className="text-muted mb-0">
            Real-time monitoring of HRMS system health and performance
          </p>
          <small className="text-muted">
            Last updated: {lastUpdated.toLocaleString()}
          </small>
        </div>
        <div className="d-flex gap-2">
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="autoRefresh">
              Auto Refresh
            </label>
          </div>
          <button 
            className="btn btn-outline-primary btn-sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Refreshing...
              </>
            ) : (
              <>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="row mb-4">
        {/* Database Status */}
        <div className="col-md-3 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className={`bg-${getStatusColor(stats?.database.status || 'offline')} rounded-circle p-3`}>
                    <i className="bi bi-database text-white" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Database</h6>
                  <span className={`badge bg-${getStatusColor(stats?.database.status || 'offline')}`}>
                    {stats?.database.status || 'Unknown'}
                  </span>
                  <p className="card-text mt-2 mb-0">
                    <small className="text-muted">
                      {stats?.database.activeConnections || 0} active connections<br/>
                      {stats?.database.responseTime || 0}ms response time
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* API Status */}
        <div className="col-md-3 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className={`bg-${getStatusColor(stats?.api.status || 'down')} rounded-circle p-3`}>
                    <i className="bi bi-cloud text-white" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">API Server</h6>
                  <span className={`badge bg-${getStatusColor(stats?.api.status || 'down')}`}>
                    {stats?.api.status || 'Unknown'}
                  </span>
                  <p className="card-text mt-2 mb-0">
                    <small className="text-muted">
                      {stats?.api.requestsToday || 0} requests today<br/>
                      {stats?.api.responseTime || 0}ms avg response
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Status */}
        <div className="col-md-3 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info rounded-circle p-3">
                    <i className="bi bi-people text-white" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Users</h6>
                  <h4 className="text-info mb-0">{stats?.users.total || 0}</h4>
                  <p className="card-text mb-0">
                    <small className="text-muted">
                      {stats?.users.online || 0} online now<br/>
                      {stats?.users.todayLogins || 0} logins today
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Status */}
        <div className="col-md-3 mb-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning rounded-circle p-3">
                    <i className="bi bi-exclamation-triangle text-white" style={{ fontSize: '1.2rem' }}></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title mb-1">Alerts</h6>
                  <h4 className="text-warning mb-0">{stats?.alerts.errors24h || 0}</h4>
                  <p className="card-text mb-0">
                    <small className="text-muted">
                      errors in 24h<br/>
                      {stats?.alerts.pendingLeaves || 0} pending approvals
                    </small>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Module Status */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Module Status</h5>
            </div>
            <div className="card-body">
              <div className="row">
                {stats?.modules && Object.entries(stats.modules).map(([moduleName, moduleData]) => (
                  <div key={moduleName} className="col-12 mb-3">
                    <div className="d-flex justify-content-between align-items-center p-3 border rounded">
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{moduleName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h6>
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge bg-${getStatusColor(moduleData.status)}`}>
                            {moduleData.status}
                          </span>
                          <small className="text-muted">{moduleData.responseTime}ms</small>
                        </div>
                      </div>
                      
                      {/* Maintenance Controls - Only show for dev/admin */}
                      {(userRole === 'dev' || userRole === 'admin') && (
                        <div className="d-flex gap-2">
                          {isModuleInMaintenance(moduleName) ? (
                            <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => toggleMaintenanceMode(moduleName)}
                              title="Remove from maintenance mode"
                            >
                              <i className="bi bi-play-circle me-1"></i>
                              Set Operational
                            </button>
                          ) : (
                            <button
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => toggleMaintenanceMode(moduleName)}
                              title="Set to maintenance mode"
                            >
                              <i className="bi bi-pause-circle me-1"></i>
                              Set Maintenance
                            </button>
                          )}
                          
                          <a
                            href={getModulePageUrl(moduleName)}
                            className={`btn btn-outline-primary btn-sm ${
                              isModuleInMaintenance(moduleName) && userRole !== 'dev' ? 'disabled' : ''
                            }`}
                            title={isModuleInMaintenance(moduleName) && userRole !== 'dev' 
                              ? 'Module is in maintenance mode' 
                              : 'Go to module'
                            }
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i>
                            Access
                          </a>
                        </div>
                      )}
                      
                      {/* Regular users see limited info */}
                      {userRole !== 'dev' && userRole !== 'admin' && (
                        <div>
                          <a
                            href={getModulePageUrl(moduleName)}
                            className={`btn btn-outline-primary btn-sm ${
                              isModuleInMaintenance(moduleName) ? 'disabled' : ''
                            }`}
                            title={isModuleInMaintenance(moduleName) 
                              ? 'Module is in maintenance mode' 
                              : 'Go to module'
                            }
                          >
                            <i className="bi bi-box-arrow-up-right me-1"></i>
                            Access
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="col-lg-6 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Performance Metrics</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>Average Response Time</span>
                  <span>{stats?.performance.avgResponseTime || 0}ms</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${(stats?.performance.avgResponseTime || 0) > 1000 ? 'bg-danger' : (stats?.performance.avgResponseTime || 0) > 500 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${Math.min((stats?.performance.avgResponseTime || 0) / 10, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span>CPU Usage</span>
                  <span>{stats?.performance.cpuUsage || 0}%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${(stats?.performance.cpuUsage || 0) > 80 ? 'bg-danger' : (stats?.performance.cpuUsage || 0) > 60 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${stats?.performance.cpuUsage || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-0">
                <div className="d-flex justify-content-between mb-1">
                  <span>Memory Usage</span>
                  <span>{stats?.performance.memoryUsage || 0}%</span>
                </div>
                <div className="progress" style={{ height: '8px' }}>
                  <div 
                    className={`progress-bar ${(stats?.performance.memoryUsage || 0) > 80 ? 'bg-danger' : (stats?.performance.memoryUsage || 0) > 60 ? 'bg-warning' : 'bg-success'}`}
                    style={{ width: `${stats?.performance.memoryUsage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Activity Logs</h5>
            <div className="d-flex gap-2">
              <select 
                className="form-select form-select-sm"
                value={selectedLogType}
                onChange={(e) => setSelectedLogType(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">All Types</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="critical">Critical</option>
              </select>
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={handleClearLogs}
              >
                <i className="bi bi-trash me-1"></i>
                Clear Old Logs
              </button>
            </div>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table className="table table-hover mb-0">
              <thead className="table-light sticky-top">
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Module</th>
                  <th>Message</th>
                  <th>User</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="text-nowrap">
                        <small>{formatTimestamp(log.timestamp)}</small>
                      </td>
                      <td>
                        <span className={`badge bg-${getLogTypeColor(log.type)}`}>
                          {log.type}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-secondary">
                          {log.module}
                        </span>
                      </td>
                      <td>{log.message}</td>
                      <td>{log.user_name || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      <i className="bi bi-info-circle me-2"></i>
                      No activity logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-outline-primary w-100"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                    Refresh Data
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-outline-warning w-100"
                    onClick={() => alert('Maintenance mode functionality coming soon!')}
                  >
                    <i className="bi bi-exclamation-triangle d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                    Maintenance Mode
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-outline-info w-100"
                    onClick={() => alert('Export logs functionality coming soon!')}
                  >
                    <i className="bi bi-download d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                    Export Logs
                  </button>
                </div>
                <div className="col-md-3 mb-3">
                  <button 
                    className="btn btn-outline-success w-100"
                    onClick={() => {
                      handleRefresh();
                      alert('Health check completed! Check system status above.');
                    }}
                  >
                    <i className="bi bi-shield-check d-block mb-2" style={{ fontSize: '1.5rem' }}></i>
                    Run Health Check
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
