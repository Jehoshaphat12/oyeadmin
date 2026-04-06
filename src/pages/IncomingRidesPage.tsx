import React, { useState } from 'react';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Stars } from '../components/common/Stars';
import { CallButton } from '../components/common/CallButton';
import { vehicleIconMap, vehicleLabel, timeAgo } from '../utils/helpers';
import { useIncomingRides, useDrivers } from '../hooks/useFirebaseData';
import type { Ride } from '../types';

const IncomingRideDetail: React.FC<{ ride: Ride; onBack: () => void }> = ({ ride, onBack }) => {
  const { drivers } = useDrivers();

  // Rank available online drivers by great-circle distance from pickup
  const nearbyDrivers = [...drivers]
    .filter((d) => d.isAvailable && d.isOnline)
    .map((d) => {
      const dlat = d.currentLocation.latitude - ride.pickup.latitude;
      const dlng = d.currentLocation.longitude - ride.pickup.longitude;
      // 1 degree ≈ 111 km
      const distKm = Math.sqrt(dlat * dlat + dlng * dlng) * 111;
      return { ...d, distKm };
    })
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 5);

  return (
    <div style={{ textAlign: 'left' }}>
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '0 0 18px', fontWeight: 500 }}>
        ← Back to Incoming Rides
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 16 }}>
        {/* Ride info card */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
                Ride #{ride.id.slice(-6).toUpperCase()}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{timeAgo(ride.requestedAt)}</div>
            </div>
            <Badge status={ride.status} />
          </div>

          {/* Route */}
          <div style={{ background: '#F9FAFB', borderRadius: 9, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981' }} />
                <div style={{ width: 2, height: 24, background: '#E5E7EB', margin: '2px auto' }} />
                <div style={{ width: 9, height: 9, borderRadius: 2, background: '#EF4444' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pickup</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 1, wordBreak: 'break-word' }}>
                    {ride.pickup.address || '—'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 1, wordBreak: 'break-word' }}>
                    {ride.destinations[0]?.address || '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              ['Distance', `${ride.distance} km`],
              ['Est. Time', `${ride.duration}m`],
              ['Fare', `GH₵ ${ride.totalFare.toFixed(2)}`],
            ].map(([l, v]) => (
              <div key={l} style={{ background: '#F9FAFB', borderRadius: 7, padding: '9px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{v}</div>
              </div>
            ))}
          </div>

          {/* Package info if delivery */}
          {ride.packageInfo && (
            <div style={{ marginTop: 12, background: '#FEF3C7', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>📦 Package Details</div>
              <div style={{ fontSize: 12, color: '#374151' }}>
                To: {ride.packageInfo.recipientName} · {ride.packageInfo.recipientPhone}
              </div>
              {ride.packageInfo.itemDescription && (
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{ride.packageInfo.itemDescription}</div>
              )}
            </div>
          )}
        </div>

        {/* Passenger card */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Passenger Details</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <Avatar name={ride.passengerName} size={50} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{ride.passengerName}</div>
              {ride.passengerRating != null && ride.passengerRating > 0
                ? <Stars value={ride.passengerRating} />
                : <span style={{ fontSize: 12, color: '#9CA3AF' }}>No rating yet</span>
              }
            </div>
          </div>
          {[
            ['Phone', ride.passengerPhone],
            ['Vehicle requested', `${vehicleIconMap[ride.vehicleType]} ${vehicleLabel[ride.vehicleType]}`],
            ['Waiting', timeAgo(ride.requestedAt)],
            ...(ride.paymentMethod ? [['Payment', ride.paymentMethod]] : []),
          ].map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6', flexWrap: 'wrap', gap: 4 }}>
              <span style={{ fontSize: 12, color: '#6B7280' }}>{l}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{v}</span>
            </div>
          ))}
          <div style={{ marginTop: 14 }}>
            <CallButton phone={ride.passengerPhone} />
          </div>
        </div>
      </div>

      {/* Nearby Drivers */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Nearby Available Drivers</div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            {nearbyDrivers.length} driver{nearbyDrivers.length !== 1 ? 's' : ''} available near pickup
          </div>
        </div>

        {nearbyDrivers.length === 0 ? (
          <div style={{ padding: '30px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            No available drivers online right now
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {nearbyDrivers.map((d, i) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 10, background: i === 0 ? '#F0FDF4' : '#F9FAFB', border: i === 0 ? '1.5px solid #86EFAC' : '1px solid transparent', flexWrap: 'wrap' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <Avatar name={d.name} size={40} />
                <div style={{ flex: 1, minWidth: 120, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{d.name}</span>
                    {i === 0 && (
                      <span style={{ background: '#BBF7D0', color: '#065F46', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                        Nearest
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                    {vehicleIconMap[d.vehicle.vehicleType]} {d.vehicle.vehicleModel || '—'} · {d.vehicle.vehicleNumber || '—'}
                  </div>
                  <Stars value={d.rating} />
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{d.distKm.toFixed(1)}km</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>away</div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{d.totalTrips}</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>trips</div>
                </div>
                <CallButton phone={d.phone} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const IncomingRidesPage: React.FC = () => {
  const [selected, setSelected] = useState<Ride | null>(null);
  const { rides, loading } = useIncomingRides();

  if (selected) return <IncomingRideDetail ride={selected} onBack={() => setSelected(null)} />;

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Incoming Rides</h2>
        <p style={{ color: '#6B7280', fontSize: 13, margin: '3px 0 0' }}>
          {loading ? 'Loading…' : `${rides.length} request${rides.length !== 1 ? 's' : ''} awaiting a driver`}
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading rides…</div>
      ) : rides.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
          No incoming rides at the moment
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rides.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelected(r)}
              style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 16, textAlign: 'left', cursor: 'pointer', width: '100%', transition: 'border-color .15s, box-shadow .15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(245,158,11,.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar name={r.passengerName} size={44} />
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: '50%', background: '#F59E0B', border: '2px solid #fff' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{r.passengerName}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, wordBreak: 'break-word' }}>
                    📍 {r.pickup.address} → {r.destinations[0]?.address}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{r.distance}km</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>dist</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>GH₵{r.totalFare.toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>fare</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 16 }}>{vehicleIconMap[r.vehicleType]}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF' }}>{vehicleLabel[r.vehicleType]}</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>{timeAgo(r.requestedAt)}</div>
                  <span style={{ color: '#9CA3AF' }}>›</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
