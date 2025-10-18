import React from 'react';
import SideNav from '../components/SideNav';
import TopBar from '../../components/TopBar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import InteractiveCard from '../../components/InteractiveCard';

const DeanDashboard = () => {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <h1 className="fw-bold mb-2" style={{ color: '#1a237e' }}>Dean Dashboard</h1>
          <p className="text-muted mb-4">Welcome back, Dean!</p>
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Total Faculty" value={48} icon="bi-people"/>
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Active Evaluations" value={12} icon="bi-clipboard-check" />
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Pending Leaves" value={5} icon="bi-hourglass-split" />
              </InteractiveCard>
            </div>
            <div className="col-md-3">
              <InteractiveCard>
                <DashboardCard title="Faculty Attendance" value="98%" icon="bi-graph-up" />
              </InteractiveCard>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="card h-100 shadow-sm border-0" style={{ background: '#f8fafd' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3" style={{ color: '#1a237e' }}>Recent Activity</h5>
                  {/* Add RecentActivity here */}
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 shadow-sm border-0" style={{ background: '#f8fafd' }}>
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3" style={{ color: '#1a237e' }}>Quick Actions</h5>
                  {/* Add QuickActions here */}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DeanDashboard;
