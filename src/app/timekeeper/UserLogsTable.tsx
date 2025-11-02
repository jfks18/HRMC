import React from 'react';

// Format time to ensure proper display (backend already saves in Manila time)
function formatTime(timeString: string | null) {
  if (!timeString) return '-';
  
  try {
    let timeToFormat: Date;
    
    // Handle different time string formats
    if (timeString.includes('T') || timeString.includes(' ')) {
      // Full datetime string (e.g., "2024-11-02T14:30:00" or "2024-11-02 14:30:00")
      timeToFormat = new Date(timeString);
    } else if (timeString.includes(':')) {
      // Time only string (e.g., "14:30:00")
      // Create a date object with today's date and the provided time
      const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
      timeToFormat = new Date(`${today}T${timeString}`);
    } else {
      return timeString; // Return as-is if format is unrecognized
    }
    
    // Check if the date is valid
    if (isNaN(timeToFormat.getTime())) {
      return timeString;
    }
    
    // Format to 12-hour format with AM/PM
    const formattedTime = timeToFormat.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    return `${formattedTime} PHT`;
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
      day: 'numeric'
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
