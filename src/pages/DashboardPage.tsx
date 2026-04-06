import React, { useState } from 'react';
import { FaUsers, FaMotorcycle, FaClock, FaMoneyBillWave } from 'react-icons/fa';
import { StatCard } from '../components/common/StatCard';
import { BarChart } from '../components/dashboard/BarChart';
import { DonutChart } from '../components/dashboard/DonutChart';
import { DriverStatusCard } from '../components/dashboard/DriverStatusCard';
import { TopDriversCard } from '../components/dashboard/TopDriversCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import {
  usePassengers,
  useDrivers,
  useIncomingRides,
  useRecentRides,
  useTodayRevenue,
  useWeeklyStats,
} from '../hooks/useFirebaseData';

export const DashboardPage: React.FC = () => {
  const [chartMode, setChartMode] = useState<'rides' | 'revenue'>('rides');

  const { passengers } = usePassengers();
  const { drivers } = useDrivers();
  const { rides: incoming } = useIncomingRides();
  const { rides: recentRides } = useRecentRides();
  const todayRev = useTodayRevenue();
  const { days: weekDays, loading: weekLoading } = useWeeklyStats();

  const onlineDrivers = drivers.filter((d) => d.isOnline).length;
  const availDrivers  = drivers.filter((d) => d.isOnline && d.isAvailable).length;

  // Derive bar chart arrays from live weekly data
  const barLabels  = weekDays.map((d) => d.label);
  const barRides   = weekDays.map((d) => d.rides);
  const barRevenue = weekDays.map((d) => Math.round(d.revenue));
  const barData    = chartMode === 'rides' ? barRides : barRevenue;
  const maxBar     = Math.max(...barData, 1); // avoid divide-by-zero when all zeros

  // Today is the last element in the sorted 7-day window
  const todayIndex = weekDays.length - 1;

  const weekTotal = barData.reduce((a, b) => a + b, 0);
  const weekAvg   = weekDays.length ? Math.round(weekTotal / weekDays.length) : 0;

  const today = new Date().toLocaleDateString('en-GH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const statCards = [
    {
      icon: <FaUsers />,
      bg: '#EFF6FF',
      num: passengers.length,
      label: 'Registered Passengers',
      change: 'Live from Firestore',
      up: true,
    },
    {
      icon: <FaMotorcycle />,
      bg: '#F5F3FF',
      num: drivers.length,
      label: 'Registered Drivers',
      change: 'Live from Firestore',
      up: true,
    },
    {
      icon: <FaClock />,
      bg: '#FEF3C7',
      num: incoming.length,
      label: 'Incoming Rides',
      change: 'Awaiting a driver',
      up: true,
    },
    {
      icon: <FaMoneyBillWave />,
      bg: '#ECFDF5',
      num: `GH₵${todayRev.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      label: "Revenue Today",
      change: "From completed rides",
      up: true,
    },
  ];

  // Ride type breakdown from last-30 rides snapshot
  const motorCount    = recentRides.filter((r) => r.vehicleType === 'motor').length;
  const deliveryCount = recentRides.filter((r) => r.vehicleType === 'delivery').length;
  const bicycleCount  = recentRides.filter((r) => r.vehicleType === 'bicycle_delivery').length;
  const typeTotal     = motorCount + deliveryCount + bicycleCount || 1;
  const rideTypeData  = [
    { label: 'Motor',    percentage: Math.round((motorCount    / typeTotal) * 100), color: '#3B82F6' },
    { label: 'Delivery', percentage: Math.round((deliveryCount / typeTotal) * 100), color: '#10B981' },
    { label: 'Bicycle',  percentage: Math.round((bicycleCount  / typeTotal) * 100), color: '#F59E0B' },
  ];

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Dashboard</h2>
        <p style={{ color: '#6B7280', fontSize: 13, margin: '3px 0 0' }}>{today} — Overview at a glance</p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        {statCards.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>

        {/* Weekly bar chart — real Firestore data */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Weekly Activity</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>
                {weekLoading ? 'Loading…' : 'Last 7 days · live from Firestore'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 2, background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
              {(['rides', 'revenue'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  style={{
                    background: chartMode === m ? '#fff' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    padding: '4px 10px',
                    fontSize: 11,
                    fontWeight: chartMode === m ? 600 : 400,
                    cursor: 'pointer',
                    color: chartMode === m ? '#111827' : '#6B7280',
                    boxShadow: chartMode === m ? '0 1px 3px rgba(0,0,0,.08)' : 'none',
                  }}
                >
                  {m === 'rides' ? 'Rides' : 'Revenue'}
                </button>
              ))}
            </div>
          </div>

          {weekLoading ? (
            <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 13 }}>
              Loading chart…
            </div>
          ) : (
            <BarChart
              data={barData}
              labels={barLabels}
              mode={chartMode}
              maxBar={maxBar}
              todayIndex={todayIndex}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTop: '1px solid #F3F4F6', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>Total this week</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                {chartMode === 'rides'
                  ? `${weekTotal} ride${weekTotal !== 1 ? 's' : ''}`
                  : `GH₵ ${weekTotal.toLocaleString()}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>Daily avg</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                {chartMode === 'rides' ? `${weekAvg} rides` : `GH₵ ${weekAvg.toLocaleString()}`}
              </div>
            </div>
          </div>
        </div>

        {/* Donut — live breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20 }}>
          <DonutChart data={rideTypeData} total={motorCount + deliveryCount + bicycleCount} />
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 20 }}>
        <DriverStatusCard drivers={drivers} onlineDrivers={onlineDrivers} availDrivers={availDrivers} />
        <TopDriversCard drivers={drivers} />
      </div>

      <RecentActivity rides={recentRides} />
    </div>
  );
};
