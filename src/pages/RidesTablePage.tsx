import React, { useState } from 'react';
import {
  FaArrowLeft, FaPhone, FaMotorcycle, FaUser,
  FaStar, FaBox, FaCheckCircle, FaTimesCircle,
} from 'react-icons/fa';
import { Avatar } from '../components/common/Avatar';
import { Badge } from '../components/common/Badge';
import { Stars } from '../components/common/Stars';
import { vehicleIconMap, vehicleLabel, timeAgo, fmtDate, statusColor } from '../utils/helpers';
import type { Ride } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function driverName(ride: Ride): string | null {
  return ride.driverInfo?.name ?? ride.driver?.name ?? null;
}
function driverPhone(ride: Ride): string | null {
  return ride.driverInfo?.phone ?? ride.driver?.phone ?? null;
}
function driverRating(ride: Ride): number {
  return ride.driverInfo?.rating ?? ride.driver?.rating ?? 0;
}
function driverVehicle(ride: Ride): string | null {
  const v = ride.driverInfo?.vehicle ?? ride.driver?.vehicle;
  if (!v) return null;
  return `${vehicleIconMap[v.vehicleType]} ${v.vehicleModel || ''} · ${v.vehicleNumber || ''}`.trim();
}

// ─── Shared small pieces ──────────────────────────────────────────────────────

const ContactBtn: React.FC<{ phone: string; label: string; color?: string }> = ({
  phone, label, color = '#10B981',
}) => (
  <a
    href={`tel:${phone}`}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: color, color: '#fff', borderRadius: 9,
      padding: '10px 18px', fontSize: 13, fontWeight: 600,
      textDecoration: 'none', flexShrink: 0,
    }}
  >
    <FaPhone size={12} /> {label}
  </a>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18, marginBottom: 12 }}>
    <div style={{ fontWeight: 700, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 11 } as React.CSSProperties}>
      {title}
    </div>
    {children}
  </div>
);

const InfoRow: React.FC<{ icon?: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '9px 0', borderBottom: '1px solid #F9FAFB', gap: 12,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#6B7280', fontSize: 12, flexShrink: 0 }}>
      {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
      {label}
    </div>
    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', textAlign: 'right' }}>{value}</div>
  </div>
);

// ─── Timeline chip ────────────────────────────────────────────────────────────

const TimelineRow: React.FC<{ label: string; date?: Date; done: boolean; active?: boolean }> = ({
  label, date, done, active,
}) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: done ? '#10B981' : active ? '#F59E0B' : '#E5E7EB',
    }}>
      {done
        ? <FaCheckCircle size={10} color="#fff" />
        : <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? '#fff' : '#9CA3AF' }} />
      }
    </div>
    <div style={{ flex: 1 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: done ? '#111827' : '#9CA3AF' }}>{label}</span>
      {date && <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 8 }}>{fmtDate(date)}</span>}
    </div>
  </div>
);

// ─── Full Ride Detail ─────────────────────────────────────────────────────────

const RideDetail: React.FC<{ ride: Ride; onBack: () => void; pageTitle: string }> = ({ ride, onBack, pageTitle }) => {
  const drName   = driverName(ride);
  const drPhone  = driverPhone(ride);
  const drRating = driverRating(ride);
  const drVehicle = driverVehicle(ride);

  const isCompleted  = ride.status === 'completed';
  const isCancelled  = ride.status === 'cancelled';

  return (
    <div style={{ textAlign: 'left', maxWidth: 720, margin: '0 auto' }}>

      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none',
          color: '#6B7280', fontSize: 13, cursor: 'pointer', padding: '0 0 16px', fontWeight: 500,
          fontFamily: 'inherit',
        }}
      >
        <FaArrowLeft size={12} /> Back to {pageTitle}
      </button>

      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 18, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
              Ride #{ride.id.slice(-6).toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>
              Requested {fmtDate(ride.requestedAt)} · {timeAgo(ride.requestedAt)}
            </div>
          </div>
          <Badge status={ride.status} />
        </div>

        {/* Route */}
        <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px' }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', border: '2px solid #fff', boxShadow: '0 0 0 2px #10B981' }} />
              <div style={{ width: 2, height: 28, background: '#D1D5DB', margin: '3px auto' }} />
              <div style={{ width: 10, height: 10, borderRadius: 2, background: '#EF4444', border: '2px solid #fff', boxShadow: '0 0 0 2px #EF4444' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Pickup</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', wordBreak: 'break-word' }}>{ride.pickup.address || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Destination</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', wordBreak: 'break-word' }}>{ride.destinations[0]?.address || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 14 }}>
          {[
            { label: 'Distance',  value: `${ride.distance} km` },
            { label: 'Duration',  value: ride.duration ? `${ride.duration} min` : '—' },
            { label: 'Fare',      value: ride.totalFare > 0 ? `GH₵ ${ride.totalFare.toFixed(2)}` : '—', accent: '#10B981' },
          ].map(({ label, value, accent }) => (
            <div key={label} style={{ background: '#F9FAFB', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: accent ?? '#111827' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Vehicle + payment */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ background: '#F3F4F6', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#374151', fontWeight: 500 }}>
            {vehicleIconMap[ride.vehicleType]} {vehicleLabel[ride.vehicleType]}
          </span>
          {ride.paymentMethod && (
            <span style={{ background: '#F3F4F6', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#374151', fontWeight: 500 }}>
              💳 {ride.paymentMethod}
            </span>
          )}
          {ride.surgeMultiplier && ride.surgeMultiplier > 1 && (
            <span style={{ background: '#FEF3C7', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#92400E', fontWeight: 600 }}>
              ⚡ {ride.surgeMultiplier}× surge
            </span>
          )}
        </div>
      </div>

      {/* People — passenger + driver side by side on wide, stacked on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, marginBottom: 12 }}>

        {/* Passenger */}
        <Section title="Passenger">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <Avatar name={ride.passengerName} size={50} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{ride.passengerName}</div>
              {ride.passengerRating != null && ride.passengerRating > 0
                ? <Stars value={ride.passengerRating} />
                : <span style={{ fontSize: 11, color: '#9CA3AF' }}>No rating yet</span>}
            </div>
          </div>
          <InfoRow icon={<FaPhone size={10} />} label="Phone" value={ride.passengerPhone || '—'} />
          {ride.userRating != null && ride.userRating > 0 && (
            <InfoRow icon={<FaStar size={10} />} label="Rated driver" value={<Stars value={ride.userRating} />} />
          )}
          {ride.userFeedback && (
            <div style={{ marginTop: 10, background: '#F9FAFB', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#374151', fontStyle: 'italic' }}>
              "{ride.userFeedback}"
            </div>
          )}
          {ride.passengerPhone && (
            <div style={{ marginTop: 14 }}>
              <ContactBtn phone={ride.passengerPhone} label="Call Passenger" color="#10B981" />
            </div>
          )}
        </Section>

        {/* Driver */}
        <Section title="Driver">
          {drName ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <Avatar name={drName} size={50} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#111827' }}>{drName}</div>
                  {drRating > 0
                    ? <Stars value={drRating} />
                    : <span style={{ fontSize: 11, color: '#9CA3AF' }}>No rating yet</span>}
                </div>
              </div>
              {drVehicle && <InfoRow icon={<FaMotorcycle size={10} />} label="Vehicle" value={drVehicle} />}
              {drPhone    && <InfoRow icon={<FaPhone size={10} />}     label="Phone"   value={drPhone} />}
              {ride.driverRating > 0 && (
                <InfoRow icon={<FaStar size={10} />} label="Rated passenger" value={<Stars value={ride.driverRating} />} />
              )}
              {ride.driverFeedback && (
                <div style={{ marginTop: 10, background: '#F9FAFB', borderRadius: 8, padding: '9px 12px', fontSize: 12, color: '#374151', fontStyle: 'italic' }}>
                  "{ride.driverFeedback}"
                </div>
              )}
              {drPhone && (
                <div style={{ marginTop: 14 }}>
                  <ContactBtn phone={drPhone} label="Call Driver" color="#3B82F6" />
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
              <FaMotorcycle size={22} style={{ marginBottom: 8, opacity: 0.3 }} />
              <div>No driver was assigned</div>
            </div>
          )}
        </Section>
      </div>

      {/* Package info (delivery) */}
      {ride.packageInfo && (
        <Section title="Package Details">
          <InfoRow icon={<FaUser size={10} />} label="Recipient"    value={ride.packageInfo.recipientName} />
          <InfoRow icon={<FaPhone size={10} />} label="Phone"       value={ride.packageInfo.recipientPhone} />
          {ride.packageInfo.itemDescription && (
            <InfoRow icon={<FaBox size={10} />} label="Description" value={ride.packageInfo.itemDescription} />
          )}
          {ride.packageInfo.recipientPhone && (
            <div style={{ marginTop: 14 }}>
              <ContactBtn phone={ride.packageInfo.recipientPhone} label="Call Recipient" color="#8B5CF6" />
            </div>
          )}
        </Section>
      )}

      {/* Timeline */}
      <Section title="Timeline">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TimelineRow label="Requested"   date={ride.requestedAt} done />
          <TimelineRow label="Accepted"    date={ride.acceptedAt}  done={!!ride.acceptedAt} active={!ride.acceptedAt && !isCancelled} />
          <TimelineRow label="In progress" date={ride.startedAt}   done={!!ride.startedAt}  active={!!ride.acceptedAt && !ride.startedAt && !isCancelled} />
          <TimelineRow label="Completed"   date={ride.completedAt} done={isCompleted}        active={!!ride.startedAt && !isCompleted && !isCancelled} />
        </div>
        {isCancelled && (
          <div style={{ marginTop: 14, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <FaTimesCircle size={14} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#B91C1C' }}>
                Cancelled by {ride.cancelledBy ?? 'unknown'}
              </div>
              {ride.cancellationReason && (
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{ride.cancellationReason}</div>
              )}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
};

// ─── Ride Card (list item) ────────────────────────────────────────────────────

const RideCard: React.FC<{ ride: Ride; onClick: () => void }> = ({ ride, onClick }) => {
  const drName = driverName(ride);
  const sc     = statusColor[ride.status] ?? statusColor.completed;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{
        background: '#fff', borderRadius: 12,
        border: '1px solid #E5E7EB',
        cursor: 'pointer', overflow: 'hidden',
        transition: 'box-shadow 0.15s, border-color 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow    = '0 4px 20px rgba(0,0,0,0.08)';
        e.currentTarget.style.borderColor  = '#D1D5DB';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow    = 'none';
        e.currentTarget.style.borderColor  = '#E5E7EB';
      }}
    >
      {/* Coloured status strip across top */}
      <div style={{ height: 3, background: sc.dot, borderRadius: '12px 12px 0 0' }} />

      <div style={{ padding: '14px 16px' }}>
        {/* Row 1 — passenger + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <Avatar name={ride.passengerName} size={40} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {ride.passengerName}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                {fmtDate(ride.requestedAt)} · {timeAgo(ride.requestedAt)}
              </div>
            </div>
          </div>
          <Badge status={ride.status} />
        </div>

        {/* Route */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 3, flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981' }} />
            <div style={{ width: 1.5, height: 20, background: '#D1D5DB', margin: '2px auto' }} />
            <div style={{ width: 7, height: 7, borderRadius: 1.5, background: '#EF4444' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 8 }}>
              {ride.pickup.address || '—'}
            </div>
            <div style={{ fontSize: 12, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ride.destinations[0]?.address || '—'}
            </div>
          </div>
        </div>

        {/* Row 3 — driver + metrics */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: 10, borderTop: '1px solid #F3F4F6' }}>
          {/* Driver pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            {drName ? (
              <>
                <Avatar name={drName} size={26} />
                <span style={{ fontSize: 12, color: '#374151', fontWeight: 500 }}>{drName}</span>
              </>
            ) : (
              <span style={{ fontSize: 12, color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: 5 }}>
                <FaMotorcycle size={11} /> Unassigned
              </span>
            )}
          </div>

          {/* Metrics */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{vehicleIconMap[ride.vehicleType]}</span>
            <span style={{ fontSize: 12, color: '#6B7280' }}>{ride.distance}km</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
              {ride.totalFare > 0 ? `GH₵${ride.totalFare.toFixed(2)}` : '—'}
            </span>
            <span style={{ color: '#D1D5DB' }}>›</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main exported component ──────────────────────────────────────────────────

interface RidesTablePageProps {
  rides: Ride[];
  title: string;
  subtitle: string;
  loading?: boolean;
}

export const RidesTablePage: React.FC<RidesTablePageProps> = ({ rides, title, subtitle, loading }) => {
  const [selected, setSelected] = useState<Ride | null>(null);

  if (selected) {
    return <RideDetail ride={selected} onBack={() => setSelected(null)} pageTitle={title} />;
  }

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>{title}</h2>
        <p style={{ color: '#6B7280', fontSize: 13, margin: '3px 0 0' }}>
          {loading ? 'Loading…' : subtitle}
        </p>
      </div>

      {loading ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
          Loading rides…
        </div>
      ) : rides.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 60, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>
          No rides found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rides.map((r) => (
            <RideCard key={r.id} ride={r} onClick={() => setSelected(r)} />
          ))}
        </div>
      )}
    </div>
  );
};
