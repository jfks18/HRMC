import React from 'react';

export default function UserLogsTable({ logs }: { logs: any[] }) {
  if (!logs || logs.length === 0) return <div>No logs found.</div>;
  return (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Date</th>
          <th>Check In</th>
          <th>Check Out</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log => (
          <tr key={log.id}>
            <td>{log.date}</td>
            <td>{log.check_in}</td>
            <td>{log.check_out}</td>
            <td>{log.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
