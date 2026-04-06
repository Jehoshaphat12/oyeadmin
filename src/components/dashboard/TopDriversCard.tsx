import React from 'react';
import { Avatar } from '../common/Avatar';
import { vehicleIconMap } from '../../utils/helpers';
import type { Driver } from '../../types';

interface TopDriversCardProps {
  drivers: Driver[];
}

export const TopDriversCard: React.FC<TopDriversCardProps> = ({ drivers }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, textAlign: 'left' }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Top Drivers</div>
    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>By trips this month</div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {[...drivers]
        .sort((a, b) => b.totalTrips - a.totalTrips)
        .slice(0, 5)
        .map((d, i) => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 0', borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: i === 0 ? '#F59E0B' : i === 1 ? '#9CA3AF' : i === 2 ? '#D97706' : '#E5E7EB', width: 18, flexShrink: 0 }}>
              {i + 1}
            </span>
            <Avatar name={d.name} size={32} photoUrl={d.photoUrl}/>
            <div style={{ flex: 1, minWidth: 120, textAlign: 'left' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>{vehicleIconMap[d.vehicle.vehicleType]} {d.totalTrips} trips</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>GH₵{(d.earnings?.monthly ?? 0).toLocaleString()}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>this month</div>
            </div>
          </div>
        ))}
    </div>
  </div>
);
