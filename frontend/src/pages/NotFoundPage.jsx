import React from 'react';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFoundPage = ({ onGoHome }) => {
  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(244, 63, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', marginBottom: '20px' }}>
        <AlertTriangle size={36} />
      </div>

      <h1 style={{ fontSize: '3rem', fontWeight: '900', margin: '0 0 12px 0', background: 'linear-gradient(90deg, #f43f5e, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        404 Page Not Found
      </h1>

      <p style={{ color: '#9ca3af', maxWidth: '440px', margin: '0 0 28px 0', lineHeight: '1.5' }}>
        The requested financial route or intelligence view does not exist.
      </p>

      <button className="btn btn-primary" onClick={onGoHome} style={{ gap: '8px' }}>
        <Home size={18} /> Return to Dashboard
      </button>
    </div>
  );
};
