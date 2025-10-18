"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();``

  const handleLogout = () => {
  // Remove JWT cookie
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  // Clear user info from localStorage
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  setShowMenu(false);
  router.replace('/');
  };

  // Get user info from localStorage
  let userName = '';
  let userRole = '';
  if (typeof window !== 'undefined') {
    userName = localStorage.getItem('userName') || '';
    userRole = localStorage.getItem('userRole') || '';
  }

  return (
    <nav className="navbar navbar-expand bg-white shadow-sm px-4 py-2 align-items-center" style={{ minHeight: 64 }}>
      <form className="d-flex flex-grow-1 me-3" role="search">
        <input className="form-control rounded-pill bg-light border-0" type="search" placeholder="Search..." aria-label="Search" style={{ maxWidth: 320 }} />
      </form>
      <div className="d-flex align-items-center gap-3 ms-auto position-relative">
        <div className="d-flex flex-column align-items-end me-2">
          <span className="fw-semibold" style={{ color: '#1a237e' }}>{userName || 'User'}</span>
          <span className="text-muted small">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Role'}</span>
        </div>
        <div className="dropdown">
          <button className="bg-secondary text-white rounded-circle border-0 d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }} onClick={() => setShowMenu(v => !v)}>
            <span>SJ</span>
          </button>
          {showMenu && (
            <ul className="dropdown-menu show" style={{ right: 0, left: 'auto', minWidth: 140 }}>
              <li><a className="dropdown-item" href="#">Profile</a></li>
              <li><a className="dropdown-item" href="#">Settings</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <button className="dropdown-item text-danger" onClick={handleLogout} type="button">Logout</button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
