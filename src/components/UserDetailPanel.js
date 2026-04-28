import React from 'react';
import StatusBadge from './StatusBadge';

export default function UserDetailPanel({ user, onClose, onApprove, onReject, actionLoading }) {
  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`;
  const initials = `${(user.firstName || 'U')[0]}${(user.lastName || 'n')[0]}`.toUpperCase();
  const joined = new Date(user.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <>
      <div style={s.backdrop} onClick={onClose} />
      <div style={s.panel}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerTitle}>User Details</div>
          <button style={s.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Profile */}
        <div style={s.profile}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.profileInfo}>
            <div style={s.name}>{fullName}</div>
            <div style={s.email}>{user.email}</div>
            <StatusBadge status={user.status} />
          </div>
        </div>

        <div style={s.divider} />

        {/* Fields */}
        <div style={s.fields}>
          {[
            { label: 'User ID',    value: user.id,       mono: true },
            { label: 'Mobile',     value: user.mobile },
            { label: 'City',       value: user.city },
            { label: 'Joined',     value: joined },
            { label: 'Status',     value: user.status,   mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} style={s.field}>
              <span style={s.fieldLabel}>{label}</span>
              <span style={{ ...s.fieldValue, ...(mono ? s.mono : {}) }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Actions */}
        {user.status === 'PENDING' && (
          <div style={s.actions}>
            <button
              style={{ ...s.actionBtn, ...s.approveBtn }}
              onClick={() => onApprove(user.id)}
              disabled={actionLoading}
            >
              {actionLoading === 'ACTIVE' ? <span style={s.spinner} /> : '✓'} Approve User
            </button>
            <button
              style={{ ...s.actionBtn, ...s.rejectBtn }}
              onClick={() => onReject(user.id)}
              disabled={actionLoading}
            >
              {actionLoading === 'REJECTED' ? <span style={s.spinner} /> : '✕'} Reject User
            </button>
          </div>
        )}

        {user.status === 'ACTIVE' && (
          <div style={s.statusNote}>
            <span style={{ color: '#22c55e', marginRight: 6 }}>✓</span>
            This user is currently active and can access the app.
          </div>
        )}

        {user.status === 'REJECTED' && (
          <div style={{ ...s.statusNote, color: '#f87171', borderColor: 'rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)' }}>
            <span style={{ marginRight: 6 }}>✕</span>
            This user's account has been rejected.
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(4,7,14,0.5)',
    zIndex: 900, backdropFilter: 'blur(2px)',
  },
  panel: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 380, background: '#0b1120',
    borderLeft: '1px solid #1a2d47',
    zIndex: 901, overflowY: 'auto',
    animation: 'slideIn 0.2s ease',
    display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px', borderBottom: '1px solid #1a2d47',
  },
  headerTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#e2eaf5' },
  closeBtn: {
    background: '#101828', border: '1px solid #1a2d47',
    color: '#6a8fad', width: 30, height: 30, borderRadius: 6,
    cursor: 'pointer', fontSize: 12, display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  profile: { padding: '24px 24px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  avatar: {
    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
    background: 'rgba(200,150,12,0.12)', border: '1px solid rgba(200,150,12,0.3)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#e8b84b',
  },
  profileInfo: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  name: { fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16, color: '#e2eaf5' },
  email: { fontSize: 12, color: '#6a8fad', fontFamily: "'DM Mono', monospace", marginBottom: 4 },
  divider: { height: 1, background: '#1a2d47', margin: '0 24px' },
  fields: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  fieldLabel: { fontSize: 11, color: '#304d68', fontFamily: "'DM Mono', monospace", textTransform: 'uppercase', letterSpacing: 1 },
  fieldValue: { fontSize: 13, color: '#e2eaf5', fontWeight: 500, textAlign: 'right', maxWidth: 220, wordBreak: 'break-all' },
  mono: { fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#6a8fad' },
  actions: { padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 },
  actionBtn: {
    padding: '11px 0', borderRadius: 8, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', border: '1px solid', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 7,
    fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
  },
  approveBtn: { background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)', color: '#4ade80' },
  rejectBtn:  { background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' },
  statusNote: {
    margin: '20px 24px',
    padding: '12px 16px', borderRadius: 8,
    background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)',
    fontSize: 12.5, color: '#6a8fad', lineHeight: 1.5,
  },
  spinner: {
    width: 12, height: 12, borderRadius: '50%',
    border: '2px solid currentColor', borderTopColor: 'transparent',
    animation: 'spin 0.7s linear infinite', display: 'inline-block',
  },
};
