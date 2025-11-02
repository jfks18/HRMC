"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { apiFetch } from '../apiFetch';

const PH_TIMEZONE = 'Asia/Manila';

function getPhilippinesTime() {
  return new Date().toLocaleTimeString('en-US', { timeZone: PH_TIMEZONE });
}

function getPhilippinesDateTime() {
  const now = new Date();
  return {
    time: now.toLocaleTimeString('en-US', { timeZone: PH_TIMEZONE }),
    date: now.toLocaleDateString('en-US', { timeZone: PH_TIMEZONE }),
    fullDateTime: now.toLocaleString('en-US', { timeZone: PH_TIMEZONE })
  };
}

interface TimekeeperClientProps {
  onCodeRecognized?: (code: string, isQR?: boolean) => void;
}

export default function TimekeeperClient({ onCodeRecognized }: TimekeeperClientProps) {
  const scanHandledRef = useRef(false);
  const [phTime, setPhTime] = useState(getPhilippinesTime());
  const [phDateTime, setPhDateTime] = useState(getPhilippinesDateTime());
  const [adminCode, setAdminCode] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPhTime(getPhilippinesTime());
      setPhDateTime(getPhilippinesDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (showCamera && scannerRef.current) {
      scanHandledRef.current = false;
      const scanner = new Html5QrcodeScanner(
        'qr-scanner',
        { fps: 10, qrbox: 250 },
        false
      );
      scanner.render(
        async (decodedText, decodedResult) => {
          if (scanHandledRef.current) return;
          scanHandledRef.current = true;
          setErrorMessage(null);
          try {
            // Submit attendance info after scan using QR code value as userId and adminCode as code
            // Backend will save time using Manila timezone (CONVERT_TZ to +08:00)
            const res = await apiFetch(`/api/proxy/users/${decodedText}/time-log`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: adminCode })
            });
            const data = await res.json();
            if (res.ok) {
              setScanMessage(data.message || 'Time log recorded!');
            } else {
              setErrorMessage(data.error || 'Error logging time.');
            }
          } catch (err) {
            setErrorMessage('Server error. Please try again later.');
          }
          setShowCamera(false);
          setAdminCode('');
          if (onCodeRecognized) onCodeRecognized(decodedText, true);
          scanner.clear();
        },
        (errorMessage) => {
          // handle scan error if needed
        }
      );
      return () => {
        scanner.clear().catch(() => {});
      };
    }
  }, [showCamera, onCodeRecognized, adminCode]);

  useEffect(() => {
    if (scanMessage) {
      const timer = setTimeout(() => setScanMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [scanMessage]);

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setErrorMessage(null);
  if (adminCode) {
    try {
      // Check code with backend using GET /users/check-code/:code
      const res = await apiFetch(`/api/proxy/users/check-code/${adminCode}`);
      const data = await res.json();
      if (res.ok && data.exists) {
        setShowCamera(true);
        setScanMessage('Code matched! Please scan QR to log attendance.');
      } else {
        setErrorMessage('Code does not match any user.');
      }
    } catch (err) {
      setErrorMessage('Server error. Please try again later.');
    }
  }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(120deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '32px',
        boxShadow: '0 12px 48px rgba(44,62,80,0.13)',
        padding: '3rem 2.5rem',
        maxWidth: 480,
        width: '100%',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.3rem', color: '#263238', marginBottom: 16, marginTop: -12 }}>Timekeeper</div>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 700, color: '#1976d2', letterSpacing: 1 }}>{phTime}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#546e7a', marginTop: 4 }}>
            {phDateTime.date} (Manila Time)
          </div>
        </div>
        <form onSubmit={handleCodeSubmit} style={{ marginBottom: 28, width: '100%' }}>
          <label style={{ fontWeight: 600, color: '#263238', marginBottom: 10, display: 'block', fontSize: '1.1rem' }}>Enter Code</label>
          <input
            type="text"
            value={adminCode}
            onChange={e => setAdminCode(e.target.value)}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '10px',
              border: '1px solid #b0bec5',
              marginBottom: 16,
              fontSize: '1.1rem',
              background: '#f5f7fa',
            }}
            required
          />
          <button type="submit" style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '10px',
            background: 'linear-gradient(90deg, #1976d2 0%, #90caf9 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.15rem',
            border: 'none',
            boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
            cursor: 'pointer',
            letterSpacing: 0.5,
          }}>Submit</button>
        </form>
        {scanMessage && (
          <div style={{ marginTop: 16, color: '#2e7d32', fontWeight: 600, fontSize: '1rem' }}>
            {scanMessage}
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-danger mt-2" role="alert">
            {errorMessage}
          </div>
        )}
        {showCamera && (
          <div style={{ marginTop: 28, width: '100%' }}>
            <h5 style={{ color: '#263238', fontWeight: 700, marginBottom: 16, fontSize: '1.1rem' }}>Scan QR to Log In</h5>
            <div id="qr-scanner" ref={scannerRef} style={{ width: '100%', minHeight: 240, borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }} />
            <button
              type="button"
              style={{
                marginTop: 16,
                width: '100%',
                padding: '0.75rem',
                borderRadius: '10px',
                background: '#e53935',
                color: 'white',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
                cursor: 'pointer',
                letterSpacing: 0.5,
              }}
              onClick={() => setShowCamera(false)}
            >Stop Scanning</button>
          </div>
        )}
      </div>
    </div>
  );
}
