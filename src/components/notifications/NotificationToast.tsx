import React, { useEffect, useState } from 'react';
import {
  FaBell,
  FaCar,
  FaTimes,
  FaCheckCircle,
  FaWifi,
  FaUserPlus,
} from 'react-icons/fa';
import type { AdminToast } from '../../hooks/useAdminNotifications';
import type { AdminNotificationType } from '../../services/notificationService';

// ─── Type config ─────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AdminNotificationType | 'default',
  { Icon: React.ElementType; accent: string; bg: string; border: string }
> = {
  ride_request:   { Icon: FaCar,         accent: '#6366F1', bg: '#EEF2FF', border: '#6366F1' },
  ride_accepted:  { Icon: FaCheckCircle, accent: '#10B981', bg: '#ECFDF5', border: '#10B981' },
  ride_completed: { Icon: FaCheckCircle, accent: '#F59E0B', bg: '#FFFBEB', border: '#F59E0B' },
  ride_cancelled: { Icon: FaTimes,       accent: '#EF4444', bg: '#FEF2F2', border: '#EF4444' },
  driver_offline: { Icon: FaWifi,        accent: '#9CA3AF', bg: '#F9FAFB', border: '#9CA3AF' },
  driver_online:  { Icon: FaWifi,        accent: '#10B981', bg: '#ECFDF5', border: '#10B981' },
  new_user:       { Icon: FaUserPlus,    accent: '#3B82F6', bg: '#EFF6FF', border: '#3B82F6' },
  default:        { Icon: FaBell,        accent: '#6B7280', bg: '#F9FAFB', border: '#6B7280' },
};

// ─── Single toast item ────────────────────────────────────────────────────────

function ToastItem({
  toast,
  onDismiss,
  onAction,
}: {
  toast: AdminToast;
  onDismiss: (id: string) => void;
  onAction?: (type: string, meta?: { rideId?: string; driverId?: string }) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const cfg = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.default;
  const { Icon } = cfg;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 280);
  };

  const handleTap = () => {
    onAction?.(toast.type, { rideId: toast.rideId, driverId: toast.driverId });
    handleDismiss();
  };

  const isActionable = [
    'ride_request',
    'ride_accepted',
    'ride_completed',
    'ride_cancelled',
    'driver_offline',
  ].includes(toast.type);

  return (
    <div
      style={{
        background: cfg.bg,
        borderLeft: `4px solid ${cfg.border}`,
        borderRadius: 10,
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        display: 'flex',
        alignItems: 'flex-start',
        overflow: 'hidden',
        transform: visible && !exiting ? 'translateX(0) scale(1)' : 'translateX(40px) scale(0.96)',
        opacity: visible && !exiting ? 1 : 0,
        transition: exiting
          ? 'all 0.28s cubic-bezier(0.4,0,0.6,1)'
          : 'all 0.32s cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: 'all',
      }}
    >
      <button
        onClick={handleTap}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
          padding: '11px 8px 11px 12px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Icon pill */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: cfg.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={14} color="#fff" />
        </div>

        {/* Text */}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.3,
              marginBottom: 2,
            }}
          >
            {toast.title}
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#6B7280',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {toast.body}
          </div>
          {isActionable && (
            <div style={{ fontSize: 10, fontWeight: 700, color: cfg.accent, marginTop: 3 }}>
              Click to view →
            </div>
          )}
        </div>
      </button>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        style={{
          padding: '12px 10px 10px 4px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'flex-start',
          flexShrink: 0,
          color: '#9CA3AF',
        }}
      >
        <FaTimes size={11} />
      </button>
    </div>
  );
}

// ─── Container ───────────────────────────────────────────────────────────────

interface Props {
  toasts: AdminToast[];
  onDismiss: (id: string) => void;
  onAction?: (type: string, meta?: { rideId?: string; driverId?: string }) => void;
}

export const NotificationToastContainer: React.FC<Props> = ({ toasts, onDismiss, onAction }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 62,
        right: 16,
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: 300,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} onAction={onAction} />
      ))}
    </div>
  );
};
