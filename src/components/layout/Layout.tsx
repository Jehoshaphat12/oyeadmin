import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NotificationToastContainer } from '../notifications/NotificationToast';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';
import type { Page } from '../../types';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const SIDEBAR_W = 220;

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, onNavigate }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 769px)');
    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(e.matches);
      setSidebarOpen(e.matches);
    };
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // ── Notification hook ──────────────────────────────────────────────────────
  const {
    notifications,
    unreadCount,
    toasts,
    dismissToast,
    markAsRead,
    markAllAsRead,
    handleNotificationAction,
  } = useAdminNotifications();

  const handleNotifAction = (type: string, meta?: { rideId?: string; driverId?: string }) => {
    handleNotificationAction(type, meta, onNavigate);
  };

  // ── Page titles ────────────────────────────────────────────────────────────
  const pageTitles: Record<Page, string> = {
    dashboard:  'Dashboard',
    incoming:   'Incoming Rides',
    recent:     'Recent Rides',
    history:    'Ride History',
    drivers:    'Drivers',
    passengers: 'Passengers',
  };

  const closeSidebar = () => { if (!isDesktop) setSidebarOpen(false); };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F3F4F6',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        position: 'relative',
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && !isDesktop && (
        <div
          onClick={closeSidebar}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 190 }}
        />
      )}

      <Sidebar
        currentPage={currentPage}
        onNavigate={(p) => { onNavigate(p); closeSidebar(); }}
        isOpen={sidebarOpen}
      />

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: isDesktop ? SIDEBAR_W : 0,
          transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Header
          title={pageTitles[currentPage]}
          onMenuClick={() => setSidebarOpen((v) => !v)}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllAsRead}
          onMarkRead={markAsRead}
          onNotificationAction={handleNotifAction}
        />

        {/* Toast container — sits in top-right corner, above content */}
        <NotificationToastContainer
          toasts={toasts}
          onDismiss={dismissToast}
          onAction={handleNotifAction}
        />

        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            maxWidth: '100%',
          }}
        >
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>{children}</div>
        </div>
      </div>
    </div>
  );
};
