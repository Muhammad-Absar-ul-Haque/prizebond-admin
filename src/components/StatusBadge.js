import React from 'react';

const config = {
  ACTIVE:   { color: '#4ade80', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)',   dot: '#22c55e', label: 'Active'   },
  PENDING:  { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  dot: '#f59e0b', label: 'Pending'  },
  REJECTED: { color: '#f87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',   dot: '#ef4444', label: 'Rejected' },
};

export default function StatusBadge({ status }) {
  const c = config[status] || config.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 20, padding: '3px 10px',
      fontSize: 11, fontWeight: 600, color: c.color,
      fontFamily: "'DM Mono', monospace", letterSpacing: 0.5,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, boxShadow: `0 0 4px ${c.dot}`, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}
