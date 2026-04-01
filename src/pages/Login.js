import React, { useState } from 'react';

// Mock admin credentials — replace with real API call
const MOCK_ADMIN = { email: 'admin@prizebond.pk', password: 'admin123' };

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [fieldErr, setFieldErr] = useState({});

  const validate = () => {
    const e = {};
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (!password || password.length < 4) e.password = 'Password is required';
    setFieldErr(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await delay(900); // simulate network

      // ── MOCK CHECK ──────────────────────────────────────────
      if (email !== MOCK_ADMIN.email || password !== MOCK_ADMIN.password) {
        throw new Error('Invalid credentials. Please try again.');
      }
      const fakeToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('token', fakeToken);
      localStorage.setItem('admin', JSON.stringify({ email, name: 'Super Admin' }));
      onLogin();

      /* ── REAL API — uncomment when backend ready ─────────────
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin: password }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      if (data.user.role !== 'ADMIN') throw new Error('Access denied. Admin only.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('admin', JSON.stringify(data.user));
      onLogin();
      ── END REAL API ────────────────────────────────────────── */

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFieldErr = (field) => setFieldErr((p) => ({ ...p, [field]: '' }));

  return (
    <div style={s.page}>
      {/* Background grid pattern */}
      <div style={s.gridBg} />

      {/* Glow orbs */}
      <div style={s.orb1} />
      <div style={s.orb2} />

      {/* Card */}
      <div style={s.card}>

        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>🏆</div>
          <div style={s.logoText}>PrizeBond PK</div>
          <div style={s.logoSub}>ADMIN CONSOLE</div>
        </div>

        {/* Divider */}
        <div style={s.dividerRow}>
          <div style={s.dividerLine} />
          <span style={s.dividerLabel}>SIGN IN</span>
          <div style={s.dividerLine} />
        </div>

        {/* Error banner */}
        {error && (
          <div style={s.errorBanner}>
            <span style={s.errorIcon}>⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={s.form} noValidate>

          {/* Email */}
          <div style={s.group}>
            <label style={s.label}>Email Address</label>
            <div style={{ ...s.inputWrap, ...(fieldErr.email ? s.inputWrapErr : {}) }}>
              <span style={s.inputIcon}>@</span>
              <input
                style={s.input}
                type="email"
                placeholder="admin@prizebond.pk"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearFieldErr('email'); setError(''); }}
                autoComplete="email"
                autoFocus
              />
            </div>
            {fieldErr.email && <span style={s.fieldErr}>{fieldErr.email}</span>}
          </div>

          {/* Password */}
          <div style={s.group}>
            <label style={s.label}>Password</label>
            <div style={{ ...s.inputWrap, ...(fieldErr.password ? s.inputWrapErr : {}) }}>
              <span style={s.inputIcon}>◈</span>
              <input
                style={s.input}
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldErr('password'); setError(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowPass((p) => !p)}
                tabIndex={-1}
              >
                {showPass ? '○' : '●'}
              </button>
            </div>
            {fieldErr.password && <span style={s.fieldErr}>{fieldErr.password}</span>}
          </div>

          {/* Submit */}
          <button type="submit" style={s.submitBtn} disabled={loading}>
            {loading ? (
              <span style={s.spinnerWrap}>
                <span style={s.spinner} />
                Authenticating…
              </span>
            ) : (
              <span>Sign In to Admin Panel →</span>
            )}
          </button>
        </form>

        {/* Hint */}
        <div style={s.hint}>
          <div style={s.hintTitle}>🧪 Test Credentials</div>
          <div style={s.hintRow}>
            <span style={s.hintKey}>Email</span>
            <span style={s.hintVal}>admin@prizebond.pk</span>
          </div>
          <div style={s.hintRow}>
            <span style={s.hintKey}>Password</span>
            <span style={s.hintVal}>admin123</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={s.footer}>PrizeBond PK Admin Console · All rights reserved</div>
    </div>
  );
}

const s = {
  page: {
    minHeight: '100vh',
    background: '#07090f',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    position: 'relative',
    overflow: 'hidden',
  },

  /* Subtle grid overlay */
  gridBg: {
    position: 'absolute', inset: 0,
    backgroundImage: `
      linear-gradient(rgba(26,45,71,0.25) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,45,71,0.25) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
  },

  /* Ambient glow orbs */
  orb1: {
    position: 'absolute', top: '-10%', left: '-5%',
    width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(200,150,12,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', bottom: '-10%', right: '-5%',
    width: 400, height: 400, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  card: {
    width: '100%',
    maxWidth: 420,
    background: '#0b1120',
    border: '1px solid #1a2d47',
    borderRadius: 18,
    padding: '36px 32px',
    boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(200,150,12,0.04)',
    position: 'relative',
    zIndex: 1,
    animation: 'fadeIn 0.3s ease',
  },

  logoWrap: { textAlign: 'center', marginBottom: 24 },
  logoIcon: { fontSize: 48, marginBottom: 10 },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800, fontSize: 24,
    color: '#e8b84b', letterSpacing: 2,
  },
  logoSub: {
    fontSize: 9, letterSpacing: 4,
    color: '#304d68', fontFamily: "'DM Mono', monospace",
    marginTop: 5,
  },

  dividerRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 22,
  },
  dividerLine: { flex: 1, height: 1, background: '#1a2d47' },
  dividerLabel: {
    fontSize: 9, letterSpacing: 3,
    color: '#304d68', fontFamily: "'DM Mono', monospace",
    fontWeight: 600,
  },

  errorBanner: {
    display: 'flex', alignItems: 'center', gap: 9,
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: 8, padding: '10px 14px',
    marginBottom: 18,
    fontSize: 12.5, color: '#f87171',
    fontFamily: "'DM Sans', sans-serif",
    animation: 'fadeIn 0.2s ease',
  },
  errorIcon: { fontSize: 14, flexShrink: 0 },

  form: { display: 'flex', flexDirection: 'column', gap: 18 },

  group: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: 11, fontWeight: 600,
    color: '#6a8fad', letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: "'DM Mono', monospace",
  },
  inputWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#101828',
    border: '1px solid #1a2d47',
    borderRadius: 10, padding: '0 14px',
    height: 46,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  inputWrapErr: {
    borderColor: 'rgba(239,68,68,0.5)',
    boxShadow: '0 0 0 2px rgba(239,68,68,0.08)',
  },
  inputIcon: {
    color: '#304d68', fontSize: 15,
    flexShrink: 0, userSelect: 'none',
  },
  input: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    color: '#e2eaf5', fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
  },
  eyeBtn: {
    background: 'none', border: 'none',
    color: '#304d68', cursor: 'pointer',
    fontSize: 12, padding: '0 2px',
    flexShrink: 0, transition: 'color 0.15s',
  },
  fieldErr: {
    fontSize: 11, color: '#f87171',
    fontFamily: "'DM Sans', sans-serif",
    marginTop: 2,
  },

  submitBtn: {
    width: '100%', padding: '13px 0',
    borderRadius: 10, border: 'none',
    background: 'linear-gradient(135deg, #c8960c 0%, #e8b84b 100%)',
    color: '#07090f',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800, fontSize: 14,
    letterSpacing: 0.5,
    cursor: 'pointer',
    marginTop: 4,
    transition: 'opacity 0.15s, transform 0.1s',
    boxShadow: '0 4px 20px rgba(200,150,12,0.3)',
  },
  spinnerWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 },
  spinner: {
    width: 14, height: 14, borderRadius: '50%',
    border: '2px solid rgba(7,9,15,0.4)',
    borderTopColor: '#07090f',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },

  hint: {
    marginTop: 22,
    background: '#07090f',
    border: '1px solid #1a2d47',
    borderRadius: 10,
    padding: '12px 16px',
  },
  hintTitle: {
    fontSize: 11, fontWeight: 600,
    color: '#e8b84b', marginBottom: 8,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 0.5,
  },
  hintRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  hintKey: { fontSize: 10, color: '#304d68', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: 1 },
  hintVal: { fontSize: 11, color: '#6a8fad', fontFamily: "'DM Mono', monospace" },

  footer: {
    marginTop: 24,
    fontSize: 10, color: '#1a2d47',
    fontFamily: "'DM Mono', monospace",
    letterSpacing: 1, textAlign: 'center',
    position: 'relative', zIndex: 1,
  },
};
