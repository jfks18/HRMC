import React from 'react';
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div style={{ maxWidth: 700, margin: '64px auto', textAlign: 'center', padding: 24 }}>
      <div style={{ background: '#e8f5e9', border: '2px solid #2e7d32', borderRadius: 12, padding: 32 }}>
        <h1 style={{ color: '#2e7d32', marginBottom: 8 }}>Thank you for completing the evaluation!</h1>
        <p style={{ color: '#2e7d32', fontWeight: 600 }}>Your responses have been saved successfully.</p>
        <div style={{ marginTop: 20 }}>
          <Link href="/evaluation" style={{ display: 'inline-block', background: '#1976d2', color: '#fff', padding: '10px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
            Return to Evaluation Login
          </Link>
        </div>
      </div>
    </div>
  );
}
