import React from "react";
import SideNav from "../../components/SideNav";
import TopBar from "../../components/TopBar";
import AdminStudentsTab from "../components/AdminStudentsTab";

export default function StudentsPage() {
  return (
    <div className="d-flex min-vh-100 bg-light">
      <SideNav />
      <div className="flex-grow-1">
        <TopBar />
        <main className="container-fluid py-4">
          <AdminStudentsTab />
        </main>
      </div>
    </div>
  );
}