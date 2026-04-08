import { Avatar } from '../components/common/Avatar';
import { Stars } from '../components/common/Stars';
import { fmtDate } from '../utils/helpers';
import { usePassengers } from '../hooks/useFirebaseData';

export function PassengersPage() {
  const { passengers, loading } = usePassengers();

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: 0 }}>Registered Passengers</h2>
        <p style={{ color: '#6B7280', fontSize: 13, margin: '3px 0 0' }}>
          {loading ? 'Loading…' : `${passengers.length} passengers registered`}
        </p>
      </div>

      {/* Card list on mobile, table on wider screens */}
      <div style={{ display: 'none' }} className="mobile-cards" />

      {/* Table — horizontal scroll on mobile */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Passenger', 'Phone', 'Rating', 'Rides', 'Joined', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>Loading passengers…</td></tr>
              ) : passengers.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '40px 14px', textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>No passengers found.</td></tr>
              ) : passengers.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < passengers.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Avatar name={p.name} />
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#374151', whiteSpace: 'nowrap' }}>{p.phone}</td>
                  <td style={{ padding: '12px 14px' }}><Stars value={p.rating} /></td>
                  <td style={{ padding: '12px 14px', fontWeight: 700, fontSize: 13, color: '#111827' }}>{p.totalRides ?? 0}</td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>{fmtDate(p.createdAt)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ background: p.fcmToken ? '#D1FAE5' : '#FEE2E2', color: p.fcmToken ? '#065F46' : '#7F1D1D', borderRadius: 20, padding: '3px 9px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {p.fcmToken ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
