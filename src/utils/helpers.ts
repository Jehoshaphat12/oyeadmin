import type { VehicleType } from '../types';

export const vehicleIconMap: Record<VehicleType, string> = {
  motor: '🏍',
  delivery: '📦',
  bicycle_delivery: '🚲',
};

export const vehicleLabel: Record<VehicleType, string> = {
  motor: 'Motor',
  delivery: 'Delivery',
  bicycle_delivery: 'Bicycle',
};

// All statuses the OyeRide app can write — including arriving/arrived
export const statusColor: Record<string, { bg: string; text: string; dot: string }> = {
  requesting:  { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  accepted:    { bg: '#DBEAFE', text: '#1E3A5F', dot: '#3B82F6' },
  arriving:    { bg: '#EDE9FE', text: '#4C1D95', dot: '#8B5CF6' }, // driver on the way
  arrived:     { bg: '#F0FDF4', text: '#065F46', dot: '#22C55E' }, // driver at pickup
  in_progress: { bg: '#E0F2FE', text: '#0C4A6E', dot: '#0EA5E9' }, // ride underway
  completed:   { bg: '#D1FAE5', text: '#064E3B', dot: '#10B981' },
  cancelled:   { bg: '#FEE2E2', text: '#7F1D1D', dot: '#EF4444' },
};

export const avatarColors = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

export const timeAgo = (d: Date): string => {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const fmtDate = (d: Date): string =>
  new Intl.DateTimeFormat('en-GH', { dateStyle: 'medium' }).format(d);

/** Safely parse a fare that may arrive as a string or number from Firestore */
export const parseFare = (raw: unknown): number => {
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') return parseFloat(raw) || 0;
  return 0;
};
