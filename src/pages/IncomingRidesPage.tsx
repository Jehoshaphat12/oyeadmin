import React, { useState } from 'react';
import { FaPhone, FaUserCheck, FaTimes, FaArrowLeft, FaMotorcycle } from 'react-icons/fa';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Stars } from '../components/common/Stars';
import { vehicleIconMap, vehicleLabel, timeAgo } from '../utils/helpers';
import {
  useIncomingRides,
  useDrivers,
  assignDriverToRide,
  cancelRide,
} from '../hooks/useFirebaseData';
import type { Ride, Driver } from '../types';

// ─── Small shared components ──────────────────────────────────────────────────

const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '1px solid #F3F4F6', gap: 8,
  }}>
    <span style={{ fontSize: 12, color: '#6B7280', flexShrink: 0 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{value}</span>
  </div>
);

const MetricBox: React.FC<{ label: string; value: string; accent?: string }> = ({ label, value, accent }) => (
  <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 8px', textAlign: 'center', flex: 1 }}>
    <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3 }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 700, color: accent ?? '#111827' }}>{value}</div>
  </div>
);

// ─── Assign-driver modal ───────────────────────────────────────────────────────

const AssignModal: React.FC<{
  ride: Ride;
  drivers: (Driver & { distKm: number })[];
  onClose: () => void;
  onAssigned: () => void;
}> = ({ ride, drivers, onClose, onAssigned }) => {
  const [assigning, setAssigning] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAssign = async (driver: Driver & { distKm: number }) => {
    setAssigning(driver.id);
    setError('');
    try {
      await assignDriverToRide(ride.id, driver);
      onAssigned();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to assign driver. Please try again.');
      setAssigning(null);
    }
  };

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 480,
          maxHeight: '85vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.25)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px', borderBottom: '1px solid #E5E7EB',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Assign a Driver</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              Ride #{ride.id.slice(-6).toUpperCase()} · {ride.pickup.address}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 4 }}>
            <FaTimes size={18} />
          </button>
        </div>

        {/* Driver list */}
        <div style={{ overflowY: 'auto', padding: 16, flex: 1 }}>
          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#B91C1C', marginBottom: 12 }}>
              {error}
            </div>
          )}
          {drivers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#9CA3AF', fontSize: 13 }}>
              No available drivers online right now
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {drivers.map((d, i) => (
                <div
                  key={d.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 10,
                    background: i === 0 ? '#F0FDF4' : '#F9FAFB',
                    border: `1.5px solid ${i === 0 ? '#86EFAC' : 'transparent'}`,
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', background: '#E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 700, color: '#374151', flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  <Avatar name={d.name} size={38} />

                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{d.name}</span>
                      {i === 0 && (
                        <span style={{ background: '#BBF7D0', color: '#065F46', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                          Nearest
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                      {vehicleIconMap[d.vehicle.vehicleType]} {d.vehicle.vehicleModel || '—'}
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 2, alignItems: 'center' }}>
                      <Stars value={d.rating} />
                      <span style={{ fontSize: 10, color: '#9CA3AF' }}>{d.distKm.toFixed(1)}km away</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssign(d)}
                    disabled={assigning !== null}
                    style={{
                      background: assigning === d.id ? '#E5E7EB' : '#111827',
                      color: assigning === d.id ? '#6B7280' : '#fff',
                      border: 'none', borderRadius: 8,
                      padding: '8px 14px', fontSize: 12, fontWeight: 600,
                      cursor: assigning !== null ? 'not-allowed' : 'pointer',
                      flexShrink: 0, fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 5,
                      transition: 'background 0.15s',
                    }}
                  >
                    {assigning === d.id ? (
                      'Assigning…'
                    ) : (
                      <><FaUserCheck size={11} /> Assign</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Ride detail view ─────────────────────────────────────────────────────────

const IncomingRideDetail: React.FC<{ ride: Ride; onBack: () => void }> = ({ ride, onBack }) => {
  const { drivers } = useDrivers();
  const [showAssign, setShowAssign] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState('');
  const [cancelled, setCancelled] = useState(false);

  const nearbyDrivers = [...drivers]
    .filter((d) => d.isAvailable && d.isOnline)
    .map((d) => {
      const dlat = d.currentLocation.latitude - ride.pickup.latitude;
      const dlng = d.currentLocation.longitude - ride.pickup.longitude;
      return { ...d, distKm: Math.sqrt(dlat * dlat + dlng * dlng) * 111 };
    })
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 5);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this ride request? This cannot be undone.')) return;
    setCancelling(true);
    setActionError('');
    try {
      await cancelRide(ride.id);
      setCancelled(true);
    } catch (e: any) {
      setActionError(e?.message ?? 'Failed to cancel ride.');
      setCancelling(false);
    }
  };

  if (cancelled) {
    return (
      <div style={{ textAlign: 'left' }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '0 0 18px', fontWeight: 500 }}>
          <FaArrowLeft size={12} /> Back to Incoming Rides
        </button>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Ride Cancelled</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>The ride has been cancelled successfully.</div>
          <button onClick={onBack} style={{ background: '#111827', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Back to Incoming Rides
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'left' }}>
      {showAssign && (
        <AssignModal
          ride={ride}
          drivers={nearbyDrivers}
          onClose={() => setShowAssign(false)}
          onAssigned={() => { setShowAssign(false); onBack(); }}
        />
      )}

      {/* Back + action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: 0, fontWeight: 500, fontFamily: 'inherit' }}>
          <FaArrowLeft size={12} /> Back to Incoming Rides
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA',
              borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 600,
              cursor: cancelling ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            <FaTimes size={11} />
            {cancelling ? 'Cancelling…' : 'Cancel Ride'}
          </button>
          <button
            onClick={() => setShowAssign(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#111827', color: '#fff', border: 'none',
              borderRadius: 8, padding: '8px 16px', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <FaUserCheck size={12} />
            Assign Driver
          </button>
        </div>
      </div>

      {actionError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 14 }}>
          {actionError}
        </div>
      )}

      {/* Top cards — stack on mobile, side by side on wider screens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 14 }}>

        {/* Ride info */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Ride #{ride.id.slice(-6).toUpperCase()}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{timeAgo(ride.requestedAt)}</div>
            </div>
            <Badge status={ride.status} />
          </div>

          {/* Route */}
          <div style={{ background: '#F9FAFB', borderRadius: 9, padding: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3, flexShrink: 0 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#10B981' }} />
                <div style={{ width: 2, height: 24, background: '#D1D5DB', margin: '3px auto' }} />
                <div style={{ width: 9, height: 9, borderRadius: 2, background: '#EF4444' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pickup</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 1, wordBreak: 'break-word' }}>{ride.pickup.address || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destination</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginTop: 1, wordBreak: 'break-word' }}>{ride.destinations[0]?.address || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div style={{ display: 'flex', gap: 8 }}>
            <MetricBox label="Distance" value={`${ride.distance} km`} />
            <MetricBox label="Est. Time" value={`${ride.duration}m`} />
            <MetricBox label="Fare" value={`GH₵ ${ride.totalFare.toFixed(2)}`} accent="#10B981" />
          </div>

          {ride.packageInfo && (
            <div style={{ marginTop: 12, background: '#FEF3C7', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#92400E', marginBottom: 4 }}>📦 Package</div>
              <div style={{ fontSize: 12, color: '#374151' }}>{ride.packageInfo.recipientName} · {ride.packageInfo.recipientPhone}</div>
              {ride.packageInfo.itemDescription && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{ride.packageInfo.itemDescription}</div>}
            </div>
          )}
        </div>

        {/* Passenger info */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14 }}>Passenger</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <Avatar name={ride.passengerName} size={48} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>{ride.passengerName}</div>
              {ride.passengerRating != null && ride.passengerRating > 0
                ? <Stars value={ride.passengerRating} />
                : <span style={{ fontSize: 12, color: '#9CA3AF' }}>No rating yet</span>
              }
            </div>
          </div>
          <InfoRow label="Phone" value={ride.passengerPhone} />
          <InfoRow label="Vehicle" value={`${vehicleIconMap[ride.vehicleType]} ${vehicleLabel[ride.vehicleType]}`} />
          <InfoRow label="Waiting" value={<span style={{ color: '#F59E0B', fontWeight: 700 }}>{timeAgo(ride.requestedAt)}</span>} />
          {ride.paymentMethod && <InfoRow label="Payment" value={ride.paymentMethod} />}
          <div style={{ marginTop: 14 }}>
            <a
              href={`tel:${ride.passengerPhone}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#10B981', color: '#fff', borderRadius: 8,
                padding: '9px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none',
              }}
            >
              <FaPhone size={12} /> Call Passenger
            </a>
          </div>
        </div>
      </div>

      {/* Nearby Drivers */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Nearby Available Drivers</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              {nearbyDrivers.length} driver{nearbyDrivers.length !== 1 ? 's' : ''} near pickup
            </div>
          </div>
          {nearbyDrivers.length > 0 && (
            <button
              onClick={() => setShowAssign(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#F59E0B', color: '#111827', border: 'none',
                borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <FaUserCheck size={11} /> Assign Driver
            </button>
          )}
        </div>

        {nearbyDrivers.length === 0 ? (
          <div style={{ padding: '28px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
            <FaMotorcycle size={24} style={{ marginBottom: 8, opacity: 0.3 }} />
            <div>No available drivers online right now</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {nearbyDrivers.map((d, i) => (
              <div
                key={d.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: 12,
                  borderRadius: 10,
                  background: i === 0 ? '#F0FDF4' : '#F9FAFB',
                  border: `1.5px solid ${i === 0 ? '#86EFAC' : 'transparent'}`,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#374151', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <Avatar name={d.name} size={38} />
                <div style={{ flex: 1, minWidth: 100, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>{d.name}</span>
                    {i === 0 && <span style={{ background: '#BBF7D0', color: '#065F46', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>Nearest</span>}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>
                    {vehicleIconMap[d.vehicle.vehicleType]} {d.vehicle.vehicleModel || '—'} · {d.vehicle.vehicleNumber || '—'}
                  </div>
                  <Stars value={d.rating} />
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{d.distKm.toFixed(1)}km</div>
                  <div style={{ fontSize: 10, color: '#9CA3AF' }}>away</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <a href={`tel:${d.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F3F4F6', color: '#374151', borderRadius: 7, padding: '7px 12px', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                    <FaPhone size={10} /> Call
                  </a>
                  <button
                    onClick={() => { setShowAssign(false); assignDriverToRide(ride.id, d).then(onBack).catch((e) => setActionError(e?.message ?? 'Failed')); }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#111827', color: '#fff', border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <FaUserCheck size={10} /> Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── List view ────────────────────────────────────────────────────────────────

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
            /* KEY FIX: use a div+onClick instead of <button> — buttons collapse
               flex children on narrow screens because they have implicit width:fit-content */
            <div
              key={r.id}
              onClick={() => setSelected(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(r)}
              style={{
                background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
                padding: 14, textAlign: 'left', cursor: 'pointer', width: '100%',
                boxSizing: 'border-box', transition: 'border-color .15s, box-shadow .15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(245,158,11,.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Row 1: avatar + name + route */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar name={r.passengerName} size={42} />
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 11, height: 11, borderRadius: '50%', background: '#F59E0B', border: '2px solid #fff' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{r.passengerName}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📍 {r.pickup.address}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    → {r.destinations[0]?.address}
                  </div>
                </div>
              </div>

              {/* Row 2: metrics strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#111827' }}>{r.distance}km</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>GH₵{r.totalFare.toFixed(2)}</span>
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#D1D5DB', flexShrink: 0 }} />
                <span style={{ fontSize: 16 }}>{vehicleIconMap[r.vehicleType]}</span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{vehicleLabel[r.vehicleType]}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>{timeAgo(r.requestedAt)}</span>
                <span style={{ color: '#9CA3AF', fontSize: 14 }}>›</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
