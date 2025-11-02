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

  // Generate initials from username
  const getUserInitials = (name: string) => {
    if (!name || name.trim() === '') return 'U'; // Default to 'U' for User if no name
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      // Single name - take first two characters
      return nameParts[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple names - take first letter of first and last name
      const firstInitial = nameParts[0].charAt(0).toUpperCase();
      const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
      return firstInitial + lastInitial;
    }
  };

  const userInitials = getUserInitials(userName);

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
          <button 
            className="bg-secondary text-white rounded-circle border-0 d-flex align-items-center justify-content-center fw-semibold" 
            style={{ 
              width: 40, 
              height: 40, 
              fontSize: '0.875rem',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              border: 'none',
              boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)'
            }} 
            onClick={() => setShowMenu(v => !v)}
            title={`${userName || 'User'} Profile`}
          >
            <span>{userInitials}</span>
          </button>
          {showMenu && (
            <ul 
              className="dropdown-menu show" 
              style={{ 
                right: 0, 
                left: 'auto', 
                minWidth: 180,
                marginTop: '8px',
                borderRadius: '12px',
                border: '1px solid #e0e0e0',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              <li className="px-3 py-2 border-bottom">
                <div className="fw-semibold text-dark">{userName || 'User'}</div>
                <div className="text-muted small">{userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Role'}</div>
              </li>
              <li>
                <button 
                  className="dropdown-item text-danger py-2" 
                  onClick={handleLogout} 
                  type="button"
                  style={{ borderRadius: '8px' }}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
}
