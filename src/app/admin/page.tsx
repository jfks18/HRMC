"use client";
import React, { useState } from "react";
import SideNav from "../components/SideNav";
import TopBar from "../components/TopBar";
import AdminStudentsTab from "./components/AdminStudentsTab";
import LeaveTable from "./leave/components/LeaveTable";
import DashboardCard from "../components/DashboardCard/DashboardCard";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "leave", label: "Leave Management" },
  { key: "students", label: "Student Management" }
];

export default function AdminTabbedPage() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <ul className="nav nav-tabs mb-4">
            {TABS.map(tab => (
              <li className="nav-item" key={tab.key}>
                <button
                  className={`nav-link${activeTab === tab.key ? " active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
          <div>
            {activeTab === "dashboard" && (
              <div>
                <DashboardCard title="Total Users" value={0} icon="bi-people" subtitle="Active system users" />
                {/* ...existing dashboard content... */}
              </div>
            )}
            {activeTab === "leave" && <LeaveTable />}
            {activeTab === "students" && <AdminStudentsTab />}
          </div>
        </main>
      </div>
    </div>
  );
}
