"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../apiFetch';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  code: string;
  role_name: string;
  department_name: string;
  created_at: string;
}

export default function TopBar() {
  const [showMenu, setShowMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const router = useRouter();``

  const handleLogout = () => {
  // Remove JWT cookie
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  // Clear user info from localStorage
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  setShowMenu(false);
  router.replace('/');
  };

  const fetchUserProfile = async () => {
    const userId = localStorage.getItem('userId');
    console.log('Fetching profile for userId:', userId);
    if (!userId) {
      console.error('No userId found in localStorage');
      return;
    }
    
    setIsLoadingProfile(true);
    try {
      const url = `/api/proxy/users/${userId}/profile`;
      console.log('Fetching from URL:', url);
      const response = await apiFetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const profile = await response.json();
        console.log('Profile data:', profile);
        setUserProfile(profile);
      } else {
        const errorData = await response.json();
        console.error('Failed to fetch user profile:', errorData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleShowProfile = () => {
    setShowMenu(false);
    setShowProfileModal(true);
    fetchUserProfile();
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;
    
    setIsUpdatingPassword(true);
    try {
      const response = await apiFetch(`/api/proxy/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setPasswordSuccess('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordError(result.error || 'Failed to update password');
      }
    } catch (error) {
      setPasswordError('Error updating password');
      console.error('Error updating password:', error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCloseModal = () => {
    setShowProfileModal(false);
    setUserProfile(null);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordError('');
    setPasswordSuccess('');
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
    <nav className="navbar navbar-expand bg-white shadow-sm px-4 py-2 align-items-center justify-content-end" style={{ minHeight: 64 }}>
      <div className="d-flex align-items-center gap-3 position-relative">
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
                  className="dropdown-item py-2" 
                  onClick={handleShowProfile}
                  type="button"
                  style={{ borderRadius: '8px' }}
                >
                  <i className="bi bi-person me-2"></i>Profile
                </button>
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div 
          className="modal fade show" 
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', borderRadius: '12px 12px 0 0' }}>
                <h5 className="modal-title text-white fw-semibold">
                  <i className="bi bi-person-circle me-2"></i>User Profile
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                {isLoadingProfile ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : userProfile ? (
                  <div className="row">
                    {/* User Information */}
                    <div className="col-md-6">
                      <h6 className="fw-semibold text-primary mb-3">
                        <i className="bi bi-info-circle me-2"></i>Profile Information
                      </h6>
                      <div className="bg-light p-3 rounded mb-3">
                        <div className="mb-2">
                          <strong className="text-muted small">ID:</strong>
                          <div className="fw-semibold">{userProfile.id}</div>
                        </div>
                        <div className="mb-2">
                          <strong className="text-muted small">Name:</strong>
                          <div className="fw-semibold">{userProfile.name}</div>
                        </div>
                        <div className="mb-2">
                          <strong className="text-muted small">Email:</strong>
                          <div className="fw-semibold">{userProfile.email}</div>
                        </div>
                        <div className="mb-2">
                          <strong className="text-muted small">Code:</strong>
                          <div className="fw-semibold">{userProfile.code}</div>
                        </div>
                        <div className="mb-2">
                          <strong className="text-muted small">Role:</strong>
                          <div className="fw-semibold">{userProfile.role_name || 'No Role'}</div>
                        </div>
                        <div className="mb-2">
                          <strong className="text-muted small">Department:</strong>
                          <div className="fw-semibold">{userProfile.department_name || 'No Department'}</div>
                        </div>
                        <div>
                          <strong className="text-muted small">Member Since:</strong>
                          <div className="fw-semibold">{new Date(userProfile.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Password Change Form */}
                    <div className="col-md-6">
                      <h6 className="fw-semibold text-primary mb-3">
                        <i className="bi bi-shield-lock me-2"></i>Change Password
                      </h6>
                      <form onSubmit={handlePasswordUpdate}>
                        <div className="mb-3">
                          <label htmlFor="currentPassword" className="form-label small fw-semibold">Current Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            required
                            style={{ borderRadius: '8px' }}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="newPassword" className="form-label small fw-semibold">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="newPassword"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            required
                            minLength={6}
                            style={{ borderRadius: '8px' }}
                          />
                        </div>
                        <div className="mb-3">
                          <label htmlFor="confirmPassword" className="form-label small fw-semibold">Confirm New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            required
                            minLength={6}
                            style={{ borderRadius: '8px' }}
                          />
                        </div>
                        
                        {passwordError && (
                          <div className="alert alert-danger py-2" style={{ borderRadius: '8px' }}>
                            <small><i className="bi bi-exclamation-triangle me-1"></i>{passwordError}</small>
                          </div>
                        )}
                        
                        {passwordSuccess && (
                          <div className="alert alert-success py-2" style={{ borderRadius: '8px' }}>
                            <small><i className="bi bi-check-circle me-1"></i>{passwordSuccess}</small>
                          </div>
                        )}
                        
                        <button 
                          type="submit" 
                          className="btn btn-primary w-100"
                          disabled={isUpdatingPassword}
                          style={{ borderRadius: '8px' }}
                        >
                          {isUpdatingPassword ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Updating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-key me-2"></i>Update Password
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-muted">Failed to load profile information</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
