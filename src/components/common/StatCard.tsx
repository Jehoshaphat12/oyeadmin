import React, { type ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  bg: string;
  num: string | number;
  label: string;
  change: string;
  up: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, bg, num, label, change, up }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18, textAlign: 'left' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#374151' }}>
        {icon}
      </div>
      <span style={{ background: up ? '#D1FAE5' : '#FEE2E2', color: up ? '#065F46' : '#7F1D1D', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
        {up ? '↑' : '↓'}
      </span>
    </div>
    <div style={{ fontSize: 26, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{num}</div>
    <div style={{ fontSize: 12, color: '#6B7280', margin: '4px 0 8px' }}>{label}</div>
    <div style={{ fontSize: 11, color: '#059669', background: '#D1FAE5', borderRadius: 20, padding: '2px 8px', display: 'inline-block', fontWeight: 600 }}>
      {change}
    </div>
  </div>
);
