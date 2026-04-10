import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
  doc,
} from 'firebase/firestore';
import app, { firestore } from '../lib/firebase';

// Replace with your actual VAPID key from:
// Firebase Console → Project Settings → Cloud Messaging → Web Push certificates
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'YOUR_VAPID_KEY_HERE';

export type AdminNotificationType =
  | 'ride_request'
  | 'ride_accepted'
  | 'ride_completed'
  | 'ride_cancelled'
  | 'driver_offline'
  | 'driver_online'
  | 'new_user';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  body: string;
  rideId?: string;
  driverId?: string;
  passengerId?: string;
  read: boolean;
  createdAt: any;
}

export class AdminNotificationService {
  private static messagingInstance: any = null;

  static async isMessagingSupported(): Promise<boolean> {
    try {
      return await isSupported();
    } catch {
      return false;
    }
  }

  /**
   * Request browser notification permission and register FCM token.
   * Saves the token to the admin's Firestore user document so the backend
   * can push notifications directly to this admin browser session.
   */
  static async requestPermissionAndGetToken(adminId: string): Promise<string | null> {
    try {
      const supported = await this.isMessagingSupported();
      if (!supported) {
        console.log('[AdminNotif] FCM not supported in this browser');
        return null;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('[AdminNotif] Notification permission denied');
        return null;
      }

      let swRegistration: ServiceWorkerRegistration | undefined;
      if ('serviceWorker' in navigator) {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      }

      const messaging = getMessaging(app);
      this.messagingInstance = messaging;

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (token) {
        // Save token to admin's user doc so the backend can target this admin
        await updateDoc(doc(firestore, 'users', adminId), {
          fcmToken: token,
          tokenUpdatedAt: new Date(),
        });
        return token;
      }

      return null;
    } catch (error) {
      console.error('[AdminNotif] Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Listen for foreground FCM messages (dashboard tab is focused).
   * Returns an unsubscribe function.
   */
  static onForegroundMessage(
    callback: (payload: { type: string; title: string; body: string; data: any }) => void,
  ): () => void {
    if (!this.messagingInstance) {
      try {
        this.messagingInstance = getMessaging(app);
      } catch {
        return () => {};
      }
    }

    const unsubscribe = onMessage(this.messagingInstance, (payload) => {
      const { title = 'OyeRide Admin', body = '' } = payload.notification || {};
      const data = payload.data || {};
      callback({ type: data.type || '', title, body, data });
    });

    return unsubscribe;
  }

  /**
   * Remove FCM token on logout so stale tokens don't accumulate.
   */
  static async removeToken(adminId: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, 'users', adminId), {
        fcmToken: null,
        tokenUpdatedAt: new Date(),
      });
    } catch (error) {
      console.error('[AdminNotif] Error removing FCM token:', error);
    }
  }

  /**
   * Subscribe to the admin's Firestore notification inbox.
   * Notifications are stored at: users/{adminId}/notifications
   * Returns an unsubscribe function.
   */
  static subscribeToNotifications(
    adminId: string,
    callback: (notifications: AdminNotification[]) => void,
  ): () => void {
    const notifRef = collection(firestore, 'users', adminId, 'notifications');
    const q = query(notifRef, orderBy('createdAt', 'desc'), limit(50));

    return onSnapshot(q, (snapshot) => {
      const notifications: AdminNotification[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<AdminNotification, 'id'>),
      }));
      callback(notifications);
    });
  }

  static async markAsRead(adminId: string, notificationId: string): Promise<void> {
    await updateDoc(
      doc(firestore, 'users', adminId, 'notifications', notificationId),
      { read: true },
    );
  }

  static async markAllAsRead(adminId: string, unreadIds: string[]): Promise<void> {
    await Promise.all(
      unreadIds.map((id) =>
        updateDoc(doc(firestore, 'users', adminId, 'notifications', id), { read: true }),
      ),
    );
  }

  /**
   * Listen for service-worker notification clicks (background → foreground).
   */
  static listenForSwNotificationClicks(callback: (data: any) => void): () => void {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'NOTIFICATION_CLICK') {
        callback(event.data.data);
      }
    };
    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
  }
}
