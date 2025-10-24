"use client"
import React from 'react';
import TopBar from '../../components/TopBar';
import SideNav from '../../components/SideNav';
import EvaluationStatsCards from './components/EvaluationStatsCards';
import EvaluationSearchFilter from './components/EvaluationSearchFilter';
import EvaluationTable from './components/EvaluationTable';
import GlobalModal, { GlobalModalField } from '../../components/GlobalModal';
import { apiFetch } from '../../apiFetch';

export default function EvaluationPage() {
  const [showModal, setShowModal] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [professors, setProfessors] = React.useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = React.useState<{ query?: string; department?: string; status?: string }>({});

  React.useEffect(() => {
    if (showModal) {
      apiFetch('/api/proxy/users/professors')
        .then((res: Response) => res.json())
        .then((data: { id: string; name: string }[]) => setProfessors(data))
        .catch(() => setProfessors([]));
    }
  }, [showModal]);

  const fields: GlobalModalField[] = [
    {
      key: "teacher_id",
      label: "Teacher ID",
      type: "select",
      value: "",
      options: professors.map(p => ({ value: p.id, label: p.name }))
    },
  ];

  async function handleCreateEvaluation(teacher_id: string) {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch('/api/proxy/evaluation/create', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ teacher_id })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Submission failed");
      } else {
        setShowModal(false);
      }
    } catch (err: any) {
      setError(err.message || "Submission failed");
    }
    setLoading(false);
  }

  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <div className="d-flex align-items-center mb-1">
            <h1 className="fw-bold mb-0 me-auto" style={{ color: '#1a237e' }}>Faculty Evaluation</h1>
            <button className="btn btn-dark d-flex align-items-center gap-2" onClick={() => setShowModal(true)}><i className="bi bi-plus-circle"></i> New Evaluation</button>
          </div>
          <div className="text-muted mb-4">Evaluate faculty performance and view evaluation reports</div>
          <EvaluationTable filters={filters} />
        </main>
        <GlobalModal
          show={showModal}
          title="Create Evaluation"
          fields={fields}
          onClose={() => setShowModal(false)}
          onSubmit={(data) => handleCreateEvaluation(data.teacher_id)}
          submitText={loading ? "Submitting..." : "Submit Evaluation"}
          cancelText="Cancel"
        />
        {error && <div style={{ color: "#e53935", marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  );
}