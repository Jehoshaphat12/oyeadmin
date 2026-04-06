import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BootScreen } from './pages/BootScreen';
import { LoginPage } from './pages/LoginPage';
import { Layout } from './components/layout/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { PassengersPage } from './pages/PassengersPage';
import { DriversPage } from './pages/DriversPage';
import { RidesTablePage } from './pages/RidesTablePage';
import { IncomingRidesPage } from './pages/IncomingRidesPage';
import { useRecentRides, useRideHistory } from './hooks/useFirebaseData';
import type { Page } from './types';

// ─── Inner app — only renders when authenticated ───────────────────────────
function AuthenticatedApp() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const { rides: recentRides, loading: recentLoading } = useRecentRides();
  const { rides: historyRides, loading: historyLoading } = useRideHistory();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':  return <DashboardPage />;
      case 'passengers': return <PassengersPage />;
      case 'drivers':    return <DriversPage />;
      case 'history':
        return (
          <RidesTablePage
            rides={historyRides}
            title="Ride History"
            subtitle={`${historyRides.length} completed and cancelled rides`}
            loading={historyLoading}
          />
        );
      case 'recent':
        return (
          <RidesTablePage
            rides={recentRides}
            title="Recent Rides"
            subtitle={`${recentRides.length} rides — latest activity across the platform`}
            loading={recentLoading}
          />
        );
      case 'incoming': return <IncomingRidesPage />;
      default:         return <DashboardPage />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

// ─── Auth gate — reads context and switches between screens ───────────────
function AuthGate() {
  const { status } = useAuth();

  if (status === 'loading')        return <BootScreen />;
  if (status === 'not-admin')      return <LoginPage notAdmin />;
  if (status === 'unauthenticated') return <LoginPage />;
  return <AuthenticatedApp />;
}

// ─── Root — wraps everything in the auth provider ─────────────────────────
function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;
