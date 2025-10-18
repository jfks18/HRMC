// Main Next.js app links (routes)
// Base URL: https://active-upward-sunbeam.ngrok-free.app/

export const APP_LINKS = {
  adminDashboard: 'https://active-upward-sunbeam.ngrok-free.app/admin/dashboard',
  adminUsers: 'https://active-upward-sunbeam.ngrok-free.app/admin/users',
  adminAttendance: 'https://active-upward-sunbeam.ngrok-free.app/admin/attendance',
  adminLeave: 'https://active-upward-sunbeam.ngrok-free.app/admin/leave',
  adminCertificates: 'https://active-upward-sunbeam.ngrok-free.app/admin/certificates',
  adminEvaluation: 'https://active-upward-sunbeam.ngrok-free.app/admin/evaluation',
  deanDashboard: 'https://active-upward-sunbeam.ngrok-free.app/dean/dashboard',
  deanAttendance: 'https://active-upward-sunbeam.ngrok-free.app/dean/attendance',
  deanLeave: 'https://active-upward-sunbeam.ngrok-free.app/dean/leave',
  deanCertificate: 'https://active-upward-sunbeam.ngrok-free.app/dean/dean-certificate',
  deanFacultyEvaluation: 'https://active-upward-sunbeam.ngrok-free.app/dean/faculty-evaluation',
  deanLeaveManagement: 'https://active-upward-sunbeam.ngrok-free.app/dean/leave-management',
  facultyDashboard: 'https://active-upward-sunbeam.ngrok-free.app/faculty/dashboard',
  facultyAttendance: 'https://active-upward-sunbeam.ngrok-free.app/faculty/attendance',
  facultyLeaveManagement: 'https://active-upward-sunbeam.ngrok-free.app/faculty/leave-management',
  facultyCertificateManagement: 'https://active-upward-sunbeam.ngrok-free.app/faculty/certificate-management',
  staffDashboard: 'https://active-upward-sunbeam.ngrok-free.app/staff/dashboard',
  staffAttendance: 'https://active-upward-sunbeam.ngrok-free.app/staff/attendance',
  staffLeaveManagement: 'https://active-upward-sunbeam.ngrok-free.app/staff/leave-management',
  staffCertificateManagement: 'https://active-upward-sunbeam.ngrok-free.app/staff/certificate-management',
  timekeeper: 'https://active-upward-sunbeam.ngrok-free.app/timekeeper',
  login: 'https://active-upward-sunbeam.ngrok-free.app/',
  // IT Management API endpoints
  itSystemStats: 'https://active-upward-sunbeam.ngrok-free.app/it/system-stats',
  itActivityLogs: 'https://active-upward-sunbeam.ngrok-free.app/it/activity-logs',
  itDatabaseQuery: 'https://active-upward-sunbeam.ngrok-free.app/it/query',
  itClearLogs: 'https://active-upward-sunbeam.ngrok-free.app/it/clear-logs',
  itMaintenanceMode: 'https://active-upward-sunbeam.ngrok-free.app/it/maintenance-mode',
  itMaintenanceStatus: 'https://active-upward-sunbeam.ngrok-free.app/it/maintenance-status',
};

export async function apiFetch(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
    'ngrok-skip-browser-warning': 'true',
  };

  // Attach Authorization when running in the browser and a token exists
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore in non-browser envs
  }

  return fetch(url, { ...options, headers });
}
