import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AdminNotificationService, type AdminNotification} from '../services/notificationService';
import type { Page } from '../types';

export interface AdminToast {
  id: string;
  type: AdminNotification['type'];
  title: string;
  body: string;
  rideId?: string;
  driverId?: string;
  timestamp: number;
}

interface UseAdminNotificationsReturn {
  notifications: AdminNotification[];
  unreadCount: number;
  toasts: AdminToast[];
  permissionStatus: NotificationPermission;
  fcmToken: string | null;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  requestPermission: () => Promise<boolean>;
  handleNotificationAction: (type: string, meta?: { rideId?: string; driverId?: string }, onNavigate?: (page: Page) => void) => void;
}

export function useAdminNotifications(): UseAdminNotificationsReturn {
  const { adminUser } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [toasts, setToasts] = useState<AdminToast[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  const unsubInboxRef = useRef<(() => void) | null>(null);
  const unsubForegroundRef = useRef<(() => void) | null>(null);
  const unsubSwRef = useRef<(() => void) | null>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Toast helpers ────────────────────────────────────────────────────────────

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (notification: Omit<AdminToast, 'id' | 'timestamp'>) => {
      const toast: AdminToast = {
        ...notification,
        id: `toast-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
      };
      setToasts((prev) => [...prev.slice(-2), toast]); // max 3 toasts
      setTimeout(() => dismissToast(toast.id), 6000);
    },
    [dismissToast],
  );

  // ── Navigation action ────────────────────────────────────────────────────────

  const handleNotificationAction = useCallback(
    (
      type: string,
      _meta?: { rideId?: string; driverId?: string },
      onNavigate?: (page: Page) => void,
    ) => {
      if (!onNavigate) return;
      switch (type) {
        case 'ride_request':
          onNavigate('incoming');
          break;
        case 'ride_completed':
        case 'ride_cancelled':
        case 'ride_accepted':
          onNavigate('recent');
          break;
        case 'driver_offline':
        case 'driver_online':
          onNavigate('drivers');
          break;
        case 'new_user':
          onNavigate('passengers');
          break;
        default:
          onNavigate('dashboard');
      }
    },
    [],
  );

  // ── Init FCM ─────────────────────────────────────────────────────────────────

  const initNotifications = useCallback(async () => {
    if (!adminUser?.id) return;

    const currentPermission =
      typeof Notification !== 'undefined' ? Notification.permission : 'denied';
    setPermissionStatus(currentPermission as NotificationPermission);
    if (currentPermission === 'denied') return;

    const token = await AdminNotificationService.requestPermissionAndGetToken(adminUser.id);
    if (token) {
      setFcmToken(token);
      setPermissionStatus('granted');
    }
  }, [adminUser?.id]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!adminUser?.id) return false;
    const token = await AdminNotificationService.requestPermissionAndGetToken(adminUser.id);
    if (token) {
      setFcmToken(token);
      setPermissionStatus('granted');
      return true;
    }
    setPermissionStatus('denied');
    return false;
  }, [adminUser?.id]);

  // ── Main effect: wire up all listeners on login ───────────────────────────────

  useEffect(() => {
    if (!adminUser?.id) {
      unsubInboxRef.current?.();
      unsubForegroundRef.current?.();
      unsubSwRef.current?.();
      setNotifications([]);
      setToasts([]);
      setFcmToken(null);
      return;
    }

    // 1. Init FCM non-blocking
    initNotifications();

    // 2. Firestore inbox subscription
    unsubInboxRef.current = AdminNotificationService.subscribeToNotifications(
      adminUser.id,
      (incoming) => {
        setNotifications((prev) => {
          const prevIds = new Set(prev.map((n) => n.id));
          incoming
            .filter((n) => !n.read && !prevIds.has(n.id))
            .forEach((n) => {
              showToast({
                type: n.type,
                title: n.title,
                body: n.body,
                rideId: n.rideId,
                driverId: n.driverId,
              });
            });
          return incoming;
        });
      },
    );

    // 3. Foreground FCM messages
    unsubForegroundRef.current = AdminNotificationService.onForegroundMessage(
      ({ type, title, body, data }) => {
        showToast({
          type: type as AdminNotification['type'],
          title,
          body,
          rideId: data.rideId,
          driverId: data.driverId,
        });
      },
    );

    // 4. Service-worker click events (background → foreground)
    if ('serviceWorker' in navigator) {
      unsubSwRef.current = AdminNotificationService.listenForSwNotificationClicks((data) => {
        // Navigation is handled by the Header component via onNavigate prop
        console.log('[AdminNotif] SW click:', data);
      });
    }

    return () => {
      unsubInboxRef.current?.();
      unsubForegroundRef.current?.();
      unsubSwRef.current?.();
    };
  }, [adminUser?.id]);

  // ── Mark read helpers ─────────────────────────────────────────────────────────

  const markAsRead = useCallback(
    async (notificationId: string) => {
      if (!adminUser?.id) return;
      await AdminNotificationService.markAsRead(adminUser.id, notificationId);
    },
    [adminUser?.id],
  );

  const markAllAsRead = useCallback(async () => {
    if (!adminUser?.id) return;
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length > 0) {
      await AdminNotificationService.markAllAsRead(adminUser.id, unreadIds);
    }
  }, [adminUser?.id, notifications]);

  return {
    notifications,
    unreadCount,
    toasts,
    fcmToken,
    permissionStatus,
    dismissToast,
    markAsRead,
    markAllAsRead,
    requestPermission,
    handleNotificationAction,
  };
}
