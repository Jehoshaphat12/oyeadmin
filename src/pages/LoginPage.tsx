import React, { useState, useRef } from 'react';
import { FaMotorcycle, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC<{ notAdmin?: boolean }> = ({ notAdmin = false }) => {
  const { signIn, status } = useAuth();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState(notAdmin ? 'This account does not have admin access.' : '');
  const [loading, setLoading]     = useState(false);
  const emailRef                  = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setError('');
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err: any) {
      setError(err.message ?? 'Sign-in failed.');
      setLoading(false);
    }
  };

  const busy = loading || status === 'loading';

  // ── Shared input style ─────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    fontSize: 14,
    border: '1px solid #D1D5DB',
    borderRadius: 10,
    outline: 'none',
    background: '#fff',
    color: '#111827',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #111827 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Decorative background pattern */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              borderRadius: '50%',
              background: 'rgba(245,158,11,0.04)',
              width: `${200 + i * 120}px`,
              height: `${200 + i * 120}px`,
              top: `${10 + i * 8}%`,
              left: `${-5 + i * 15}%`,
              border: '1px solid rgba(245,158,11,0.06)',
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 20,
          padding: '40px 36px 36px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: '#F59E0B',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
            }}
          >
            <FaMotorcycle size={26} color="#fff" />
          </div>
          <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            Oye Rides
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7280' }}>Admin Console — sign in to continue</p>
        </div>

        {/* Not-admin banner */}
        {notAdmin && !error && (
          <div
            style={{
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              color: '#92400E',
              marginBottom: 20,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1.3 }}>⚠️</span>
            <span>This account does not have admin access. Please sign in with an admin account.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, textAlign: 'left' }}>
              Email address
            </label>
            <input
              ref={emailRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@oyerides.com"
              autoComplete="username"
              disabled={busy}
              required
              style={{
                ...inputStyle,
                borderColor: error ? '#EF4444' : '#D1D5DB',
                opacity: busy ? 0.7 : 1,
              }}
              onFocus={(e) => (e.target.style.borderColor = '#F59E0B')}
              onBlur={(e) => (e.target.style.borderColor = error ? '#EF4444' : '#D1D5DB')}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6, textAlign: 'left' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={busy}
                required
                style={{
                  ...inputStyle,
                  paddingRight: 44,
                  borderColor: error ? '#EF4444' : '#D1D5DB',
                  opacity: busy ? 0.7 : 1,
                }}
                onFocus={(e) => (e.target.style.borderColor = '#F59E0B')}
                onBlur={(e) => (e.target.style.borderColor = error ? '#EF4444' : '#D1D5DB')}
              />
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPass ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: 8,
                padding: '10px 12px',
                fontSize: 13,
                color: '#B91C1C',
                marginBottom: 16,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 14 }}>✕</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={busy || !email || !password}
            style={{
              width: '100%',
              padding: '12px 0',
              marginTop: error ? 0 : 16,
              fontSize: 14,
              fontWeight: 700,
              color: '#111827',
              background: busy || !email || !password ? '#FCD34D' : '#F59E0B',
              border: 'none',
              borderRadius: 10,
              cursor: busy || !email || !password ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s, transform 0.1s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(245,158,11,0.3)',
            }}
            onMouseEnter={(e) => {
              if (!busy && email && password)
                (e.currentTarget as HTMLButtonElement).style.background = '#D97706';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                busy || !email || !password ? '#FCD34D' : '#F59E0B';
            }}
          >
            {busy ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              'Sign in to Dashboard'
            )}
          </button>
        </form>

        {/* Footer note */}
        <p style={{ textAlign: 'center', margin: '24px 0 0', fontSize: 12, color: '#9CA3AF' }}>
          Access restricted to admin accounts only.
        </p>
      </div>
    </div>
  );
};

// ── Tiny inline spinner ────────────────────────────────────────────────────────
const Spinner: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    style={{ animation: 'spin 0.8s linear infinite' }}
  >
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <circle cx="8" cy="8" r="6" fill="none" stroke="#111827" strokeWidth="2" strokeOpacity="0.25" />
    <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
