import React from 'react';

interface BarChartProps {
  data: number[];
  labels: string[];
  mode: 'rides' | 'revenue';
  maxBar: number;
  /** Index of the bar to highlight (today). Defaults to the last bar. */
  todayIndex?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, labels, mode, maxBar, todayIndex }) => {
  const highlight = todayIndex !== undefined ? todayIndex : data.length - 1;
  const activeColor  = mode === 'rides' ? '#3B82F6' : '#10B981';
  const passiveColor = mode === 'rides' ? '#BFDBFE' : '#A7F3D0';

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div
            title={mode === 'rides' ? `${v} rides` : `GH₵ ${v.toFixed(2)}`}
            style={{
              borderRadius: '4px 4px 0 0',
              width: '100%',
              height: `${maxBar > 0 ? Math.max(Math.round((v / maxBar) * 92), v > 0 ? 4 : 0) : 0}px`,
              background: i === highlight ? activeColor : passiveColor,
              transition: 'height 0.3s ease',
              cursor: 'default',
            }}
          />
          <div style={{ fontSize: 9, color: i === highlight ? '#374151' : '#9CA3AF', fontWeight: i === highlight ? 600 : 400 }}>
            {labels[i]}
          </div>
        </div>
      ))}
    </div>
  );
};
