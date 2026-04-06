import React from 'react';
import { Avatar } from '../components/common/Avatar';
import { Stars } from '../components/common/Stars';
import { CallButton } from '../components/common/CallButton';
import { vehicleIconMap } from '../utils/helpers';
import { useDrivers } from '../hooks/useFirebaseData';

const Spinner = () => (
  <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading drivers…</div>
);

export const DriversPage: React.FC = () => {
  const { drivers, loading } = useDrivers();
  const online = drivers.filter((d) => d.isOnline).length;
  const avail = drivers.filter((d) => d.isOnline && d.isAvailable).length;

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Registered Drivers</h2>
        <p style={{ color: '#6B7280', fontSize: 13, margin: '3px 0 0' }}>
          {loading ? 'Loading…' : `${drivers.length} drivers · ${online} online · ${avail} available`}
        </p>
      </div>

      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {drivers.map((d) => (
            <div key={d.id} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18, position: 'relative' }}>
              {/* Status badges */}
              <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <span style={{ background: d.isOnline ? '#D1FAE5' : '#F3F4F6', color: d.isOnline ? '#065F46' : '#6B7280', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: d.isOnline ? '#10B981' : '#9CA3AF' }} />
                  {d.isOnline ? 'Online' : 'Offline'}
                </span>
                {d.isOnline && (
                  <span style={{ background: d.isAvailable ? '#DBEAFE' : '#FEF3C7', color: d.isAvailable ? '#1E3A5F' : '#92400E', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}>
                    {d.isAvailable ? 'Available' : 'On Trip'}
                  </span>
                )}
              </div>

              {/* Name + rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingRight: 90 }}>
                <Avatar name={d.name} size={44} photoUrl={d.photoUrl}/>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{d.name}</div>
                  <Stars value={d.rating} />
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>
                    {d.totalTrips} trips{d.isVerified && ' · ✓ Verified'}
                  </div>
                </div>
              </div>

              {/* Vehicle info */}
              <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '8px 10px', marginBottom: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16 }}>{vehicleIconMap[d.vehicle.vehicleType]}</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>{d.vehicle.vehicleModel || '—'}</span>
                <span style={{ color: '#9CA3AF' }}>· {d.vehicle.vehicleNumber || '—'}</span>
              </div>

              {/* Earnings */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '10px 0' }}>
                <div style={{ background: '#F0FDF4', borderRadius: 7, padding: '8px 10px', textAlign: 'left' }}>
                  <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 2 }}>Today</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#065F46' }}>GH₵ {(d.earnings?.today ?? 0).toLocaleString()}</div>
                </div>
                <div style={{ background: '#EFF6FF', borderRadius: 7, padding: '8px 10px', textAlign: 'left' }}>
                  <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 2 }}>This Month</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1E40AF' }}>GH₵ {(d.earnings?.monthly ?? 0).toLocaleString()}</div>
                </div>
              </div>

              {/* Call */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <CallButton phone={d.phone} />
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{d.phone}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
