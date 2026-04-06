import React from 'react';
import { FaMotorcycle } from 'react-icons/fa';

/** Shown while Firebase resolves the auth session on first load */
export const BootScreen: React.FC = () => (
  <div
    style={{
      minHeight: '100vh',
      background: '#0F172A',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}
  >
    <div
      style={{
        width: 60,
        height: 60,
        borderRadius: 18,
        background: '#F59E0B',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 0 0 0 rgba(245,158,11,0.5)',
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0.5); }
          50%       { box-shadow: 0 0 0 14px rgba(245,158,11,0); }
        }
      `}</style>
      <FaMotorcycle size={28} color="#fff" />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Oye Rides</div>
      <div style={{ fontSize: 13, color: '#6B7280' }}>Checking session…</div>
    </div>
  </div>
);
