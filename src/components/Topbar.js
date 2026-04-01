import React from 'react';

export default function Topbar({ title, breadcrumb, children }) {
  const now = new Date().toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header style={s.topbar}>
      <div>
        <div style={s.title}>{title}</div>
        {breadcrumb && <div style={s.breadcrumb}>{breadcrumb}</div>}
      </div>
      <div style={s.right}>
        <div style={s.dateBadge}>
          <span style={s.dateIcon}>◷</span>
          <span>{now}</span>
        </div>
        <div style={s.onlineBadge}>
          <span style={s.dot} />
          <span>Live</span>
        </div>
        {children}
      </div>
    </header>
  );
}

const s = {
  topbar: {
    height: 58,
    background: '#0b1120',
    borderBottom: '1px solid #1a2d47',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 28px',
    flexShrink: 0,
  },
  title: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#e2eaf5' },
  breadcrumb: { fontSize: 11, color: '#304d68', fontFamily: "'DM Mono', monospace", marginTop: 2 },
  right: { display: 'flex', alignItems: 'center', gap: 10 },
  dateBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: '#101828', border: '1px solid #1a2d47',
    borderRadius: 8, padding: '5px 12px',
    fontSize: 11, color: '#6a8fad',
    fontFamily: "'DM Mono', monospace",
  },
  dateIcon: { fontSize: 12 },
  onlineBadge: {
    display: 'flex', alignItems: 'center', gap: 6,
    background: 'rgba(34,197,94,0.08)',
    border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: 8, padding: '5px 12px',
    fontSize: 11, color: '#4ade80',
    fontFamily: "'DM Mono', monospace",
  },
  dot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#22c55e', boxShadow: '0 0 5px #22c55e',
    display: 'inline-block',
  },
};
