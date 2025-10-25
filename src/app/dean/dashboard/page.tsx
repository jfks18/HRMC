import React from 'react';
import Image from 'next/image';
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
                    <div className="d-flex flex-column align-items-center justify-content-center text-center perspective-1000" style={{ minHeight: '70vh' }}>
                      <div className="spin-3d-viewport">
                        <div className="spin-3d-inner">
                          <div className="spin-3d-face spin-3d-front">
                            <Image src="/gwclogo.png" alt="GWC Logo" fill priority style={{ objectFit: 'contain' }} />
                          </div>
                          <div className="spin-3d-face spin-3d-back">
                            {/* Flip horizontally so the logo reads correctly when the back faces forward */}
                            <Image src="/gwclogo.png" alt="GWC Logo" fill priority style={{ objectFit: 'contain', transform: 'scaleX(-1)' }} />
                          </div>
                        </div>
                      </div>
                       <h1 className="fw-bold mb-2" style={{ color: '#1a237e' }}>Dean Dashboard</h1>
          <p className="text-muted mb-4">Welcome back, Dean!</p>
                    </div>
                  </main>
        
      </div>
    </div>
  );
};

export default DeanDashboard;
