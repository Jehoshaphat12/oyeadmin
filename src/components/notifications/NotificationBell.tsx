import React, { useState, useEffect, useRef } from 'react';
import {
  FaBell,
  FaCar,
  FaTimes,
  FaCheckCircle,
  FaCommentAlt,
  FaStar,
  FaUserPlus,
  FaWifi,
} from 'react-icons/fa';
import type { AdminNotification, AdminNotificationType } from '../../services/notificationService';

// ─── Type → display config ───────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  AdminNotificationType | 'default',
  { Icon: React.ElementType; color: string; bg: string }
> = {
  ride_request:   { Icon: FaCar,        color: '#6366F1', bg: '#EEF2FF' },
  ride_accepted:  { Icon: FaCheckCircle, color: '#10B981', bg: '#ECFDF5' },
  ride_completed: { Icon: FaCheckCircle, color: '#F59E0B', bg: '#FFFBEB' },
  ride_cancelled: { Icon: FaTimes,       color: '#EF4444', bg: '#FEF2F2' },
  driver_offline: { Icon: FaWifi,        color: '#9CA3AF', bg: '#F3F4F6' },
  driver_online:  { Icon: FaWifi,        color: '#10B981', bg: '#ECFDF5' },
  new_user:       { Icon: FaUserPlus,    color: '#3B82F6', bg: '#EFF6FF' },
  default:        { Icon: FaBell,        color: '#6B7280', bg: '#F3F4F6' },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(ts: any): string {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return d.toLocaleDateString('en-GH', { day: '2-digit', month: 'short' });
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  unreadCount: number;
  notifications: AdminNotification[];
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onAction: (type: string, meta?: { rideId?: string; driverId?: string }) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const NotificationBell: React.FC<Props> = ({
  unreadCount,
  notifications,
  onMarkAllRead,
  onMarkRead,
  onAction,
}) => {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div style={{ position: 'relative' }} ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: open ? '#E5E7EB' : '#F3F4F6',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'background 0.15s',
        }}
        title="Notifications"
      >
        <FaBell size={15} color={open ? '#374151' : '#6B7280'} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 5,
              right: 5,
              minWidth: 14,
              height: 14,
              borderRadius: 7,
              background: '#EF4444',
              border: '2px solid #fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              fontWeight: 800,
              color: '#fff',
              lineHeight: 1,
              padding: '0 2px',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: 340,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            border: '1px solid #E5E7EB',
            zIndex: 9999,
            overflow: 'hidden',
            animation: 'notifFadeIn 0.15s ease',
          }}
        >
          <style>{`
            @keyframes notifFadeIn {
              from { opacity: 0; transform: translateY(-6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px 10px',
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: '#EEF2FF',
                    color: '#6366F1',
                    fontSize: 11,
                    fontWeight: 700,
                    padding: '2px 7px',
                    borderRadius: 10,
                  }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => { onMarkAllRead(); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366F1',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '2px 6px',
                  borderRadius: 6,
                }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '32px 20px',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    background: '#F3F4F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FaBell size={22} color="#D1D5DB" />
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', margin: 0 }}>
                  All caught up
                </p>
                <p style={{ fontSize: 12, color: '#9CA3AF', margin: 0, textAlign: 'center' }}>
                  New ride requests and alerts will appear here
                </p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.default;
                const { Icon } = cfg;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      onMarkRead(n.id);
                      onAction(n.type, { rideId: n.rideId, driverId: n.driverId });
                      setOpen(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '11px 14px',
                      border: 'none',
                      borderBottom:
                        i < notifications.length - 1 ? '1px solid #F9FAFB' : 'none',
                      background: n.read ? 'transparent' : cfg.bg,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = '#F9FAFB')
                    }
                    onMouseLeave={(e) =>
                      ((e.currentTarget as HTMLElement).style.background = n.read
                        ? 'transparent'
                        : cfg.bg)
                    }
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        background: cfg.color + '1A',
                        border: `1.5px solid ${cfg.color}30`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} color={cfg.color} />
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 6,
                          marginBottom: 2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: n.read ? 500 : 700,
                            color: '#111827',
                            flex: 1,
                          }}
                        >
                          {n.title}
                        </span>
                        <span style={{ fontSize: 10, color: '#9CA3AF', flexShrink: 0 }}>
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: 11,
                          color: '#6B7280',
                          margin: 0,
                          lineHeight: 1.45,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {n.body}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          background: cfg.color,
                          flexShrink: 0,
                          marginTop: 5,
                        }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer — only if there are notifications */}
          {notifications.length > 0 && (
            <div
              style={{
                borderTop: '1px solid #F3F4F6',
                padding: '8px 14px',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                Showing latest {notifications.length} notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
