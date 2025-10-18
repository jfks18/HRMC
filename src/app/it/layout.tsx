"use client";
import React from 'react';
import SideNav from './components/SideNav';
import TopBar from '../components/TopBar';

export default function ITLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <SideNav />
      <div className="flex-grow-1 d-flex flex-column">
        <TopBar />
        <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
