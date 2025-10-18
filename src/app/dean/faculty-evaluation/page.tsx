
import React from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../components/SideNav';
import FacultyEvaluationTable from './facultyevaluationtable';

export default function FacultyEvaluationPage() {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <h1 className="fw-bold mb-1" style={{ color: '#1a237e' }}>Faculty Evaluation</h1>
          <div className="text-muted mb-4">Manage and review faculty evaluations</div>
          {/* You can add a search filter and table here similar to Leave */}
          <FacultyEvaluationTable/>
          
        </main>
      </div>
    </div>
  );
}
