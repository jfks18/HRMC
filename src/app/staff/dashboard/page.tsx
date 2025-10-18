import React from 'react';
import SideNav from '../components/SideNav';
import TopBar from '../../components/TopBar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import InteractiveCard from '../../components/InteractiveCard';

const StaffDashboard = () => {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <h1 className="fw-bold mb-2" style={{ color: '#1a237e' }}>Staff Dashboard</h1>
          <p className="text-muted mb-4">Welcome back, Staff!</p>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="My Tasks" value={12} icon="bi-list-task" />
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Attendance Rate" value="95%" icon="bi-clipboard-check" />
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Leaves Taken" value={1} icon="bi-calendar-x" />
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Certificates" value={2} icon="bi-award" />
              </InteractiveCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffDashboard;
