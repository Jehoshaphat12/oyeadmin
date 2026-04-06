import React from 'react';
import { FaCheckCircle, FaClock, FaMotorcycle, FaStar, FaTimesCircle } from 'react-icons/fa';
import { timeAgo } from '../../utils/helpers';
import type { Ride } from '../../types';

interface RecentActivityProps {
  rides: Ride[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ rides }) => {
  // Build activity feed from real ride events + driver online status
  type Activity = { icon: React.ReactNode; bg: string; msg: string; time: string; ts: number };
  const items: Activity[] = [];

  rides.slice(0, 10).forEach((r) => {
    if (r.status === 'completed' && r.completedAt) {
      items.push({ icon: <FaCheckCircle />, bg: '#D1FAE5', msg: `Ride completed — ${r.passengerName} → ${r.destinations[0]?.address ?? ''}`, time: timeAgo(r.completedAt), ts: r.completedAt.getTime() });
    } else if (r.status === 'cancelled') {
      items.push({ icon: <FaTimesCircle />, bg: '#FEE2E2', msg: `Ride cancelled — ${r.passengerName}, ${r.pickup.address}`, time: timeAgo(r.requestedAt), ts: r.requestedAt.getTime() });
    } else if (r.status === 'requesting') {
      items.push({ icon: <FaClock />, bg: '#FEF3C7', msg: `New ride request — ${r.passengerName}, ${r.pickup.address}`, time: timeAgo(r.requestedAt), ts: r.requestedAt.getTime() });
    } else if (r.status === 'in_progress' && r.startedAt) {
      items.push({ icon: <FaMotorcycle />, bg: '#EFF6FF', msg: `Ride in progress — ${r.passengerName} with ${r.driver?.name ?? 'a driver'}`, time: timeAgo(r.startedAt), ts: r.startedAt.getTime() });
    }
  });

  // Show recently rated rides
  rides.filter((r) => r.userRating && r.userRating >= 4).slice(0, 2).forEach((r) => {
    items.push({ icon: <FaStar />, bg: '#F5F3FF', msg: `${r.passengerName} gave ${r.userRating}★ — ${r.driver?.name ?? 'driver'}`, time: timeAgo(r.requestedAt), ts: r.requestedAt.getTime() });
  });

  const sorted = items.sort((a, b) => b.ts - a.ts).slice(0, 6);

  // Fallback if no real activity yet
  const display = sorted.length > 0 ? sorted : [
    { icon: <FaMotorcycle />, bg: '#EFF6FF', msg: 'No recent activity to display yet.', time: '' },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, textAlign: 'left' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 16 }}>Recent Activity</div>
      <div>
        {display.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < display.length - 1 ? '1px solid #F3F4F6' : 'none', flexWrap: 'wrap' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, color: '#111827' }}>
              {a.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0, fontSize: 13, color: '#111827', textAlign: 'left', wordBreak: 'break-word' }}>{a.msg}</div>
            {a.time && <div style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0, marginLeft: 8 }}>{a.time}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};
