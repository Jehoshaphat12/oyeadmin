import React from 'react';
import { FaMotorcycle, FaUsers, FaChartBar, FaHistory, FaClock, FaUser } from 'react-icons/fa';
import { useIncomingRides } from '../../hooks/useFirebaseData';
import type { Page } from '../../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
  { id: 'incoming', label: 'Incoming Rides', icon: <FaClock /> },
  { id: 'recent', label: 'Recent Rides', icon: <FaHistory /> },
  { id: 'history', label: 'Ride History', icon: <FaHistory /> },
  { id: 'drivers', label: 'Drivers', icon: <FaMotorcycle /> },
  { id: 'passengers', label: 'Passengers', icon: <FaUsers /> },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen }) => {
  const { rides: incomingRides } = useIncomingRides();

  return (
    <aside
      style={{
        width: 220,
        background: '#111827',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100%',
        zIndex: 200,
        transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-220px)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaMotorcycle size={18} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff' }}>Oye Rides</div>
            <div style={{ fontSize: 10, color: '#9CA3AF' }}>Admin Console</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ padding: '0 10px', flex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 6px 8px', textAlign: 'left' }}>
          Menu
        </div>
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => onNavigate(n.id)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '9px 10px',
              borderRadius: 7,
              border: 'none',
              cursor: 'pointer',
              marginBottom: 2,
              textAlign: 'left',
              fontSize: 13,
              background: currentPage === n.id ? '#1F2937' : 'transparent',
              color: currentPage === n.id ? '#F59E0B' : '#9CA3AF',
              fontWeight: currentPage === n.id ? 600 : 400,
            }}
          >
            <span style={{ fontSize: 14, flexShrink: 0 }}>{n.icon}</span>
            {n.label}
            {n.id === 'incoming' && incomingRides.length > 0 && (
              <span style={{ marginLeft: 'auto', background: '#F59E0B', color: '#111827', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>
                {incomingRides.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #1F2937', margin: '0 10px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaUser size={12} color="#E5E7EB" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#E5E7EB' }}>Admin</div>
            <div style={{ fontSize: 10, color: '#9CA3AF' }}>admin@oyerides.com</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
