import React from 'react';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { vehicleIconMap, timeAgo } from '../utils/helpers';
import type { Ride } from '../types';

interface RidesTablePageProps {
  rides: Ride[];
  title: string;
  subtitle: string;
  loading?: boolean;
}

/** Returns the best available driver name for a ride row */
function driverName(ride: Ride): string | null {
  return ride.driverInfo?.name ?? ride.driver?.name ?? null;
}
function driverPic(ride: Ride): string | null {
  return ride.driverInfo?.photoUrl ?? ride.driver?.photoUrl ?? null;
}

export const RidesTablePage: React.FC<RidesTablePageProps> = ({ rides, title, subtitle, loading }) => (
  <div style={{ textAlign: 'left' }}>
    <div style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
      <p style={{ color: '#6B7280', fontSize: 13, margin: '3px 0 0' }}>{loading ? 'Loading…' : subtitle}</p>
    </div>
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 620 }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              {['Passenger', 'Driver', 'Route', 'Type', 'Fare', 'Status', 'Time'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading…</td></tr>
            ) : rides.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: '40px 14px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No rides found.</td></tr>
            ) : rides.map((r, i) => {
              const drName = driverName(r);
              const drPic = driverPic(r);
              return (
                <tr key={r.id} style={{ borderBottom: i < rides.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Avatar name={r.passengerName} size={28} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#111827' }}>{r.passengerName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    {drName ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Avatar name={drName} size={28} photoUrl={drPic!}/>
                        <span style={{ fontSize: 12, color: '#374151' }}>{drName}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: 12 }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>📍 {r.pickup.address || '—'}</div>
                    <div style={{ fontSize: 11, color: '#374151', fontWeight: 500, marginTop: 2 }}>
                      → {r.destinations[0]?.address || '—'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 16 }}>{vehicleIconMap[r.vehicleType]}</td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#111827', fontSize: 13 }}>
                    {r.totalFare > 0 ? `GH₵ ${r.totalFare.toFixed(2)}` : <span style={{ color: '#9CA3AF' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 14px' }}><Badge status={r.status} /></td>
                  <td style={{ padding: '12px 14px', fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap' }}>
                    {timeAgo(r.requestedAt)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
