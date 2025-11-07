import React from 'react';

const PH_TZ = 'Asia/Manila';

// Format time in Philippine Time. Handles TIME strings and DATETIME strings.
function formatTime(timeString: string | null) {
  if (!timeString) return '-';
  
  try {
    // Full datetime string (treat as absolute instant; render in PH timezone)
    if (timeString.includes('T') || timeString.includes(' ')) {
      const dt = new Date(timeString);
      if (isNaN(dt.getTime())) return timeString;
      const formatted = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: PH_TZ });
      return `${formatted} PHT`;
    }

    // TIME-only string (assume this is wall-clock PH time already). Format without Date.
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      const hour = parseInt(parts[0] || '0', 10);
      const minute = parts[1] || '00';
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const h12 = ((hour % 12) || 12);
      return `${h12}:${minute} ${ampm} PHT`;
    }

    return timeString; // Fallback
  } catch (error) {
    console.error('Error formatting time:', error, 'Original value:', timeString);
    return timeString; // Return original if parsing fails
  }
}

function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: PH_TZ,
    });
  } catch (error) {
    return dateString;
  }
}

export default function UserLogsTable({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#666',
        fontStyle: 'italic'
      }}>
        No attendance logs found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>Date</th>
            <th>Time In</th>
            <th>Time Out</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{formatDate(log.date)}</td>
              <td>{formatTime(log.time_in || log.check_in)}</td>
              <td>{formatTime(log.time_out || log.check_out)}</td>
              <td>
                <span 
                  className={`badge ${
                    log.status === 'Present' ? 'bg-success' : 
                    log.status === 'Late' ? 'bg-warning' : 
                    'bg-secondary'
                  }`}
                >
                  {log.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
