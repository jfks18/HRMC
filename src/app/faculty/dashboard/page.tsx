import React from 'react';
import SideNav from '../components/SideNav';
import TopBar from '../../components/TopBar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import InteractiveCard from '../../components/InteractiveCard';

const FacultyDashboard = () => {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <h1 className="fw-bold mb-2" style={{ color: '#1a237e' }}>Faculty Dashboard</h1>
          <p className="text-muted mb-4">Welcome back, Faculty!</p>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="My Classes" value={6} icon="bi-journal-bookmark" />
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Attendance Rate" value="97%" icon="bi-clipboard-check" />
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Leaves Taken" value={2} icon="bi-calendar-x" />
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Certificates" value={3} icon="bi-award" />
              </InteractiveCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyDashboard;
