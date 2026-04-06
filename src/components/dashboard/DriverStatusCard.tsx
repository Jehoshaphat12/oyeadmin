import React from 'react';
import { Avatar } from '../common/Avatar';
import { vehicleIconMap } from '../../utils/helpers';
import type { Driver } from '../../types';

interface DriverStatusCardProps {
  drivers: Driver[];
  onlineDrivers: number;
  availDrivers: number;
}

export const DriverStatusCard: React.FC<DriverStatusCardProps> = ({ drivers, onlineDrivers, availDrivers }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, textAlign: 'left' }}>
    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Driver Status</div>
    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 16 }}>Real-time overview</div>

    {/* Status counts — intentionally centered */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 16, gap: 4 }}>
      {[
        [onlineDrivers, 'Online', '#10B981'],
        [availDrivers, 'Available', '#3B82F6'],
        [onlineDrivers - availDrivers, 'On Trip', '#F59E0B'],
        [drivers.length - onlineDrivers, 'Offline', '#9CA3AF'],
      ].map(([v, l, c]) => (
        <div key={String(l)} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: String(c) }}>{v}</div>
          <div style={{ fontSize: 10, color: '#6B7280' }}>{l}</div>
        </div>
      ))}
    </div>

    {/* Driver list — left aligned */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {drivers.slice(0, 3).map((d) => (
        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px', background: '#F9FAFB', borderRadius: 9 }}>
          <Avatar name={d.name} size={32} photoUrl={d.photoUrl}/>
          <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
            <div style={{ fontSize: 10, color: '#9CA3AF' }}>{vehicleIconMap[d.vehicle.vehicleType]} {d.vehicle.vehicleModel}</div>
          </div>
          <span style={{ background: d.isOnline ? '#D1FAE5' : '#F3F4F6', color: d.isOnline ? '#065F46' : '#6B7280', borderRadius: 20, padding: '2px 7px', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
            {d.isOnline ? (d.isAvailable ? 'Available' : 'On Trip') : 'Offline'}
          </span>
        </div>
      ))}
    </div>
  </div>
);
