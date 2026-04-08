import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
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
      setSidebarOpen(e.matches); // auto-open on desktop
    };
    update(mq);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

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
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F3F4F6', fontFamily: "'Segoe UI', system-ui, sans-serif", position: 'relative' }}>

      {/* Mobile overlay — only visible when sidebar is open on mobile */}
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

      {/* Main content — pushed right by sidebar width on desktop only */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          // On desktop the sidebar is always visible and takes 220px
          marginLeft: isDesktop ? SIDEBAR_W : 0,
          transition: 'margin-left 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <Header
          title={pageTitles[currentPage]}
          onMenuClick={() => setSidebarOpen((v) => !v)}
        />
        <div
          style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            // Prevent any child from breaking the page width on mobile
            overflowX: 'hidden',
            boxSizing: 'border-box',
            // A bit more breathing room on wider screens
            maxWidth: '100%',
          }}
        >
          {/* Inner wrapper caps width on very wide displays */}
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
