import React, { type JSX } from 'react';

interface DonutChartProps {
  data: { label: string; percentage: number; color: string }[];
  total: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, total }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Ride Types</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        <svg width="86" height="86" viewBox="0 0 86 86" style={{ flexShrink: 0 }}>
          <circle cx="43" cy="43" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="13" />
          {data.reduce<JSX.Element[]>((acc, item, index) => {
            const dasharray = (item.percentage / 100) * circumference;
            const offset = index === 0 ? 0 : data.slice(0, index).reduce((sum, d) => sum + (d.percentage / 100) * circumference, 0);
            return [
              ...acc,
              <circle key={item.label} cx="43" cy="43" r={radius} fill="none" stroke={item.color} strokeWidth="13"
                strokeDasharray={`${dasharray} ${circumference}`} strokeDashoffset={-offset} transform="rotate(-90 43 43)" />,
            ];
          }, [])}
          <text x="43" y="40" textAnchor="middle" fontSize="11" fontWeight="700" fill="#111827">{total || 0}</text>
          <text x="43" y="51" textAnchor="middle" fontSize="8" fill="#9CA3AF">total</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#6B7280' }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
              {item.label}
              <span style={{ fontWeight: 700, color: '#111827', marginLeft: 4 }}>{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
      {data.map((item) => (
        <div key={item.label} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 3 }}>
            <span>{item.label}</span>
            <span style={{ fontWeight: 600, color: '#111827' }}>{item.percentage}%</span>
          </div>
          <div style={{ background: '#F3F4F6', borderRadius: 20, height: 5, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 20, width: `${item.percentage}%`, background: item.color }} />
          </div>
        </div>
      ))}
    </div>
  );
};
